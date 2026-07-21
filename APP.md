# GatePass

**Purpose**: A contractor marketplace the HOA controls, supported by board software for association-approved exterior work.

**Type**: standard Adaptive app

**Status**: active preview work. Public site is being prepared for fundraising review. Do not deploy production until Joseph approves the preview.

## Current public truth

- GatePass is pre-revenue.
- Public product screens use modeled demo data only.
- Paid HOA customers: 0.
- Production contractor transactions: 0.
- Production revenue: $0.
- Next milestone: one paid Austin HOA, one approved contractor transaction, and one export the association can keep.

## Current doctrine

- The HOA is the gatekeeper; GatePass is the approved access path.
- Contractors pay for approved access. GatePass is designed to return a defined share of production transaction value to the participating association or homeowner after the legal and payment structure is approved.
- Do not invent a transaction-share percentage or present modeled economics as a promise.
- Exterior observations must be limited to information lawfully visible from a public approach or supplied by the homeowner or association.
- GatePass can work alongside a management company, but permission and association records stay with the HOA.
- AI may support specific workflows. It is a feature, not the product thesis or operating method.
- Doctrine changes require contact from reality: a board conversation, contractor response, investor response, counsel ruling, or deployment result.

## Source of truth

Use this file and `CODEX.md` for current product and public-copy decisions. `docs/HOA-OS-ARCHITECTURE.md` and `docs/compliance-memory-layer.md` are historical design records and must not override current doctrine.

## Pricing displayed

- HOA software: $20 per unit per year.
- Setup fee: $0.
- Founding contractor access: $99 once, after approval.
- Contractor applications do not guarantee access, leads, or job volume.

## Main routes

- `/` — public homepage.
- `/investors` — pre-seed investor brief and current-status section.
- `/pricing` — HOA software pricing.
- `/onboard` — HOA access review form; no payment created.
- `/contractors` — contractor founding-access application; no payment created.
- `/demo` — modeled product demo; noindex.
- `/privacy` and `/terms` — prelaunch website legal copy.

## Backend functions

- `createHOAAccessReview()` stores an unpaid HOA review request.
- `createContractorApplication()` stores an unpaid contractor application.
- Legacy checkout functions still exist for future use but are no longer called by public forms.
- `getMeetings()`, `getAmenities()`, and `getAnnouncements()` return synthetic records for the fixed demo HOA without requiring seeded local data.
- Demo and association-record functions are used for modeled product screens.

## Verification requirements before handoff

- `npm run check`
- `npm run lint`
- `npm run prod:build`
- Search source and build output for removed fundraising/event/jargon phrases.
- Browser-test public routes, forms, CTAs, and the Board OS demo.
