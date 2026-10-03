// Hack-Nation 2026 — Connex Field local database (IndexedDB via idb). No backend calls.
import { openDB, type DBSchema, type IDBPDatabase } from "idb";

export type SessionStatus = "draft" | "ready_to_sync" | "syncing" | "synced" | "error";
export const CONSENT_VERSION = "local-1.0";
export const PACK_VERSION = "0.1.1";

export interface SessionRec {
  local_session_id: string;
  language: "en" | "pt";
  pack_version: string;
  step: number; // 0..7 = triage steps, 8 = review
  status: SessionStatus;
  consent_version: string;
  consent_at: string;
  created_at: string;
  updated_at: string;
  remote_id: string | null;
  // Phase 4 (optional for records created before sync existed)
  payload_version?: number;
  sync_consented_at?: string;
  synced_at?: string;
}
export interface TriageRec { id: string; local_session_id: string; question_id: string; value_json: string; answered_at: string; updated_at: string }
export interface ConversationRec { id: string; local_session_id: string; language: string; query: string; result_id: string | null; outcome: "answer" | "clarify" | "fallback"; created_at: string }
export interface OutboxRec { local_session_id: string; operation: string; payload_version: string; payload_json: string; attempts: number; last_error: string | null }
/** Local-only inference audit record. Deliberately contains no question text and no personal data. */
export interface InferenceLogRec { id: string; faq_id: string | null; method: "local_ml" | "deterministic_fallback" | "no_match"; outcome: string; model_version: string; ms: number; created_at: string }
export interface DiagnosisRec { local_session_id: string; payload_version: string; result_json: string; received_at: string }

interface FieldDB extends DBSchema {
  session: { key: string; value: SessionRec; indexes: { by_updated: string } };
  triage: { key: string; value: TriageRec; indexes: { by_session: string } };
  conversations: { key: string; value: ConversationRec; indexes: { by_session: string } };
  outbox: { key: string; value: OutboxRec };
  diagnosis: { key: string; value: DiagnosisRec };
  inference_log: { key: string; value: InferenceLogRec };
}

let dbp: Promise<IDBPDatabase<FieldDB>> | null = null;
export function getDB() {
  if (!dbp) {
    dbp = openDB<FieldDB>("connex_field", 2, {
      upgrade(db, oldVersion) {
        if (oldVersion < 2 && oldVersion >= 1) {
          db.createObjectStore("inference_log", { keyPath: "id" });
          return;
        }
        db.createObjectStore("inference_log", { keyPath: "id" });
        db.createObjectStore("session", { keyPath: "local_session_id" }).createIndex("by_updated", "updated_at");
        db.createObjectStore("triage", { keyPath: "id" }).createIndex("by_session", "local_session_id");
        db.createObjectStore("conversations", { keyPath: "id" }).createIndex("by_session", "local_session_id");
        db.createObjectStore("outbox", { keyPath: "local_session_id" });
        db.createObjectStore("diagnosis", { keyPath: "local_session_id" });
      },
    });
  }
  return dbp;
}

const now = () => new Date().toISOString();

export async function requestPersistence() {
  try {
    if (navigator.storage?.persist) await navigator.storage.persist();
  } catch {
    /* non-blocking */
  }
}

export async function createSession(language: "en" | "pt", answers: Record<string, unknown>, step: number) {
  const db = await getDB();
  const t = now();
  const rec: SessionRec = {
    local_session_id: crypto.randomUUID(), language, pack_version: PACK_VERSION, step, status: "draft",
    consent_version: CONSENT_VERSION, consent_at: t, created_at: t, updated_at: t, remote_id: null,
  };
  await db.put("session", rec);
  for (const [qid, v] of Object.entries(answers)) await saveAnswer(rec.local_session_id, qid, v);
  return rec;
}

export async function getLatestSession() {
  const db = await getDB();
  const all = await db.getAllFromIndex("session", "by_updated");
  return all[all.length - 1] ?? null;
}

export async function updateSession(id: string, patch: Partial<SessionRec>) {
  const db = await getDB();
  const cur = await db.get("session", id);
  if (!cur) return null;
  const next = { ...cur, ...patch, updated_at: now() };
  await db.put("session", next);
  return next;
}

export async function saveAnswer(sid: string, qid: string, value: unknown) {
  const db = await getDB();
  const id = `${sid}:${qid}`;
  const prev = await db.get("triage", id);
  const t = now();
  await db.put("triage", { id, local_session_id: sid, question_id: qid, value_json: JSON.stringify(value), answered_at: prev?.answered_at ?? t, updated_at: t });
}

export async function loadAnswers(sid: string) {
  const db = await getDB();
  const rows = await db.getAllFromIndex("triage", "by_session", sid);
  return Object.fromEntries(rows.map((r) => [r.question_id, JSON.parse(r.value_json)])) as Record<string, unknown>;
}

export async function addConversation(rec: Omit<ConversationRec, "id" | "created_at">) {
  const db = await getDB();
  await db.put("conversations", { ...rec, id: crypto.randomUUID(), created_at: now() });
}

export async function loadConversations(sid: string) {
  const db = await getDB();
  return db.getAllFromIndex("conversations", "by_session", sid);
}

export async function logInference(rec: Omit<InferenceLogRec, "id" | "created_at">) {
  try {
    const db = await getDB();
    await db.put("inference_log", { ...rec, id: crypto.randomUUID(), created_at: now() });
  } catch {
    /* logging must never break the assistant */
  }
}

export async function saveDiagnosis(rec: DiagnosisRec) {
  const db = await getDB();
  await db.put("diagnosis", rec);
}

export async function loadDiagnosis(sid: string) {
  const db = await getDB();
  return (await db.get("diagnosis", sid)) ?? null;
}

/** Deletes a session and all related triage, conversations, outbox and diagnosis rows. */
export async function deleteSession(sid: string) {
  const db = await getDB();
  const tx = db.transaction(["session", "triage", "conversations", "outbox", "diagnosis"], "readwrite");
  for (const k of await tx.objectStore("triage").index("by_session").getAllKeys(sid)) await tx.objectStore("triage").delete(k);
  for (const k of await tx.objectStore("conversations").index("by_session").getAllKeys(sid)) await tx.objectStore("conversations").delete(k);
  await tx.objectStore("outbox").delete(sid);
  await tx.objectStore("diagnosis").delete(sid);
  await tx.objectStore("session").delete(sid);
  await tx.done;
}

export async function deleteAllLocalData() {
  const db = await getDB();
  const stores = ["session", "triage", "conversations", "outbox", "diagnosis", "inference_log"] as const;
  const tx = db.transaction([...stores], "readwrite");
  await Promise.all(stores.map((s) => tx.objectStore(s as "session").clear()));
  await tx.done;
}
