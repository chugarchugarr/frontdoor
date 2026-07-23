# GatePass

**Doctrine**: GatePass is the association-owned operating system that routes property work from an exterior signal to permission, verified execution, and a permanent record. Contractors pay for trusted access to communities; associations retain control of the workflow and data.

**Type**: standard Adaptive app

**Status**: active preview work. Public site is being prepared for fundraising review. Do not deploy production until Joseph approves the preview.

## Current public truth

- GatePass is pre-revenue.
- Public product screens use modeled demo data only.
- Paid HOA customers: 0.
- Production contractor transactions: 0.
- Production revenue: $0.
- Next milestone: one paid Austin HOA, one approved contractor work path, one documented completion, and one export the association can keep.

## Controlling product sequence

1. **Exterior signal** — a lawfully visible condition or a homeowner- or association-supplied observation enters as a signal. It is not a diagnosis, inspection, or authorization.
2. **Permission** — the association applies community rules and approvals. The homeowner keeps contractor choice.
3. **Trusted access** — an approved contractor may respond through the community channel. Payment never purchases board approval, ranking, a lead, or guaranteed work.
4. **Verified execution** — credentials, applicable licenses, insurance, scope, approvals, and completion evidence remain attached to the work. Verification is a defined record standard, not an endorsement or quality guarantee.
5. **Permanent record** — the association owns the workflow history and can export it when managers, management companies, vendors, or board members change.

## Operating boundaries

- GatePass can work alongside a management company, but the association remains the principal and owns the workflow, records, and export.
- Contractors pay GatePass for approved access. Associations decide who may enter their channel and what work receives permission.
- Any future association or homeowner economic benefit remains counsel-gated and is not part of the public doctrine until the legal and payment structure is approved.
- Exterior observations are limited to information lawfully visible from a public approach or supplied by the homeowner or association.
- AI may support specific workflows. It is a feature, not the product thesis or operating method.
- Doctrine changes require contact from reality: a board conversation, contractor response, investor response, counsel ruling, or deployment result.

## Source of truth

Use this file and `CODEX.md` for current product and public-copy decisions. `docs/HOA-OS-ARCHITECTURE.md` and `docs/compliance-memory-layer.md` are historical design records and must not override current doctrine.

## Pricing displayed

- HOA software: $20 per unit per year.
- Setup fee: $0.
- Founding contractor access: $99 once, after approval.
- Contractor applications do not guarantee access, leads, ranking, or job volume.

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
- Confirm the visible product path reads: exterior signal → permission → verified execution → permanent record.