// Hack-Nation 2026 — Connex Field Phase 5: authenticated Initial Passport (online diagnosis).
// Reads: caller-JWT client (RLS) for profile + field_sessions ownership.
// Writes: field_diagnoses via service role ONLY after JWT + ownership are verified, because
// the browser has SELECT-only access (users must never write diagnosis results).
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";
import faqEn from "./faq.en.json" with { type: "json" };
import faqPt from "./faq.pt.json" with { type: "json" };
import { DEFAULT_MODEL, handle, PROMPT_VERSION_DEFAULT, type DiagRow, type ModelCall } from "./logic.ts";

const URL_ = Deno.env.get("SUPABASE_URL")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const MODEL = LOVABLE_API_KEY ? (Deno.env.get("FIELD_AI_MODEL")?.trim() || DEFAULT_MODEL) : null;
const PROMPT_VERSION = Deno.env.get("FIELD_PROMPT_VERSION")?.trim() || PROMPT_VERSION_DEFAULT;
const COLS = "id, field_session_id, payload_version, prompt_version, model_id, status, result, safe_error_code, started_at, completed_at, updated_at";
const GATEWAY_TIMEOUT_MS = 45_000;

async function callModel(model: string, messages: { role: string; content: string }[]): Promise<ModelCall> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), GATEWAY_TIMEOUT_MS);
  try {
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST", signal: ctl.signal,
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, response_format: { type: "json_object" } }),
    });
    if (r.status === 429) return { ok: false, code: "RATE_LIMITED" };
    if (r.status === 402) return { ok: false, code: "CREDITS_EXHAUSTED" };
    if (r.status === 401 || r.status === 403) return { ok: false, code: "GATEWAY_ACCESS" };
    if (r.status === 400 || r.status === 404) {
      const txt = (await r.text()).toLowerCase();
      return { ok: false, code: txt.includes("model") ? "MODEL_NOT_CONFIGURED" : "GATEWAY_ERROR" };
    }
    if (!r.ok) return { ok: false, code: "GATEWAY_ERROR" };
    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content;
    return typeof content === "string" ? { ok: true, content } : { ok: false, code: "MALFORMED_OUTPUT" };
  } catch (e) {
    return { ok: false, code: (e as Error)?.name === "AbortError" ? "GATEWAY_TIMEOUT" : "GATEWAY_ERROR" };
  } finally { clearTimeout(t); }
}

Deno.serve((req) => {
  const user = createClient(URL_, ANON, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } }, auth: { persistSession: false },
  });
  const admin = createClient(URL_, SERVICE, { auth: { persistSession: false } });
  const diag = () => admin.from("field_diagnoses");
  return handle(req, {
    z,
    verify: async (token) => {
      const { data, error } = await user.auth.getClaims(token);
      const c = data?.claims;
      return !error && c?.sub && c.role === "authenticated" ? String(c.sub) : null;
    },
    profileId: async (uid) => (await user.from("profiles").select("id").eq("user_id", uid).maybeSingle()).data?.id ?? null,
    loadSession: async (id) => (await user.from("field_sessions")
      .select("id, profile_id, status, language, payload_version, answers, offline_result").eq("id", id).maybeSingle()).data ?? null,
    find: async (sid, pv, pr) => ((await diag().select(COLS).eq("field_session_id", sid).eq("payload_version", pv).eq("prompt_version", pr).maybeSingle()).data as DiagRow | null) ?? null,
    insertProcessing: async (row) => {
      const { data, error } = await diag().insert(row).select(COLS).single();
      if (!error) return { row: data as DiagRow };
      if (error.code === "23505") return { conflict: true };
      console.error("field-diagnosis insert", error.code);
      return { error: true };
    },
    // Optimistic lock: only one caller can move an error/stale row back to processing.
    takeOver: async (id, prev, patch) =>
      ((await diag().update(patch).eq("id", id).eq("updated_at", prev).neq("status", "ready").select(COLS).maybeSingle()).data as DiagRow | null) ?? null,
    save: async (id, patch) => ((await diag().update(patch).eq("id", id).select(COLS).maybeSingle()).data as DiagRow | null) ?? null,
    callModel,
    faq: (lang) => (lang === "pt" ? faqPt : faqEn) as { id: string; question: string; approved_answer: string }[],
    modelId: MODEL,
    promptVersion: PROMPT_VERSION,
    now: () => Date.now(),
  });
});
