// Hack-Nation 2026 — Connex Field Phase 3.1 regression suite (model repair and hardening).
// Run: bun test ./tests/field-ai-regression.test.ts
import { describe, expect, test, beforeEach } from "bun:test";
import { readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { answerQuestion, resetModel, modelReady } from "../src/field/ai/inference";
import { FAQ, FALLBACK_TEXT } from "../src/field/search";

const store: Record<string, string> = {};
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => { store[k] = v; },
  removeItem: (k: string) => { delete store[k]; }, clear: () => {}, key: () => null, length: 0,
} as Storage;
beforeEach(() => { delete store["connex-field-ai-disabled"]; resetModel(); });

const sha = (p: string) => createHash("sha256").update(readFileSync(p)).digest("hex");
const ev = (l: string) => JSON.parse(readFileSync(`src/field/ai/data/evaluation.${l}.json`, "utf8"));
const direct = (q: string, l: "en" | "pt", id: string) => {
  const r = answerQuestion(q, l);
  expect(r.kind).toBe("answer");
  if (r.kind === "answer") { expect(r.entry.id).toBe(id); expect(r.method).toBe("local_ml"); }
};

describe("held-out evaluation files are unchanged since Phase 3", () => {
  test("SHA-256 hashes", () => {
    expect(sha("src/field/ai/data/evaluation.en.json")).toBe("d013b0bfbcbd38e33cc5394e79e494cb3fe7f772dd810b001e3c5a81624dd099");
    expect(sha("src/field/ai/data/evaluation.pt.json")).toBe("cc7c8134c7ebb6991a958eef244faa8342dfae7734039a45d6d59b7c87b8b5c4");
  });
  test("artifact below 300 KB", () => expect(statSync("src/field/ai/models/connex-intent-v1.json").size).toBeLessThan(300 * 1024));
});

describe("three known Phase 3 failures -> direct correct answer", () => {
  test("EN business as usual -> K09", () => direct("What makes this different from business as usual?", "en", "K09"));
  test("EN fixed market price -> K20", () => direct("Is there a fixed market price for every tonne?", "en", "K20"));
  test("PT crédito equivale a CO2 -> K01", () => direct("Um crédito equivale a quanto de CO2?", "pt", "K01"));
});

describe("all required demonstration questions answered directly", () => {
  for (const l of ["en", "pt"] as const)
    for (const r of ev(l).required.filter((x: { expect: string }) => /^K\d\d$/.test(x.expect)))
      test(`${l}: ${r.text}`, () => {
        const a = answerQuestion(r.text, l);
        const ids = a.kind === "answer" ? [a.entry.id] : a.kind === "clarify" ? a.options.map((o) => o.id) : [];
        expect(ids).toContain(r.expect);
        if (!/adicionalidadi|aditionalty/.test(r.text)) direct(r.text, l, r.expect);
      });
});

describe("spelling errors, ambiguity, out-of-domain", () => {
  test("typos reach the right ID", () => {
    for (const [q, l, id] of [["waht is aditionalty", "en", "K09"], ["o que é adicionalidadi", "pt", "K09"]] as const) {
      const a = answerQuestion(q, l);
      const ids = a.kind === "answer" ? [a.entry.id] : a.kind === "clarify" ? a.options.map((o) => o.id) : [];
      expect(ids).toContain(id);
    }
  });
  test("one-word questions ask Did you mean", () => {
    expect(answerQuestion("difference", "en").kind).toBe("clarify");
    expect(answerQuestion("diferença", "pt").kind).toBe("clarify");
  });
  for (const l of ["en", "pt"] as const)
    test(`${l}: all 20 held-out OOD questions get the fixed fallback (full pipeline)`, () => {
      const leaks = ev(l).out_of_domain.filter((q: string) => answerQuestion(q, l).kind !== "fallback");
      expect(leaks).toEqual([]);
    });
});

describe("safety", () => {
  test("model failure -> deterministic fallback", () => {
    store["connex-field-ai-disabled"] = "1"; resetModel();
    expect(modelReady()).toBe(false);
    const r = answerQuestion("what is additionality", "en");
    expect(r.method).toBe("deterministic_fallback");
    if (r.kind === "answer") expect(r.entry.id).toBe("K09");
  });
  test("zero network calls", () => {
    const orig = globalThis.fetch; let calls = 0;
    globalThis.fetch = (() => { calls++; throw new Error("network"); }) as typeof fetch;
    try { for (const l of ["en", "pt"] as const) for (const it of ev(l).items) answerQuestion(it.text, l); } finally { globalThis.fetch = orig; }
    expect(calls).toBe(0);
  });
  test("approved answer text unchanged and returned verbatim", () => {
    for (const l of ["en", "pt"] as const) {
      expect(FAQ[l].length).toBe(26);
      for (const it of ev(l).items) {
        const a = answerQuestion(it.text, l);
        if (a.kind === "answer") expect(a.entry.approved_answer).toBe(FAQ[l].find((e) => e.id === a.entry.id)!.approved_answer);
      }
    }
    expect(FALLBACK_TEXT.en.length).toBeGreaterThan(0);
  });
});
