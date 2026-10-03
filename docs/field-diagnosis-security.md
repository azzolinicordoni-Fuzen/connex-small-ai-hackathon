# field-diagnosis — security notes (Phase 5)

- **Auth**: POST/OPTIONS only; Bearer JWT verified with `getClaims` (401 otherwise). Profile derived from the verified user ID (403 `PROFILE_REQUIRED`).
- **Request**: strict schema `{ field_session_id: uuid }`; any other key (profile, answers, model, result…) → 400. Body > 1 KB → 413.
- **Ownership**: session loaded with the caller's JWT (RLS); not visible → 404 (no inference about other users); profile mismatch → 403; status must be `received`.
- **Writes**: `field_diagnoses` grants `authenticated` SELECT only (INSERT/UPDATE/DELETE revoked; anon has nothing). Policy `field_diagnoses_select_own` = `user_owns_profile(profile_id)`. The function writes with the service role **only after** JWT + ownership checks; a trigger also enforces that `profile_id` owns `field_session_id`.
- **Prompt injection**: assessment values are wrapped in `<assessment_data>` and declared untrusted; display name (C03) and consent fields are never sent; free text stripped of `<>{}`\`, control chars, capped at 60 chars.
- **Output controls**: Zod validation, one repair attempt, prohibited-claim scan (eligibility/certification claims, money, volumes, timelines, percentages, promises, contract advice, ownership/legal opinion), pathways must be a subset of the offline record, omitted offline safeguards are restored, disclaimer and completeness set by the server.
- **Errors**: 429 `RATE_LIMITED`, 402 `CREDITS_EXHAUSTED`, 403 `GATEWAY_ACCESS`, 504 `GATEWAY_TIMEOUT`, 502 `MALFORMED_OUTPUT`/`PROHIBITED_CLAIM`, 503 `MODEL_NOT_CONFIGURED`, 409 `IN_PROGRESS`. The session and offline result are never changed.
- **Logging**: only error codes and schema paths — never prompts, answers, tokens or personal data.
