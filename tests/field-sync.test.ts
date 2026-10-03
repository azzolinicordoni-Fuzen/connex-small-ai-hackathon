// Hack-Nation 2026 — Connex Field Phase 4: payload validation and client payload rules.
// Run: bun test ./tests/field-sync.test.ts
import { describe, expect, test } from "bun:test";
import { z } from "zod";
import { validatePayload, MAX_BODY_BYTES } from "../supabase/functions/field-sync/validate";
import { buildPayload, syncBlock } from "../src/field/sync";
import type { SessionRec } from "../src/field/db";

const now = new Date().toISOString();
const sess: SessionRec = { local_session_id: crypto.randomUUID(), language: "en", pack_version: "0.1.1", step: 8, status: "ready_to_sync", consent_version: "local-1.0", consent_at: now, created_at: now, updated_at: now, remote_id: null, sync_consented_at: now };
const answers = { C01: "en", C02: "yes", C05: "owner", C06: { country: "BR", state: "PA", municipality: "Fictional", biome: "amazon" }, C12: ["livestock"], C19: "authorize_now", extra: "x" };
const ok = () => buildPayload(sess, answers, null);
const v = (b: unknown) => validatePayload(z, JSON.stringify(b));

describe("client payload", () => {
  test("never includes profile_id/user_id and drops non-allowlisted answers", () => {
    const p = ok() as Record<string, unknown>;
    expect(p.profile_id).toBeUndefined(); expect(p.user_id).toBeUndefined();
    expect((p.answers as Record<string, unknown>).extra).toBeUndefined();
    expect(v(p).ok).toBe(true);
  });
  test("sync gating", () => {
    const base = { online: true, session: sess, answers, signedIn: true };
    expect(syncBlock(base)).toBeNull();
    expect(syncBlock({ ...base, online: false })).toBe("offline");
    expect(syncBlock({ ...base, signedIn: false })).toBe("signed_out");
    expect(syncBlock({ ...base, answers: { ...answers, C19: "ask_later" } })).toBe("no_consent");
    expect(syncBlock({ ...base, session: { ...sess, status: "draft" } })).toBe("not_ready");
  });
});

describe("server validation", () => {
  test("forged profile_id rejected", () => expect(v({ ...ok(), profile_id: crypto.randomUUID() })).toEqual({ ok: false, code: "PROHIBITED_FIELD" }));
  test("prohibited field rejected", () => expect(v({ ...ok(), answers: { ...ok().answers, cpf: "1" } })).toEqual({ ok: false, code: "PROHIBITED_FIELD" }));
  test("sensitive free text rejected", () => expect(v({ ...ok(), answers: { ...ok().answers, C03: "a@b.co" } }).ok).toBe(false));
  test("unknown answer key rejected", () => expect(v({ ...ok(), answers: { ...ok().answers, C99: "x" } }).ok).toBe(false));
  test("no C19 authorization rejected", () => expect(v({ ...ok(), answers: { ...ok().answers, C19: "do_not_authorize" } })).toEqual({ ok: false, code: "CONSENT_REQUIRED" }));
  test("size limit", () => expect(validatePayload(z, "x".repeat(MAX_BODY_BYTES + 1))).toEqual({ ok: false, code: "PAYLOAD_TOO_LARGE" }));
});
