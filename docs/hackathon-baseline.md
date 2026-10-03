# Hack-Nation 2026 — Connex Field: Hackathon Baseline

- **Baseline recorded:** 2026-10-03 16:57 UTC (13:57 São Paulo, UTC-3)
- **Challenge:** Challenge 4 — Small AI for Development
- **Sector:** Agriculture
- **Sponsor:** World Bank

## Environment isolation

This repository is an **isolated Remix** of Connex with its own Lovable project ID and its own Lovable Cloud backend (different from the original Connex project and its production backend). The production Connex project is **not** being modified. The backend contains test data only; no real production users or records are used. No secrets are committed to the repository.

## Pre-existing technology stack (before the hackathon)

- React 18, Vite 5, TypeScript 5, Tailwind CSS 3, shadcn/ui (Radix)
- React Router 6, TanStack Query 5, react-hook-form + Zod
- Lovable Cloud backend (Postgres with RLS, Auth, Storage, Realtime)

## Pre-existing Connex features

- Landing page, sign-up, login, password recovery/reset
- Central profiles with agent types and privacy controls
- Subprofiles ("Agentes") per agent type: landowner, project, developer, certifier, auditor, investor, buyer, financial institution, lawyer
- Subprofile ↔ subprofile connections with synchronized status (realtime)
- Connections network with advanced filters; "My connections"
- Public profiles; direct chat/messages
- Feed (posts, likes)
- Carbon projects with timeline stages, stage members and shared projects
- Notifications and notification preferences; settings

## Connex Field features created during the hackathon

- `/field` module (this phase: offline shell)
- Bilingual content (English default, Portuguese available), stable shared IDs
- PWA support (manifest, icons, guarded service worker)
- Local device storage of a minimal, declarative triage
- Offline small-AI layer (on-device semantic/intent matching, grounded retrieval, pathway classification, missing-info and safeguard flags) with deterministic keyword fallback
- User-authorized synchronization to Connex
- Online Initial Passport and suggested compatible market participants
- Tests and documentation
