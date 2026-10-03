// Hack-Nation 2026 — Connex Field Phase 2 validation. Run: bun test src/field
import { describe, expect, test } from "bun:test";
import { QUESTIONS, STEPS, PROHIBITED_FIELDS } from "../questions";
import { FAQ, searchFaq, FALLBACK_TEXT } from "../search";
import { computeFlags, missingAnswers } from "../summary";

describe("triage", () => {
  test("exactly 19 stable IDs C01–C19", () => {
    expect(QUESTIONS.map((q) => q.id)).toEqual(Array.from({ length: 19 }, (_, i) => `C${String(i + 1).padStart(2, "0")}`));
  });
  test("no more than eight steps, covering C01–C18 (C19 on review)", () => {
    expect(STEPS.length).toBeLessThanOrEqual(8);
    const ids = new Set(STEPS.flatMap((s) => s.questions).filter((x) => !x.includes(".")));
    for (const q of QUESTIONS) if (q.id !== "C19") expect(ids.has(q.id)).toBe(true);
  });
  test("every option has both languages and snake_case values", () => {
    for (const q of QUESTIONS) for (const o of q.options ?? []) {
      expect(o.label.en && o.label.pt).toBeTruthy();
      expect(o.value).toMatch(/^[a-z0-9_]+$/);
    }
  });
  test("no prohibited sensitive field", () => {
    const fields = QUESTIONS.map((q) => q.field.toLowerCase());
    for (const p of PROHIBITED_FIELDS) expect(fields.some((f) => f.includes(p))).toBe(false);
  });
  test("flags and missing answers", () => {
    const flags = computeFlags({ C10: "maybe", C11: "private_project", C15: "yes", C05: "not_sure" }).map((f) => f.id);
    expect(flags).toEqual(["dispute", "existing_contract", "community_rights", "rights_uncertain"]);
    expect(missingAnswers({})).toContain("C05");
  });
});

describe("faq", () => {
  test("26 entries per language with matching ids, versions, categories, references", () => {
    expect(FAQ.en.length).toBe(26);
    expect(FAQ.pt.length).toBe(26);
    FAQ.en.forEach((e, i) => {
      const p = FAQ.pt[i];
      expect(e.id).toBe(`K${String(i + 1).padStart(2, "0")}`);
      expect([p.id, p.content_version, p.category, JSON.stringify(p.references)]).toEqual([e.id, e.content_version, e.category, JSON.stringify(e.references)]);
    });
  });
  const cases: [string, "en" | "pt", string][] = [
    ["what is a carbon credit", "en", "K01"],
    ["O que é um crédito de carbono?", "pt", "K01"],
    ["Does my CAR prove I own the land?", "en", "K07"],
    ["o car prova que sou dono", "pt", "K07"],
    ["what does additionality mean", "en", "K09"],
    ["adicionalidade", "pt", "K09"],
    ["how much money is one credit worth", "en", "K20"],
    ["quanto vale um credito", "pt", "K20"],
    ["what is aditionality", "en", "K09"], // spelling variation
    ["o que e adicionalidad", "pt", "K09"], // spelling variation
    ["what is permanance", "en", "K13"],
  ];
  for (const [q, lang, id] of cases) {
    test(`${lang}: "${q}" -> ${id}`, () => {
      const r = searchFaq(q, lang);
      expect(r.kind).toBe("answer");
      if (r.kind === "answer") {
        expect(r.entry.id).toBe(id);
        expect(r.related.length).toBeLessThanOrEqual(3);
      }
    });
  }
  test("out of scope returns exact fallback", () => {
    expect(searchFaq("what is the weather tomorrow in Lisbon", "en")).toEqual({ kind: "fallback", text: FALLBACK_TEXT.en });
    expect(searchFaq("qual a receita de bolo de fubá", "pt")).toEqual({ kind: "fallback", text: "Sem resposta validada. Pergunte após conectar." });
  });
  test("ambiguous question offers clarification options only", () => {
    const r = searchFaq("difference", "en");
    expect(r.kind).toBe("clarify");
    if (r.kind === "clarify") expect(r.options.length).toBeGreaterThan(1);
  });
});
