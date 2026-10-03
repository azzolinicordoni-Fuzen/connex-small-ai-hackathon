# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Hack-Nation 2026 — Connex Field

**Challenge 4 — Small AI for Development · Sector: Agriculture · Sponsor: World Bank**

**Problem.** Rural landowners and agricultural producers often lack reliable connectivity and accessible technical guidance, which keeps them out of carbon-market opportunities.

**Target user.** Rural landowners, agricultural producers, communities and local representatives, using phones they already have.

**Why offline matters.** Fieldwork happens where coverage is weak or absent. Connex Field works after a single online visit, keeps answers on the device, and syncs only when connectivity returns and the user authorizes it.

**Pre-existing (before the event).** The Connex platform: auth, profiles and subprofiles, subprofile connections, network filters, public profiles, chat, feed, carbon projects with timelines, notifications. See `docs/hackathon-baseline.md`.

**Built during the event.** The `/field` module, bilingual EN/PT content, PWA offline support, local storage, an on-device small-AI layer (with deterministic fallback), user-authorized sync, the online Initial Passport, tests and docs.

**Demonstration flow.** Open `/field` online once → airplane mode → reopen, app still works → complete and save a triage offline → ask the on-device assistant a natural question → see candidate pathways, missing info and safeguards → reconnect → authorize sync → Connex generates the Initial Passport and suggests compatible participants.

**Run locally.**

```sh
npm install
npm run dev          # http://localhost:8080/field (service worker disabled in dev)
npm run build && npm run preview   # production build; service worker active
```

Offline test procedure: `docs/offline-test.md`.

### Connex Field architecture (what is AI and what is not)

| Component | Kind | Where |
|---|---|---|
| Intent classifier `connex-intent` v1 | **Genuine on-device machine learning.** A Multinomial Naive Bayes model over word 1–2-grams and character 3–4-grams, trained from data in the repo. It runs in the browser and returns only an FAQ ID. | `src/field/ai/` · model card: `docs/offline-ai-model-card.md` |
| Keyword search | **Deterministic fallback**, used when the model is uncertain, fails or can't run | `src/field/search.ts` |
| Pathway and safeguard engine | **Transparent rules** over the declared answers. Lists pathways to investigate. Does not decide eligibility and gives no scores or estimates. | `src/field/pathways.ts` |
| Initial Passport diagnosis | **Future online generative AI**, used only after the user authorizes sync. Not built yet. | — |

Retrain and re-evaluate: `node scripts/train-field-intent-model.mjs`. Tests: `bun test ./tests/field.test.ts ./tests/field-ai.test.ts`.
