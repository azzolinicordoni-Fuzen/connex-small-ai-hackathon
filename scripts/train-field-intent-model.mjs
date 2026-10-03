#!/usr/bin/env node
// Hack-Nation 2026 — Connex Field: reproducible training of the on-device intent model.
// Usage: node scripts/train-field-intent-model.mjs
// Deterministic: no randomness; folds are assigned by index. Evaluation data is never used for training or tuning.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";
import { extractFeatures } from "../src/field/ai/features.js";
import { prepare, predictProba, decide, detectLang, OOD } from "../src/field/ai/nb.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const AI = join(root, "src/field/ai");
const MODEL_NAME = "connex-intent";
const MODEL_VERSION = "1.0.0";
const ALPHA = 0.3;
const LANGS = ["en", "pt"];
const read = (p) => JSON.parse(readFileSync(join(AI, p), "utf8"));

function examples(ds) {
  const out = [];
  for (const [id, utts] of Object.entries(ds.intents)) for (const t of utts) out.push({ text: t, y: id });
  for (const t of ds.out_of_domain) out.push({ text: t, y: OOD });
  return out;
}

function train(exs, lang) {
  const classes = [...new Set(exs.map((e) => e.y))].sort();
  const ci = new Map(classes.map((c, i) => [c, i]));
  const docs = new Array(classes.length).fill(0);
  const totals = new Array(classes.length).fill(0);
  const fc = new Map();
  for (const e of exs) {
    const c = ci.get(e.y);
    docs[c]++;
    for (const [k, w] of extractFeatures(e.text, lang)) {
      if (!fc.has(k)) fc.set(k, new Map());
      const m = fc.get(k);
      m.set(c, (m.get(c) || 0) + w);
      totals[c] += w;
    }
  }
  const vocab = [...fc.keys()].sort();
  const r = (x) => Math.round(x * 1000) / 1000;
  return {
    classes, alpha: ALPHA, vocab,
    totals: totals.map(r),
    logPrior: docs.map((d) => r(Math.log(d / exs.length))),
    counts: vocab.map((k) => [...fc.get(k)].sort((a, b) => a[0] - b[0]).map(([c, v]) => [c, r(v)])),
  };
}

// Utility for tuning: right answer +1, right rejection +1, clarify containing truth +0.5, wrong answer -4 (Phase 3.1: a wrong auto-answer costs more than a safe "Did you mean").
function utility(dec, y) {
  if (y === OOD) return dec.kind === "answer" ? -4 : 1;
  if (dec.kind === "answer") return dec.id === y ? 1 : -4;
  if (dec.kind === "clarify") return dec.candidates.some((c) => c.id === y) ? 0.5 : 0;
  return 0;
}

function tune(exs, lang) {
  const K = 5;
  const folds = [...Array(K)].map((_, f) => {
    const tr = exs.filter((_, i) => i % K !== f), te = exs.filter((_, i) => i % K === f);
    return { pm: prepare(train(tr, lang)), te };
  });
  const grid = { scale: [1, 1.5, 2, 3, 4, 6, 8], accept: [0.25, 0.35, 0.45, 0.55], margin: [0.05, 0.1, 0.2], clarify: [0.1, 0.15, 0.2], oodReject: [0.3, 0.4, 0.5], minCoverage: [0.2, 0.3, 0.4, 0.5] };
  let best = null;
  for (const scale of grid.scale) {
    const preds = folds.flatMap(({ pm, te }) => te.map((e) => ({ y: e.y, pred: predictProba(pm, e.text, lang, scale) })));
    for (const accept of grid.accept) for (const margin of grid.margin) for (const clarify of grid.clarify)
      for (const oodReject of grid.oodReject) for (const minCoverage of grid.minCoverage) {
        if (clarify >= accept) continue;
        const th = { accept, margin, clarify, oodReject, minCoverage };
        const u = preds.reduce((s, { y, pred }) => s + utility(decide(pred, th), y), 0);
        if (!best || u > best.u) best = { u, scale, th };
      }
  }
  return best;
}

function evaluate(pm, scale, th, ev, lang, prepared) {
  const confusion = {};
  let correct = 0, answered = 0, wrong = 0, clarified = 0, clarifyHit = 0, fellThrough = 0;
  const errors = [];
  const times = [];
  for (const it of ev.items) {
    const t0 = performance.now();
    const d = decide(predictProba(pm, it.text, lang, scale), th);
    times.push(performance.now() - t0);
    const top1 = d.candidates[0]?.id;
    if (top1 === it.intent) correct++;
    else { errors.push({ text: it.text, expected: it.intent, top1, decision: d.kind }); confusion[`${it.intent}->${top1}`] = (confusion[`${it.intent}->${top1}`] || 0) + 1; }
    if (d.kind === "answer") { answered++; if (d.id !== it.intent) wrong++; }
    else if (d.kind === "clarify") { clarified++; if (d.candidates.some((c) => c.id === it.intent)) clarifyHit++; }
    else fellThrough++;
  }
  let oodRejected = 0, oodAnswered = 0;
  const oodLeaks = [];
  for (const t of ev.out_of_domain) {
    const d = decide(predictProba(pm, t, lang, scale), th);
    if (d.kind === "answer") { oodAnswered++; oodLeaks.push({ text: t, id: d.id }); } else oodRejected++;
  }
  const required = ev.required.map((r) => {
    const detected = detectLang(prepared, r.text, lang);
    const d = decide(predictProba(prepared[detected], r.text, detected, scale), th);
    return { ...r, detected_language: detected, decision: d.kind, id: d.id ?? null, candidates: d.candidates.map((c) => `${c.id}:${c.p.toFixed(2)}`) };
  });
  const n = ev.items.length;
  return {
    in_domain: {
      n, top1_accuracy: +(correct / n).toFixed(4),
      auto_answered: answered, auto_answer_precision: answered ? +((answered - wrong) / answered).toFixed(4) : null, wrong_auto_answers: wrong,
      clarify_shown: clarified, clarify_contains_truth: clarifyHit, not_answered_by_model: fellThrough,
    },
    out_of_domain: { n: ev.out_of_domain.length, not_auto_answered: oodRejected, rejection_rate: +(oodRejected / ev.out_of_domain.length).toFixed(4), leaks: oodLeaks },
    confusion, errors, required,
    mean_inference_ms_node: +(times.reduce((a, b) => a + b, 0) / times.length).toFixed(3),
  };
}

const model = { name: MODEL_NAME, version: MODEL_VERSION, architecture: "multinomial-naive-bayes; word 1-2 grams + char 3-4 grams; length-normalised temperature-scaled softmax", trained_at_note: "deterministic; re-run script to reproduce", languages: {} };
const report = { model: `${MODEL_NAME}-v1`, version: MODEL_VERSION, languages: {} };
const trained = {};
for (const lang of LANGS) {
  const ds = read(`data/intents.${lang}.json`);
  const exs = examples(ds);
  const { scale, th, u } = tune(exs, lang);
  const m = train(exs, lang);
  model.languages[lang] = { ...m, scale, thresholds: th };
  trained[lang] = prepare(model.languages[lang]);
  report.languages[lang] = { training_examples: exs.length, in_domain_training: exs.length - ds.out_of_domain.length, ood_training: ds.out_of_domain.length, vocab_size: m.vocab.length, cv_utility: u, scale, thresholds: th };
}
for (const lang of LANGS) {
  const ev = read(`data/evaluation.${lang}.json`);
  const L = model.languages[lang];
  Object.assign(report.languages[lang], { evaluation: evaluate(trained[lang], L.scale, L.thresholds, ev, lang, trained) });
}
const json = JSON.stringify(model);
writeFileSync(join(AI, "models/connex-intent-v1.json"), json);
report.artifact_bytes = Buffer.byteLength(json);
writeFileSync(join(AI, "models/connex-intent-v1.eval.json"), JSON.stringify(report, null, 1));
console.log(JSON.stringify({ artifact_bytes: report.artifact_bytes, ...Object.fromEntries(LANGS.map((l) => [l, { ...report.languages[l], evaluation: { ...report.languages[l].evaluation, errors: report.languages[l].evaluation.errors.length } }])) }, null, 1));
