// Hack-Nation 2026 — Connex Field deterministic offline search (fallback layer).
// Returns exactly one approved stored answer, never composes text, never calls any API.
// Phase 3 may add semantic ranking on top; this module must remain as the fallback.
import faqEn from "@/content/field/faq.en.json";
import faqPt from "@/content/field/faq.pt.json";
import type { FieldLang } from "./i18n";

export interface FaqEntry {
  id: string; content_version: string; language: string; question: string; approved_answer: string;
  tags: string[]; synonyms: string[]; category: string; references: number[];
}

export const FAQ: Record<FieldLang, FaqEntry[]> = { en: faqEn as FaqEntry[], pt: faqPt as FaqEntry[] };

export const FALLBACK_TEXT: Record<FieldLang, string> = {
  en: "No validated answer. Ask again when connected.",
  pt: "Sem resposta validada. Pergunte após conectar.",
};

export const SCORE_THRESHOLD = 3.5;
export const AMBIGUITY_RATIO = 0.85;

const STOP = new Set(
  ("a an the is are was be do does did i my me you your it of to in on for and or what how who which when where why can could will would " +
    "should there this that with from about if any much many o a os as um uma de da do das dos e em no na nos nas para por que qual quais " +
    "como quem quando onde eu meu minha voce se ser sao tem ter ja isso esse essa com sobre mais muito").split(" "),
);

export function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}
export const tokenize = (s: string) => normalize(s).split(" ").filter((t) => t.length > 1 && !STOP.has(t));

function lev1(a: string, b: string) {
  // true when edit distance <= 1
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

function tokenMatch(qt: string, target: string) {
  if (qt === target) return 1;
  if (qt.length >= 5 && target.length >= 5 && (target.startsWith(qt.slice(0, 5)) || lev1(qt, target))) return 0.7;
  return 0;
}

function bestTokenScore(qt: string, targets: string[]) {
  let best = 0;
  for (const t of targets) best = Math.max(best, tokenMatch(qt, t));
  return best;
}

export function scoreEntry(query: string, e: FaqEntry) {
  const qn = ` ${normalize(query)} `;
  const qTokens = tokenize(query);
  const questionTokens = tokenize(e.question);
  const tagTokens = e.tags.flatMap(tokenize);
  const synTokens = e.synonyms.flatMap(tokenize);
  let score = 0;
  // Exact phrase matches of multi-word tags/synonyms.
  for (const p of [...e.tags, ...e.synonyms]) {
    const pn = normalize(p);
    if (pn.includes(" ") && qn.includes(` ${pn} `)) score += 4;
  }
  for (const t of qTokens) {
    score += 3 * bestTokenScore(t, questionTokens) + 2 * bestTokenScore(t, tagTokens) + 1.5 * bestTokenScore(t, synTokens);
  }
  return score;
}

export type SearchResult =
  | { kind: "answer"; entry: FaqEntry; score: number; related: FaqEntry[] }
  | { kind: "clarify"; options: FaqEntry[] }
  | { kind: "fallback"; text: string };

export function searchFaq(query: string, lang: FieldLang): SearchResult {
  const entries = FAQ[lang];
  const ranked = entries.map((e) => ({ e, s: scoreEntry(query, e) })).filter((r) => r.s > 0).sort((a, b) => b.s - a.s);
  const top = ranked[0];
  if (!top || top.s + 1e-9 < SCORE_THRESHOLD) return { kind: "fallback", text: FALLBACK_TEXT[lang] };
  const second = ranked[1];
  if (second && second.s >= top.s * AMBIGUITY_RATIO) {
    return { kind: "clarify", options: ranked.filter((r) => r.s >= top.s * AMBIGUITY_RATIO).slice(0, 3).map((r) => r.e) };
  }
  const related = ranked.slice(1).filter((r) => r.s >= SCORE_THRESHOLD / 2).map((r) => r.e);
  for (const e of entries) if (related.length < 3 && e.id !== top.e.id && e.category === top.e.category && !related.includes(e)) related.push(e);
  return { kind: "answer", entry: top.e, score: top.s, related: related.slice(0, 3) };
}

export const faqById = (id: string, lang: FieldLang) => FAQ[lang].find((e) => e.id === id)!;
