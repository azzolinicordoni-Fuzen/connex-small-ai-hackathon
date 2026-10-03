// Hack-Nation 2026 — Connex Field Phase 3 tests: on-device intent model, fallback, pathways.
// Run: bun test ./tests/field-ai.test.ts
import { describe, expect, test, beforeEach } from "bun:test";
import { readFileSync, statSync } from "node:fs";
import { answerQuestion, resetModel, modelReady, MODEL_INFO } from "../src/field/ai/inference";
import { FAQ, FALLBACK_TEXT } from "../src/field/search";
import { buildLocalResult, computeSafeguards } from "../src/field/pathways";

const store: Record<string, string> = {};
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => { store[k] = v; },
  removeItem: (k: string) => { delete store[k]; }, clear: () => {}, key: () => null, length: 0,
} as Storage;

beforeEach(() => { delete store["connex-field-ai-disabled"]; resetModel(); });

const ok = (q: string, lang: "en" | "pt", id: string) => {
  const r = answerQuestion(q, lang);
  const ids = r.kind === "answer" ? [r.entry.id] : r.kind === "clarify" ? r.options.map((o) => o.id) : [];
  return { r, hit: ids.includes(id) };
};

describe("model artifact", () => {
  test("is below 2 MB and loads", () => {
    const bytes = statSync("src/field/ai/models/connex-intent-v1.json").size;
    expect(bytes).toBeLessThan(2 * 1024 * 1024);
    expect(MODEL_INFO.bytes).toBe(bytes);
    expect(modelReady()).toBe(true);
  });
  test("training and evaluation utterances never overlap", () => {
    for (const l of ["en", "pt"]) {
      const tr = JSON.parse(readFileSync(`src/field/ai/data/intents.${l}.json`, "utf8"));
      const ev = JSON.parse(readFileSync(`src/field/ai/data/evaluation.${l}.json`, "utf8"));
      const train = new Set([...Object.values(tr.intents).flat(), ...tr.out_of_domain].map((s) => String(s).toLowerCase()));
      const evals = [...ev.items.map((i: { text: string }) => i.text), ...ev.out_of_domain, ...ev.required.map((r: { text: string }) => r.text)];
      for (const e of evals) expect(train.has(e.toLowerCase())).toBe(false);
      for (const k of Object.keys(tr.intents)) expect(tr.intents[k].length).toBeGreaterThanOrEqual(8);
      expect(ev.out_of_domain.length).toBeGreaterThanOrEqual(20);
    }
  });
});

describe("required questions (answer or Did-you-mean containing the right ID)", () => {
  const cases: [string, "en" | "pt", string][] = [
    ["If I keep the forest standing, do I already have something I can sell?", "en", "K02"],
    ["Does my rural environmental registration prove the land belongs to me?", "en", "K07"],
    ["Is there a fixed market price for every tonne?", "en", "K20"],
    ["Só por ter mata em pé eu já posso vender alguma coisa?", "pt", "K02"],
    ["O cadastro ambiental prova que a terra é minha?", "pt", "K07"],
    ["Como sei se o projeto só aconteceu por causa do carbono?", "pt", "K09"],
    ["Existe um preço fixo para cada tonelada?", "pt", "K20"],
    ["o que é adicionalidadi", "pt", "K09"],
  ];
  for (const [q, l, id] of cases) test(`${l}: ${q}`, () => expect(ok(q, l, id).hit).toBe(true));

  test("ambiguous single word asks Did you mean", () => {
    expect(answerQuestion("difference", "en").kind).toBe("clarify");
    expect(answerQuestion("diferença", "pt").kind).toBe("clarify");
  });
  test("unrelated question gets the fixed fallback", () => {
    const en = answerQuestion("What is the weather in Lisbon?", "en");
    const pt = answerQuestion("Como está o tempo em Lisboa?", "pt");
    expect(en.kind).toBe("fallback");
    expect(pt.kind).toBe("fallback");
    if (en.kind === "fallback") expect(en.text).toBe(FALLBACK_TEXT.en);
  });
  test("Portuguese question with English interface answers in English (same ID)", () => {
    const r = answerQuestion("O cadastro ambiental prova que a terra é minha?", "en");
    expect(r.kind).toBe("answer");
    if (r.kind === "answer") expect(r.entry.language).toBe("en");
  });
});

describe("grounding and fallback", () => {
  test("displayed answers are the verbatim approved text", () => {
    const r = answerQuestion("what is a carbon credit", "en");
    expect(r.kind).toBe("answer");
    if (r.kind === "answer") expect(r.entry.approved_answer).toBe(FAQ.en.find((e) => e.id === r.entry.id)!.approved_answer);
  });
  test("simulated model failure falls back to deterministic search", () => {
    store["connex-field-ai-disabled"] = "1";
    resetModel();
    expect(modelReady()).toBe(false);
    const r = answerQuestion("what is additionality", "en");
    expect(r.kind).toBe("answer");
    expect(r.method).toBe("deterministic_fallback");
    if (r.kind === "answer") expect(r.entry.id).toBe("K09");
  });
});

describe("pathway engine", () => {
  const a = {
    C05: "owner", C06: { country: "BR", state: "PA", municipality: "X", biome: "amazon" }, C07: "50_200", C08: "not_sure", C09: "no",
    C10: "maybe", C11: "no", C12: ["degraded_area", "livestock"], C13: "restore_area", C14: "started_lt_12m", C15: "yes",
    C16: ["none"], C17: "maybe", C18: "finance_restoration",
  };
  test("candidate pathways with contributions and notice", () => {
    const r = buildLocalResult(a);
    const ids = r.pathways.map((p) => p.id);
    expect(ids).toContain("restoration_reforestation");
    expect(ids).toContain("improved_livestock_management");
    expect(ids).toContain("specialist_assessment_required");
    expect(ids).not.toContain("forest_conservation");
    for (const p of r.pathways) expect(p.notice.en).toContain("not an eligibility conclusion");
    expect(JSON.stringify(r)).not.toMatch(/eligible|score|revenue|tonnes per/i);
  });
  test("safeguards triggered by declared answers", () => {
    const ids = computeSafeguards(a).map((f) => f.id);
    for (const id of ["decision_rights_uncertain", "community_rights", "land_documentation_uncertain", "car_absent_pending", "activity_already_started", "insufficient_records", "monitoring_readiness"])
      expect(ids).toContain(id);
    expect(ids).not.toContain("existing_carbon_contract");
  });
  test("no pathway when nothing declared -> specialist assessment", () => {
    expect(buildLocalResult({}).pathways.map((p) => p.id)).toEqual(["specialist_assessment_required"]);
  });
});
