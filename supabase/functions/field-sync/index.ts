// Hack-Nation 2026 — Connex Field Phase 4: authenticated, consented, idempotent sync.
// Uses a user-scoped client (caller JWT) so RLS stays active. No service-role key is used.
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";
import { validatePayload } from "./validate.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
const COLS = "id, local_session_id, payload_version, status, synced_at";
const receipt = (r: Record<string, unknown>, created: boolean) => ({
  field_session_id: r.id, local_session_id: r.local_session_id, payload_version: r.payload_version,
  status: r.status, synced_at: r.synced_at, created,
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json(405, { error: "METHOD_NOT_ALLOWED" });

  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return json(401, { error: "UNAUTHORIZED" });
  const token = auth.slice(7);
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } }, auth: { persistSession: false },
  });
  const { data: claims, error: authErr } = await sb.auth.getClaims(token);
  const uid = claims?.claims?.sub;
  if (authErr || !uid || claims?.claims?.role !== "authenticated") return json(401, { error: "UNAUTHORIZED" });

  // Profile is derived only from the verified JWT; any client-supplied id is rejected by the strict schema.
  const { data: profile } = await sb.from("profiles").select("id").eq("user_id", uid).maybeSingle();
  if (!profile) return json(403, { error: "PROFILE_REQUIRED" });

  const v = validatePayload(z, await req.text());
  if (!v.ok) return json(v.code === "PAYLOAD_TOO_LARGE" ? 413 : 400, { error: v.code });
  const p = v.data;
  const row = {
    local_session_id: p.local_session_id, profile_id: profile.id, language: p.language, answers: p.answers,
    offline_result: p.offline_result ?? null, payload_version: p.payload_version, content_version: p.content_version,
    local_model_version: p.local_model_version, consent_version: p.consent_version,
    sync_consented_at: p.sync_consented_at, device_created_at: p.device_created_at,
  };

  // RLS: only the caller's own rows are visible.
  const own = () => sb.from("field_sessions").select(COLS).eq("local_session_id", p.local_session_id).maybeSingle();
  const { data: existing } = await own();
  if (existing) {
    if (p.payload_version <= (existing.payload_version as number)) return json(200, receipt(existing, false));
    const { data: upd, error } = await sb.from("field_sessions")
      .update({ ...row, synced_at: new Date().toISOString() })
      .eq("id", existing.id).lt("payload_version", p.payload_version).select(COLS).maybeSingle();
    if (error) { console.error("field-sync update", error.code); return json(500, { error: "SYNC_FAILED" }); }
    const cur = upd ?? (await own()).data;
    return json(200, receipt(cur!, false));
  }

  const { data: ins, error } = await sb.from("field_sessions").insert(row).select(COLS).single();
  if (!error) return json(201, receipt(ins, true));
  if (error.code === "23505") {
    // Concurrent duplicate from the same owner (double-click / retry) -> return it; otherwise generic conflict.
    const { data: again } = await own();
    if (again) return json(200, receipt(again, false));
    return json(409, { error: "CONFLICT" });
  }
  console.error("field-sync insert", error.code);
  return json(500, { error: "SYNC_FAILED" });
});
