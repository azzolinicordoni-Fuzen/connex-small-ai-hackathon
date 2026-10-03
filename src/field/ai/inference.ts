// Hack-Nation 2026 — Connex Field on-device inference orchestrator.
// Order: local ML classifier -> deterministic search fallback -> fixed no-answer message.
// The model only returns FAQ IDs; every displayed answer is the verbatim approved K01–K26 text.
import modelJson from "./models/connex-intent-v1.json";
import evalReport from "./models/connex-intent-v1.eval.json";
import { prepare, predictProba, decide, detectLang } from "./nb.js";
import { FALLBACK_TEXT, faqById, searchFaq, type FaqEntry } from "@/field/search";
import type { FieldLang } from "@/field/i18n";

export type InferenceMethod = "local_ml" | "deterministic_fallback" | "no_match";
export type InferenceResult =
  | { kind: "answer"; entry: FaqEntry; related: FaqEntry[]; method: InferenceMethod; ms: number }
  | { kind: "clarify"; options: FaqEntry[]; method: InferenceMethod; ms: number }
  | { kind: "fallback"; text: string; method: "no_match"; ms: number };

type LangModel = Parameters<typeof prepare>[0];
interface ModelArtifact { name: string; version: string; languages: Record<FieldLang, LangModel & { scale: number; thresholds: Record<string, number> }> }

const ARTIFACT = modelJson as unknown as ModelArtifact;

export const MODEL_INFO = {
  name: ARTIFACT.name,
  version: ARTIFACT.version,
  bytes: (evalReport as { artifact_bytes: number }).artifact_bytes,
};

/** Test hook: set localStorage "connex-field-ai-disabled" = "1" to simulate a model failure. */
const FAIL_KEY = "connex-field-ai-disabled";

let prepared: Record<FieldLang, ReturnType<typeof prepare>> | null = null;
let loadError: unknown = null;

export function loadModel() {
  if (prepared) return prepared;
  try {
    if (typeof localStorage !== "undefined" && localStorage.getItem(FAIL_KEY) === "1") throw new Error("simulated model failure");
    const m = ARTIFACT;
    prepared = { en: prepare(m.languages.en), pt: prepare(m.languages.pt) };
    loadError = null;
  } catch (e) {
    loadError = e;
    prepared = null;
  }
  return prepared;
}

export function modelReady() {
  return !!loadModel();
}
export const modelError = () => loadError;

/** Resets the cached model (used by tests and the failure toggle). */
export function resetModel() {
  prepared = null;
  loadError = null;
}

const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

function related(entry: FaqEntry, lang: FieldLang, ids: string[]) {
  const out = ids.filter((id) => id !== entry.id).map((id) => faqById(id, lang));
  return out.slice(0, 3);
}

export function answerQuestion(query: string, lang: FieldLang): InferenceResult {
  const t0 = now();
  const ms = () => Math.round((now() - t0) * 100) / 100;
  const models = loadModel();
  if (models) {
    try {
      const qLang = detectLang(models, query, lang) as FieldLang;
      const L = ARTIFACT.languages[qLang];
      const d = decide(predictProba(models[qLang], query, qLang, L.scale), L.thresholds as never);
      // Answers are always rendered in the interface language (same stable ID).
      if (d.kind === "answer") {
        const entry = faqById(d.id, lang);
        return { kind: "answer", entry, related: related(entry, lang, d.candidates.map((c) => c.id)), method: "local_ml", ms: ms() };
      }
      if (d.kind === "clarify") return { kind: "clarify", options: d.candidates.map((c) => faqById(c.id, lang)), method: "local_ml", ms: ms() };
      if (d.kind === "reject") return { kind: "fallback", text: FALLBACK_TEXT[lang], method: "no_match", ms: ms() };
      // "uncertain" -> deterministic fallback below.
    } catch (e) {
      loadError = e;
    }
  }
  const r = searchFaq(query, lang);
  if (r.kind === "answer") return { kind: "answer", entry: r.entry, related: r.related, method: "deterministic_fallback", ms: ms() };
  if (r.kind === "clarify") return { kind: "clarify", options: r.options, method: "deterministic_fallback", ms: ms() };
  return { kind: "fallback", text: FALLBACK_TEXT[lang], method: "no_match", ms: ms() };
}
