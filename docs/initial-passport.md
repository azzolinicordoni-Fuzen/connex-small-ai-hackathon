# Connex Field — Initial Passport (Phase 5, Hack-Nation 2026)

The offline small AI (on-device intent model + pathway engine) is the primary solution. The
Initial Passport is an **optional online enhancement**, available only after explicit consent (C19),
authenticated sync, and a `field_sessions` row owned by the user.

## Flow
1. Sync (Phase 4) → server receipt (`field_session_id`).
2. "Generate Initial Passport" / "Gerar Passaporte Inicial" (enabled only online + signed in).
3. Browser sends **only** `{ field_session_id }` to the `field-diagnosis` Edge Function.
4. The function reads the stored assessment, calls the Lovable AI Gateway, validates, saves to `field_diagnoses`.
5. Reopening reads the saved row (RLS, own rows only) — no new model call. A copy is cached in IndexedDB.

## Structured result (validated with Zod)
`passport_title, summary, declared_facts[{field_id, statement}],
candidate_pathways[{id, label_key, explanation, supporting_fields, open_questions, faq_ids}],
safeguard_flags[{id, explanation, triggering_fields, faq_ids, specialist_type, not_automatic_rejection, notice}],
missing_information[{field_id, why}], next_steps[{step, faq_ids?}], suggested_agent_types (Connex agent_type),
data_completeness (low|medium|high — computed server-side from declared answers only),
knowledge_references (K01–K26), disclaimer (fixed server text)`.

## Model configuration
- `LOVABLE_API_KEY` (server only). `FIELD_AI_MODEL` (optional, default `google/gemini-3-flash-preview`).
  `FIELD_PROMPT_VERSION` (optional, default `field-passport-1.0`).
- GPT-6 Astra's gateway identifier is not confirmed, so it is not used. It can be set via `FIELD_AI_MODEL` once confirmed.
- Without `LOVABLE_API_KEY` the function returns `MODEL_NOT_CONFIGURED`.

## Idempotency and cost
Unique `(field_session_id, payload_version, prompt_version)`. Ready → returned as cached. Fresh `processing`
→ 409 `IN_PROGRESS`. Stale `processing` (> 120 s) or `error` → retried via optimistic lock (one winner).
At most 2 gateway calls per attempt (1 + one repair). Interface language is not part of the key.

## Connection to the network
"Find compatible Connex agents" opens `/conexoes`. That page does not read query filters today, so none
are sent. Proposed future filters: `region`, `biome`, `pathway`, `agent_type`. No assessment data is published.

## Demo
Sync an assessment → Generate Initial Passport → reload → "View Initial Passport" on the Field home shows the saved result.

## Disclaimer
Preliminary assessment based only on declared information. Not an eligibility decision, certification,
legal opinion, valuation, or promise of credits, revenue or timelines.
