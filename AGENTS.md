- Connex Field offline: vite-plugin-pwa generateSW, registered only via src/pwa/registerSW.ts (prod, non-preview, non-iframe); navigations NetworkFirst, cross-origin (Cloud/auth/AI) never cached — keeps preview safe and data fresh.
- Hackathon work lives in /field, src/field, src/pwa and docs/ — separates it from the pre-existing Connex platform.

- Connex Field triage and FAQ data live only in IndexedDB (src/field/db.ts); nothing is sent to the backend before explicit C19 authorization — privacy by design.
- Connex Field unit tests live in tests/ and run with `bun test ./tests/field.test.ts` — keeps bun types out of the app typecheck.
- Connex Field intent model is retrained only via scripts/train-field-intent-model.mjs; features.js and nb.js are shared by training and browser runtime — never hand-edit the model JSON or duplicate feature code (keeps training/inference identical and auditable).
- Assistant answers flow ML → deterministic search → fixed fallback, and every displayed answer is the stored K01–K26 text — the AI only selects IDs (grounding).
- Pathway engine (src/field/pathways.ts) lists paths to investigate and safeguards only; it must never output eligibility, scores, volumes, prices, costs or timelines.
