// Hack-Nation 2026 — Connex Field Phase 4: manual, consented, idempotent synchronization.
// Never sends profile_id/user_id; the server derives ownership from the verified JWT.
import { supabase } from "@/integrations/supabase/client";
import { getDB, updateSession, PACK_VERSION, type SessionRec } from "./db";
import { MODEL_INFO } from "./ai/inference";
import type { LocalResult } from "./pathways";

export const ALLOWED_ANSWERS = ["C01","C02","C03","C04","C05","C06","C07","C08","C09","C10","C11","C12","C13","C14","C15","C16","C17","C18","C19"];

export interface SyncReceipt { field_session_id: string; local_session_id: string; payload_version: number; status: string; synced_at: string; created: boolean }
export type SyncBlock = "offline" | "not_ready" | "no_consent" | "signed_out" | "invalid";

/** Minimum payload: only allowlisted answers, no identifiers chosen by the client. */
export function buildPayload(s: SessionRec, answers: Record<string, unknown>, result: LocalResult | null) {
  const a: Record<string, unknown> = {};
  for (const k of ALLOWED_ANSWERS) if (answers[k] !== undefined && answers[k] !== "") a[k] = answers[k];
  return {
    local_session_id: s.local_session_id,
    payload_version: s.payload_version ?? 1,
    language: s.language,
    answers: a,
    offline_result: result ? (JSON.parse(JSON.stringify(result)) as Record<string, unknown>) : null,
    content_version: PACK_VERSION,
    local_model_version: `${MODEL_INFO.name} ${MODEL_INFO.version}`,
    consent_version: s.consent_version,
    sync_consented_at: s.sync_consented_at ?? new Date().toISOString(),
    device_created_at: s.created_at,
  };
}

export function syncBlock(o: { online: boolean; session: SessionRec | null; answers: Record<string, unknown>; signedIn: boolean }): SyncBlock | null {
  if (!o.session || !["ready_to_sync", "error"].includes(o.session.status)) return "not_ready";
  if (o.answers.C19 !== "authorize_now") return "no_consent";
  if (o.answers.C01 === undefined || o.answers.C02 !== "yes") return "invalid";
  if (!o.online) return "offline";
  if (!o.signedIn) return "signed_out";
  return null;
}

let inFlight: Promise<unknown> | null = null;

/** ready_to_sync|error -> syncing -> synced|error. Single in-flight request; data kept on failure. */
export async function syncNow(s: SessionRec, answers: Record<string, unknown>, result: LocalResult | null):
  Promise<{ ok: true; receipt: SyncReceipt; session: SessionRec } | { ok: false; code: string; session: SessionRec | null }> {
  if (inFlight) return { ok: false, code: "IN_PROGRESS", session: s };
  const run = (async () => {
    const consentAt = s.sync_consented_at ?? new Date().toISOString();
    const syncing = await updateSession(s.local_session_id, { status: "syncing", sync_consented_at: consentAt });
    const payload = buildPayload(syncing!, answers, result);
    const db = await getDB();
    const prev = await db.get("outbox", s.local_session_id);
    // One outbox action per local_session_id + payload_version.
    if (!prev || prev.payload_version !== String(payload.payload_version))
      await db.put("outbox", { local_session_id: s.local_session_id, operation: "sync_triage", payload_version: String(payload.payload_version), payload_json: JSON.stringify(payload.answers), attempts: 0, last_error: null });
    const ob = (await db.get("outbox", s.local_session_id))!;
    await db.put("outbox", { ...ob, attempts: ob.attempts + 1 });
    let code = "NETWORK";
    try {
      const { data, error } = await supabase.functions.invoke("field-sync", { body: payload });
      if (!error && data?.field_session_id) {
        const receipt = data as SyncReceipt;
        const done = await cleanupAfterReceipt(s.local_session_id, receipt);
        return { ok: true as const, receipt, session: done! };
      }
      const ctx = (error as { context?: Response } | null)?.context;
      if (ctx && typeof ctx.json === "function") code = (await ctx.json().catch(() => ({})))?.error ?? "SYNC_FAILED";
    } catch {
      code = "NETWORK";
    }
    await db.put("outbox", { ...(await db.get("outbox", s.local_session_id))!, last_error: code });
    const err = await updateSession(s.local_session_id, { status: "error" });
    return { ok: false as const, code, session: err };
  })();
  inFlight = run;
  try { return await run; } finally { inFlight = null; }
}

/** Only after a confirmed receipt: drop raw answers, conversations, outbox, stored result; keep a minimal receipt. */
export async function cleanupAfterReceipt(sid: string, r: SyncReceipt) {
  const db = await getDB();
  const tx = db.transaction(["triage", "conversations", "outbox", "diagnosis"], "readwrite");
  for (const k of await tx.objectStore("triage").index("by_session").getAllKeys(sid)) await tx.objectStore("triage").delete(k);
  for (const k of await tx.objectStore("conversations").index("by_session").getAllKeys(sid)) await tx.objectStore("conversations").delete(k);
  await tx.objectStore("outbox").delete(sid);
  await tx.objectStore("diagnosis").delete(sid);
  await tx.done;
  return updateSession(sid, { status: "synced", remote_id: r.field_session_id, synced_at: r.synced_at });
}

/** Back to ready_to_sync when the user chooses to retry. */
export const markRetry = (sid: string) => updateSession(sid, { status: "ready_to_sync" });
