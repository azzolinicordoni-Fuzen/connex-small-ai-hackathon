// Hack-Nation 2026 — Multinomial Naive Bayes inference over the compact artifact.
// Shared by the training script (for evaluation) and the browser runtime.
import { extractFeatures } from "./features.js";

export const OOD = "__ood__";

/** Prepares a language model from the artifact for fast scoring. */
export function prepare(m) {
  const C = m.classes.length;
  const denom = m.totals.map((t) => Math.log(t + m.alpha * m.vocab.length));
  const index = new Map(m.vocab.map((v, i) => [v, i]));
  return { ...m, C, denom, index };
}

/** Returns classes sorted by calibrated probability plus feature coverage. */
export function predictProba(pm, text, lang, scale) {
  const feats = extractFeatures(text, lang);
  const ll = new Float64Array(pm.C);
  let wSum = 0, wKnown = 0;
  for (const [k, w] of feats) {
    wSum += w;
    const i = pm.index.get(k);
    if (i === undefined) continue;
    wKnown += w;
    const row = pm.counts[i]; // [[classIdx, count], ...]
    const map = new Map(row);
    for (let c = 0; c < pm.C; c++) ll[c] += w * (Math.log((map.get(c) || 0) + pm.alpha) - pm.denom[c]);
  }
  const coverage = wSum ? wKnown / wSum : 0;
  const nWords = [...feats.keys()].filter((k) => k.startsWith("w:")).length;
  // Length-normalised log-likelihood, then temperature-scaled softmax (calibration).
  const s = Array.from(ll, (v, c) => pm.logPrior[c] + (wKnown ? v / wKnown : 0) * scale);
  const mx = Math.max(...s);
  const ex = s.map((v) => Math.exp(v - mx));
  const z = ex.reduce((a, b) => a + b, 0);
  const ranked = ex.map((e, c) => ({ id: pm.classes[c], p: e / z })).sort((a, b) => b.p - a.p);
  return { ranked, coverage, nWords };
}

/**
 * Applies the calibrated acceptance policy.
 * answer   -> confident in-domain intent
 * clarify  -> plausible but close candidates (max three)
 * reject   -> model confident the question is out of domain
 * uncertain-> nothing reliable; caller runs the deterministic fallback
 */
export function decide(pred, th) {
  const inDomain = pred.ranked.filter((r) => r.id !== OOD);
  const top = pred.ranked[0];
  if (pred.coverage < th.minCoverage) {
    // Many unknown features (e.g. heavy misspelling): never auto-answer, but offer a strong candidate.
    const a0 = inDomain[0];
    if (top.id !== OOD && a0.p >= th.accept) return { kind: "clarify", candidates: inDomain.filter((r) => r.p >= th.clarify * 0.5).slice(0, 3) };
    return { kind: "uncertain", candidates: inDomain.slice(0, 3) };
  }
  if (top.id === OOD && top.p >= th.oodReject) return { kind: "reject", candidates: inDomain.slice(0, 3) };
  const [a, b] = inDomain;
  // Single-word questions are under-specified: prefer "Did you mean" when another intent is plausible.
  const shortQ = pred.nWords < 2 && b && b.p >= th.clarify * 0.5;
  if (!shortQ && a.p >= th.accept && a.p - (b ? b.p : 0) >= th.margin && top.id !== OOD) return { kind: "answer", id: a.id, candidates: inDomain.slice(0, 3) };
  if (a.p >= th.clarify) {
    const opts = inDomain.filter((r) => r.p >= th.clarify * 0.5).slice(0, 3);
    if (opts.length >= 2) return { kind: "clarify", candidates: opts };
    if (!shortQ && top.id !== OOD && a.p >= th.accept) return { kind: "answer", id: a.id, candidates: inDomain.slice(0, 3) };
  }
  return { kind: "uncertain", candidates: inDomain.slice(0, 3) };
}

/** Lightweight language detection: share of word unigrams known by each vocabulary. */
export function detectLang(prepared, text, fallback) {
  const best = { lang: fallback, score: -1 };
  for (const [lang, pm] of Object.entries(prepared)) {
    const feats = [...extractFeatures(text, lang).keys()].filter((k) => k.startsWith("w:"));
    if (!feats.length) continue;
    const sc = feats.filter((k) => pm.index.has(k)).length / feats.length;
    if (sc > best.score + 0.15 || (Math.abs(sc - best.score) <= 0.15 && lang === fallback)) { best.lang = lang; best.score = Math.max(sc, best.score); }
  }
  return best.lang;
}
