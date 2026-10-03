# Model card — `connex-intent` v1.0.0 (Connex Field on-device AI)

Hack-Nation 2026, Challenge 4: Small AI for Development (agriculture). Work created during the hackathon.

## Purpose
Recognizes what kind of question a rural user is asking and maps it to one of the 26 approved FAQ answers (K01–K26). The model only **classifies**. It never writes text. Every answer shown is the approved K01–K26 text, word for word.

## Intended users
Rural landowners, agricultural producers, communities and local representatives using an ordinary phone with poor or no connectivity, in English or Portuguese.

## Architecture
- **Features** (`src/field/ai/features.js`): accent-stripped lowercase text, small per-language stop-word list, word unigrams (weight 1), word bigrams (weight 1), character 3- and 4-grams inside word boundaries (weight 0.3, for typo tolerance).
- **Classifier** (`src/field/ai/nb.js`): Multinomial Naive Bayes with Laplace smoothing α = 0.3. There is one model per language and 27 classes: K01–K26 plus `__ood__` (out of domain).
- **Calibration**: the log-likelihood is length-normalised, then passed through a temperature-scaled softmax (`scale`). The decision thresholds `accept`, `margin`, `clarify`, `oodReject` and `minCoverage` are chosen by deterministic 5-fold cross-validation on the **training data only**. The utility function is: +1 for a right answer, +1 for a right rejection, +0.5 for a "Did you mean" list that contains the right answer, −2 for a wrong answer.
- **Language detection**: compares how many of the question's words are known to each language's vocabulary, with a tie going to the interface language. The answer is always shown in the interface language, using the same stable ID.
- **Artifact**: `src/field/ai/models/connex-intent-v1.json`, a sparse count table. It ships inside the app bundle and is precached by the service worker. Nothing is downloaded at runtime.

| Language | scale | accept | margin | clarify | oodReject | minCoverage | vocabulary |
|---|---|---|---|---|---|---|---|
| EN | 3 | 0.25 | 0.20 | 0.10 | 0.30 | 0.50 | 3,006 features |
| PT | 3 | 0.35 | 0.20 | 0.10 | 0.30 | 0.40 | 2,876 features |

**Model size: 172,914 bytes (≈169 KB)** for both languages, well under the 2 MB target.

## Training data
`src/field/ai/data/intents.{en,pt}.json` (version 1.0.0). The training sentences are paraphrases of the approved FAQ questions, including short and misspelled forms. They contain no answers and no factual claims.

| Language | In-domain training | Out-of-domain training | Held-out in-domain eval | Held-out OOD eval | Required demo questions |
|---|---|---|---|---|---|
| EN | 236 (9–10 per intent) | 20 | 52 (2 per intent) | 20 | 7 |
| PT | 236 (9–10 per intent) | 20 | 52 (2 per intent) | 20 | 7 |

Evaluation files: `src/field/ai/data/evaluation.{en,pt}.json`. A unit test checks that no evaluation sentence appears in the training data.

## Reproduce
```
node scripts/train-field-intent-model.mjs
```
The script is deterministic: it uses no randomness, and folds are assigned by index. It writes the artifact and `connex-intent-v1.eval.json`, which holds all the numbers below.

## Results (held-out evaluation, measured)
| Metric | EN | PT |
|---|---|---|
| Top-1 accuracy (correct intent ranked first) | 90.4% (47/52) | 88.5% (46/52) |
| Answered automatically | 33 | 26 |
| Wrong automatic answers | 0 | 1 |
| Precision of automatic answers | 100% | 96.2% |
| "Did you mean" shown / right answer listed | 19 / 19 | 23 / 21 |
| Passed to deterministic fallback | 0 | 3 |
| Out-of-domain questions not answered automatically | 18/20 (90%) | 19/20 (95%) |
| Mean inference time (Node, per question) | 0.86 ms | 0.32 ms |
| Mean full pipeline time (headless Chromium, 14 questions, incl. fallback) | 1.12 ms (max 3.7 ms) | — |

### Errors and confusions (top-1)
- EN: K13→K25 ("fire after credits"), K14→K09 ("leakage mean in a carbon project"), K19→K18 ("how expensive"), K20→K01 ("what price does a carbon credit get"), K24→K25 ("answers kept on the phone… no internet"). In all five cases a "Did you mean" list was shown, not a wrong answer.
- PT: K01→K20 ("um crédito equivale a quanto de co2"). This was the one **wrong automatic answer**. Other confusions: K13→K25, K14→K09, K17→K09, K18→K21, K19→K09, all shown as "Did you mean" or passed to the fallback.
- OOD questions answered automatically by mistake: EN "what is two plus two" → K15, "what is the population of brazil" → K04. PT "quanto custa um saco de adubo" → K19.

### Required demo questions
| Question | Behaviour |
|---|---|
| EN "If I keep the forest standing, do I already have something I can sell?" | Answer K02 (local_ml) |
| EN "Does my rural environmental registration prove the land belongs to me?" | Answer K07 (local_ml) |
| EN "What makes this different from business as usual?" | Model uncertain. Deterministic search shows "Did you mean" K03 / K12. **Does not reach K09 (miss).** |
| EN "Is there a fixed market price for every tonne?" | "Did you mean" K03 / K20 / K01 (K20 is listed second) |
| EN typo "waht is aditionalty" | "Did you mean" K09 / K23 |
| EN ambiguous "difference" | "Did you mean" K03 / K12 |
| EN unrelated "What is the weather in Lisbon?" | Fixed fallback (rejected as out of domain) |
| PT "Só por ter mata em pé eu já posso vender alguma coisa?" | Answer K02 |
| PT "O cadastro ambiental prova que a terra é minha?" | Answer K07 |
| PT "Como sei se o projeto só aconteceu por causa do carbono?" | "Did you mean" K09 / K23 / K22 |
| PT "Existe um preço fixo para cada tonelada?" | "Did you mean" K20 / K01 / K17 |
| PT typo "o que é adicionalidadi" | Answer K09 |
| PT ambiguous "diferença" | "Did you mean" K03 / K12 |
| PT unrelated "Como está o tempo em Lisboa?" | Fixed fallback |

## Limitations
- The datasets are small and written by the team. They are not collected from real users, so accuracy on real rural speech, regional vocabulary or voice-to-text input is unknown.
- Paraphrases that are far from the training wording (for example "business as usual" for additionality) are often missed. The safe behaviour is then a "Did you mean" list or the fallback, not a wrong answer, but some wrong answers remain possible (1 in 59 automatic answers in evaluation).
- Some out-of-domain questions still get an answer (3/40), because the topic list is closed and the training set is small.
- Only English and Portuguese are supported. The confidence numbers are internal and are never shown to users as certainty.

## Privacy
Inference runs entirely in the browser. The question is never sent to a server or to analytics. The local `inference_log` store keeps only the FAQ ID, the method, the outcome, the model version, the time taken and a timestamp. It does not keep the question text. "Delete local data" clears this log too.

## Grounding
The model returns IDs only. The interface shows the stored approved answer for that ID. There is no text generation, and there are no claims about carbon markets, the law, eligibility, price or volume.

## Fallback
1. Local ML: high confidence → answer. Close candidates → "Did you mean" (up to three). Confident out-of-domain → fixed fallback text.
2. If the model is uncertain, fails to load, throws an error or the browser cannot run it → deterministic keyword search (`src/field/search.ts`).
3. If neither is reliable → the fixed text "No validated answer. Ask again when connected." / "Sem resposta validada. Pergunte após conectar."

## Why this suits constrained settings
- About 169 KB, and pure JavaScript with no WebGPU, WASM or model download, so it runs on low-end Android phones.
- Sub-millisecond to a few milliseconds per question, with negligible battery use.
- Fully auditable: the training data, the script, the learned counts and the evaluation are all plain JSON in the repository.

## Phase 3.1 — repair and hardening (measured)

- **Dataset changes (per language, EN and PT identical counts):** +7 K09 (business as usual, counterfactual, depends on carbon finance, would happen anyway), +8 K20 (market/selling price, fixed price per tonne, price variation), +7 K01 (CO2e per credit, physical unit, quantity vs price), contrastive +2 K03, +2 K19, +1 each K10/K14/K16/K17/K18, +2 K13; +10 independently written out-of-domain examples (arithmetic, geography facts, farm-input prices). No evaluation sentence was copied or moved into training.
- **Domain-relevance gate** (`src/field/ai/domain.js`): stem lexicon written from training data; with zero domain evidence the classifier may not answer or suggest and the user sees the fixed fallback. The classifier stays the primary component; with the model disabled the deterministic search is unchanged.
- **Threshold selection:** still 5-fold CV on training only; utility now penalises a wrong auto-answer −4 (was −2). New: EN scale 3, accept 0.25, margin 0.2, oodReject 0.3, minCoverage 0.2; PT scale 4, accept 0.55, margin 0.05, oodReject 0.5, minCoverage 0.2.
- **Evaluation files unchanged:** SHA-256 EN `d013b0bf…dd099`, PT `cc7c8134…8b5c4`, asserted in `tests/field-ai-regression.test.ts`.
- **Artifact:** 172,914 → 203,794 bytes.
- **Held-out:** EN top-1 90.4% → 96.2%, 35 auto-answers, 0 wrong, OOD rejection 100%; PT 88.5% → 92.3%, 28 auto-answers, 0 wrong (was 1), OOD rejection 100%.
- **Known failures:** "What makes this different from business as usual?" uncertain → K09 direct (p 0.42); "Is there a fixed market price for every tonne?" clarify K03>K20 → K20 direct (0.60); "Um crédito equivale a quanto de CO2?" K20 wrong → K01 correct.
- **Remaining limitations:** fewer PT auto-answers (more "Did you mean"); "what does leakage mean in a carbon project" / PT equivalent rank K09 first (clarify shown, contains K14); during repair the held-out report was inspected between iterations, so the results are slightly optimistic; data still team-written, not field-tested.
