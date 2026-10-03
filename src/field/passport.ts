// Hack-Nation 2026 — Connex Field Phase 5: Initial Passport client.
// Sends only field_session_id; the server reads the synchronized assessment itself.
import { supabase } from "@/integrations/supabase/client";
import { loadDiagnosis, saveDiagnosis } from "./db";

export interface PassportDiag {
  id: string; field_session_id: string; payload_version: number; prompt_version: string; model_id: string;
  status: "pending" | "processing" | "ready" | "error"; result: PassportResult | null; safe_error_code: string | null; completed_at: string | null;
}
export interface PassportResult {
  passport_title: string; summary: string; language: "en" | "pt";
  declared_facts: { field_id: string; statement: string }[];
  candidate_pathways: { id: string; label_key: string; explanation: string; supporting_fields: string[]; open_questions: string[]; faq_ids: string[] }[];
  safeguard_flags: { id: string; explanation: string; triggering_fields: string[]; faq_ids: string[]; specialist_type: string; notice: string }[];
  missing_information: { field_id: string; why: string }[];
  next_steps: { step: string; faq_ids?: string[] }[];
  suggested_agent_types: string[];
  data_completeness: "low" | "medium" | "high";
  knowledge_references: string[];
  disclaimer: string;
}
export type GenOutcome = { ok: true; diag: PassportDiag } | { ok: false; code: string; retryable: boolean };

/** Saved diagnosis (RLS: own rows only) — no model call. Falls back to the on-device copy when offline. */
export async function loadSavedPassport(localId: string, remoteId: string, online: boolean): Promise<PassportDiag | null> {
  if (online) {
    const { data } = await supabase.from("field_diagnoses")
      .select("id, field_session_id, payload_version, prompt_version, model_id, status, result, safe_error_code, completed_at")
      .eq("field_session_id", remoteId).eq("status", "ready").order("payload_version", { ascending: false }).limit(1).maybeSingle();
    if (data) {
      await cache(localId, data as unknown as PassportDiag);
      return data as unknown as PassportDiag;
    }
  }
  const c = await loadDiagnosis(localId).catch(() => undefined);
  return c ? (JSON.parse(c.result_json) as PassportDiag) : null;
}

const cache = (localId: string, d: PassportDiag) =>
  saveDiagnosis({ local_session_id: localId, payload_version: String(d.payload_version), result_json: JSON.stringify(d), received_at: new Date().toISOString() }).catch(() => {});

let inFlight = false;
export async function generatePassport(localId: string, remoteId: string): Promise<GenOutcome> {
  if (inFlight) return { ok: false, code: "IN_PROGRESS", retryable: true };
  inFlight = true;
  try {
    const { data, error } = await supabase.functions.invoke("field-diagnosis", { body: { field_session_id: remoteId } });
    if (!error && data?.diagnosis?.status === "ready") {
      await cache(localId, data.diagnosis);
      return { ok: true, diag: data.diagnosis };
    }
    const ctx = (error as { context?: Response } | null)?.context;
    const body = ctx && typeof ctx.json === "function" ? await ctx.json().catch(() => ({})) : {};
    return { ok: false, code: body?.error ?? "NETWORK", retryable: body?.retryable ?? true };
  } catch {
    return { ok: false, code: "NETWORK", retryable: true };
  } finally { inFlight = false; }
}
