# GatePass Development Repository

GatePass is the association-owned operating system that routes property work from an exterior signal to permission, verified execution, and a permanent record. Contractors pay for trusted access to communities; associations retain control of the workflow and data.

The GitHub repository is named `frontdoor`; the product is always called GatePass.

## Source of truth

Read these before changing product behavior or copy:

1. [`docs/GATEPASS-DOCTRINE.md`](./docs/GATEPASS-DOCTRINE.md) — controlling statement, operative sequence, and decision test.
2. [`APP.md`](./APP.md) — public truth, pricing, routes, and product boundaries.
3. [`CODEX.md`](./CODEX.md) — implementation context, copy rules, and verification requirements.
4. Current public pages and modeled-demo constants.

Other files under `docs/` may contain historical architecture. They do not override the doctrine, `APP.md`, or `CODEX.md`.

## Product sequence

```text
exterior signal
→ association permission
→ trusted contractor access
→ verified execution
→ permanent association record
```

The exterior condition is a signal, not a diagnosis or authorization. The association applies its rules. The homeowner keeps contractor choice. Contractor payment does not buy approval, ranking, a lead, or guaranteed work. Verification is a defined record standard, not an endorsement or quality guarantee. The association owns the workflow history and export.

## Current public truth

- Pre-revenue.
- Paid HOA customers: 0.
- Production contractor transactions: 0.
- Production revenue: $0.
- Public product screens use modeled demo data only.
- Association software is displayed at $20 per unit per year with no setup fee.
- Founding contractor access is displayed at $99 once, after approval.

## Stack

- React + TypeScript + Vite
- Hono RPC backend
- Prisma + SQLite
- Tailwind CSS and custom design tokens
- TanStack Query

AI-assisted actions may support specific workflows. GatePass is not an AI company; the operating system, permissions, records, and contractor-access path are the product.

## Commands

```bash
npm install
npm run dev
npm run check
npm run lint
npm run prod:build
```

## Main routes

- `/` — public homepage
- `/investors` — investor brief and current status
- `/pricing` — association software pricing
- `/onboard` — association workflow review form
- `/contractors` — contractor application
- `/demo` — modeled product demo; noindex
- `/privacy`, `/terms` — legal pages

## Required verification

Before handoff:

1. Run `npm run check`.
2. Run `npm run lint`.
3. Run `npm run prod:build`.
4. Search public source and build output for banned pitch-deck language.
5. Test public routes, forms, CTAs, responsive behavior, and the modeled board demo.
6. Confirm the visible product path reads: exterior signal → permission → verified execution → permanent record.

## Repository naming

Use `frontdoor`, `froontdoor`, and `gatepass` as repository search aliases. Do not rename the product in public or internal copy.