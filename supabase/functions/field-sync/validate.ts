// Hack-Nation 2026 — Connex Field Phase 4: payload validation for field-sync.
// Zod is injected so the same rules run in Deno (Edge Function) and in bun unit tests.
// deno-lint-ignore-file no-explicit-any
export const MAX_BODY_BYTES = 64 * 1024;
export const MAX_RESULT_BYTES = 32 * 1024;

export const ALLOWED_ANSWERS = [
  "C01", "C02", "C03", "C04", "C05", "C06", "C07", "C08", "C09", "C10",
  "C11", "C12", "C13", "C14", "C15", "C16", "C17", "C18", "C19",
] as const;

/** Keys that must never appear anywhere in the payload (case-insensitive substring match). */
export const PROHIBITED_KEYS = [
  "cpf", "cnpj", "email", "phone", "telefone", "whatsapp", "car_numero", "car_number", "matricula",
  "registration_number", "document", "bank", "banco", "iban", "pix", "account", "latitude", "longitude",
  "coordinates", "geometry", "password", "token", "user_id", "profile_id", "subprofile_id",
];
const SENSITIVE_VALUE = /@|\d{4,}/;

export function findProhibitedKey(v: unknown, depth = 0): string | null {
  if (depth > 8 || v === null || typeof v !== "object") return null;
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    const lk = k.toLowerCase();
    const hit = PROHIBITED_KEYS.find((p) => lk.includes(p));
    if (hit) return k;
    const inner = findProhibitedKey(val, depth + 1);
    if (inner) return inner;
  }
  return null;
}

export function makeSchema(z: any) {
  const token = z.string().max(40).regex(/^[a-z0-9_]+$/);
  const safeText = (max: number) => z.string().max(max).refine((s: string) => !SENSITIVE_VALUE.test(s), "sensitive");
  const answers = z.object({
    C01: z.enum(["en", "pt"]),
    C02: z.literal("yes"),
    C03: safeText(40).optional(),
    C04: token.optional(), C05: token.optional(),
    C06: z.object({
      country: z.string().max(4), state: safeText(60), municipality: safeText(60), biome: token.optional(),
    }).strict().optional(),
    C07: token.optional(), C08: token.optional(), C09: token.optional(), C10: token.optional(), C11: token.optional(),
    C12: z.array(token).max(12).optional(),
    C13: token.optional(), C14: token.optional(), C15: token.optional(),
    C16: z.array(token).max(12).optional(),
    C17: token.optional(), C18: token.optional(),
    C19: z.literal("authorize_now"),
  }).strict();
  return z.object({
    local_session_id: z.string().uuid(),
    payload_version: z.number().int().min(1).max(100000),
    language: z.enum(["en", "pt"]),
    answers,
    offline_result: z.record(z.any()).nullable().optional(),
    content_version: z.string().min(1).max(40),
    local_model_version: z.string().min(1).max(60),
    consent_version: z.string().min(1).max(40),
    sync_consented_at: z.string().datetime(),
    device_created_at: z.string().datetime(),
  }).strict();
}

export type ValidationResult = { ok: true; data: any } | { ok: false; code: string };

/** Full validation: size, prohibited keys, schema, consent timestamp sanity. */
export function validatePayload(z: any, raw: string): ValidationResult {
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return { ok: false, code: "PAYLOAD_TOO_LARGE" };
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return { ok: false, code: "INVALID_JSON" }; }
  if (!body || typeof body !== "object" || Array.isArray(body)) return { ok: false, code: "INVALID_PAYLOAD" };
  const ans = (body as any).answers;
  if (!ans || ans.C19 !== "authorize_now") return { ok: false, code: "CONSENT_REQUIRED" };
  if (findProhibitedKey(body)) return { ok: false, code: "PROHIBITED_FIELD" };
  const r = makeSchema(z).safeParse(body);
  if (!r.success) return { ok: false, code: "INVALID_PAYLOAD" };
  const d = r.data;
  if (d.offline_result && JSON.stringify(d.offline_result).length > MAX_RESULT_BYTES) return { ok: false, code: "PAYLOAD_TOO_LARGE" };
  const consent = Date.parse(d.sync_consented_at);
  if (!(consent > Date.parse("2025-01-01")) || consent > Date.now() + 5 * 60_000) return { ok: false, code: "CONSENT_REQUIRED" };
  return { ok: true, data: d };
}
