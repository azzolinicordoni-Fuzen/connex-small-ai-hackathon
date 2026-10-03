# field-diagnosis — security notes (Phase 5)

- **Auth**: POST/OPTIONS only; Bearer JWT verified with `getClaims` (401 otherwise). Profile derived from the verified user ID (403 `PROFILE_REQUIRED`).
- **Request**: strict schema `{ field_session_id: uuid }`; any other key (profile, answers, model, result…) → 400. Body > 1 KB → 413.
- **Ownership**: session loaded with the caller's JWT (RLS); not visible → 404 (no inference about other users); profile mismatch → 403; status must be `received`.
- **Writes**: `field_diagnoses` grants `authenticated` SELECT only (INSERT/UPDATE/DELETE revoked; anon has nothing). Policy `field_diagnoses_select_own` = `user_owns_profile(profile_id)`. The function writes with the service role **only after** JWT + ownership checks; a trigger also enforces that `profile_id` owns `field_session_id`.
- **Prompt injection**: assessment values are wrapped in `<assessment_data>` and declared untrusted; display name (C03) and consent fields are never sent; free text stripped of `<>{}`\`, control chars, capped at 60 chars.
- **Output controls**: Zod validation, one repair attempt, prohibited-claim scan (eligibility/certification claims, money, volumes, timelines, percentages, promises, contract advice, ownership/legal opinion), pathways must be a subset of the offline record, omitted offline safeguards are restored, disclaimer and completeness set by the server.
- **Errors**: 429 `RATE_LIMITED`, 402 `CREDITS_EXHAUSTED`, 403 `GATEWAY_ACCESS`, 504 `GATEWAY_TIMEOUT`, 502 `MALFORMED_OUTPUT`/`PROHIBITED_CLAIM`, 503 `MODEL_NOT_CONFIGURED`, 409 `IN_PROGRESS`. The session and offline result are never changed.
- **Logging**: only error codes and schema paths — never prompts, answers, tokens or personal data.

## Phase 5.1 — safety hardening and localization

- **Stem scan:** every AI-generated string (title, summary, facts, pathway/safeguard explanations, open questions, missing-information reasons, next steps) is scanned for EN/PT stems `eligib, elegib, certif, approv, aprov, guarant, garant, qualif, assegur, apto/apta`, in addition to the money, volume, timeline, percentage, promise, contract-advice and ownership/legal checks. Stems are blocked even when negated; only "qualified specialist/professional" (and PT equivalents) is allowed.
- **Safe normalization:** unsafe sentences or list items are dropped, never rewritten. An emptied explanation falls back to the approved offline text, then to a fixed server sentence; an emptied summary/title/next-steps list uses fixed server text. Unsafe content never triggers another model call (the single repair call is kept only for malformed JSON).
- **Order:** the scan runs before the server adds the disclaimer and flag notices, so the controlled disclaimer may mention eligibility.
- **Cached results:** re-validated on every cached reply (stored copy corrected, `corrected: true`, zero model calls) and again in the browser before display, including the on-device copy.
- **Localization:** disclaimer and flag notices always follow the synchronized assessment language; the AI narrative stays in that language. The UI shows "This Passport was generated in the assessment language." when the interface language differs.
- **Live tests are opt-in:** `RUN_FIELD_AI_LIVE_TEST=false` by default. The automated suite uses injected mock models only and a test fails if any test file references the gateway URL or if the flag is enabled. Build, preview and dev commands never call the gateway.
