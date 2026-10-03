# Connex Field — Phase 4 synchronization security

Hack-Nation 2026 work. Isolated Remix backend only (Lovable Cloud ref `sedxgwrfrmnjqfqedfro`); never the original Connex production backend.

## Flow
1. The user completes the triage offline and saves it (`draft → ready_to_sync`).
2. C19 must be `authorize_now`; the consent timestamp is stored locally (`sync_consented_at`).
3. Online + signed out → "Sign in to synchronize" opens the existing Connex login at `/login?redirect=/field`. Only `/field` is accepted as a return path. IndexedDB data is untouched during login.
4. Online + signed in → the user presses "Synchronize now" (no Background Sync). One request in flight; the button is disabled while sending.
5. `ready_to_sync → syncing → synced | error`; `error → ready_to_sync` when the user presses "Try again".

## Edge Function `field-sync`
- POST and OPTIONS only (others 405).
- Bearer token required; verified with `auth.getClaims`; anonymous → 401.
- User-scoped client with the caller's JWT: RLS stays active. **No service-role key is used.**
- Profile looked up from the verified `sub`; missing → 403 `PROFILE_REQUIRED`.
- Zod strict schema (`validate.ts`), 64 KB body limit, 32 KB offline-result limit.
- Accepted answer keys: C01–C19 only. Values: snake_case tokens, C06 `{country,state,municipality,biome}`, C03 ≤ 40 chars; any `@` or 4+ digits in free text is rejected.
- Prohibited keys anywhere (rejected with `PROHIBITED_FIELD`): cpf, cnpj, email, phone, telefone, whatsapp, car_numero/car_number, matricula, registration_number, document, bank/banco, iban, pix, account, latitude, longitude, coordinates, geometry, password, token, user_id, profile_id, subprofile_id.
- C19 must be `authorize_now` with a plausible timestamp, else `CONSENT_REQUIRED`.
- Never creates, modifies or links a subprofile.
- Receipt only: `field_session_id, local_session_id, payload_version, status, synced_at, created`.
- Logs only error codes, never payloads or tokens.

## Idempotency
`local_session_id` is UNIQUE. Existing own row: equal/older `payload_version` → return it (`created:false`); higher → conditional update (`payload_version < new`). New: insert; on unique violation, re-read own row (double-click/retry) or return generic 409 `CONFLICT` if the key belongs to another profile (RLS hides it).

## RLS (`field_sessions`)
- Grants: `SELECT, INSERT, UPDATE` to `authenticated`; `ALL` to `service_role`; nothing to `anon`; no DELETE.
- `field_sessions_select_own`: `user_owns_profile(profile_id)`
- `field_sessions_insert_own`: `user_owns_profile(profile_id) AND subprofile_id IS NULL`
- `field_sessions_update_own`: same in USING/WITH CHECK.

## Local cleanup
Only after a receipt: delete triage answers, assistant conversations, outbox item and stored offline result; keep the session with `status=synced`, `remote_id`, `synced_at`. On failure nothing is deleted.

## Testing twice → one row
Send the same payload twice to `field-sync` with the same token: first 201 `created:true`, second 200 `created:false`; `select count(*) from field_sessions where local_session_id = '<id>'` returns 1.

## Environment
Edge Function uses `SUPABASE_URL` and `SUPABASE_ANON_KEY` (managed by Lovable Cloud). Client uses `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`. No secret values are committed.

Migration: `drizzle/migrations/0000_create_field_sessions.sql`.
