# GatePass — APP.md

## What This App Does

GatePass is a neighborhood infrastructure platform — an HOA-first permission layer between homeowners and contractors. HOAs pay $10/unit/year to give their community digital gate control, permit intelligence, and a vetted contractor network. Contractors pay a $99 founding deposit to reserve one of 25 seats for first-access to verified, opted-in leads.

Austin TX only. Metro 1.

**Note:** Previously named FrontDoor. Renamed to GatePass March 17, 2026 — trademark conflict with Frontdoor Inc. (FTDR, publicly traded home warranty company).

## Live URL

https://frontdoor-userh9akm9bjl1wy8lioze14285.adaptive.ai

## Business Model

| Revenue Stream | Price | Notes |
|---|---|---|
| HOA subscription | $10/unit/year | Billed annually via Stripe |
| Contractor founding seat | $99 deposit | Max 25 seats, refundable if no launch in 6mo |
| Year 1 Target | $155K ARR | 20 HOAs + 30 contractors |

## Target HOAs (Austin Metro 1)
Steiner Ranch, Mueller, Avery Ranch, Lakeway, Circle C, Belterra, Teravista

## Tech Stack

- **Frontend**: React + TypeScript + Vite (single file: `src/App.tsx`)
- **Backend**: Hono + Prisma + SQLite (`src/api/procedures.ts`)
- **Payments**: Stripe Checkout (test mode — `sk_test_*`)
- **Permit data**: Austin Open Data API (`data.austintexas.gov/resource/3syk-w9eu.json`) with mock fallback

## Backend Procedures

| Procedure | Input | Returns |
|---|---|---|
| `health` | — | `{ status, timestamp, db }` |
| `createHOACheckout` | HOA + contact fields | `{ url, hoaId }` → Stripe redirect |
| `getHOAStats` | — | `{ totalHOAs, paidHOAs, totalUnits, arr }` |
| `createContractorCheckout` | Contractor fields | `{ url, contractorId, position }` → Stripe redirect |
| `getContractorStats` | — | `{ total, paid, remaining, spotsLeft }` |
| `getWaitlistPosition` | `id: string` | Contractor record or null |
| `getAustinPermits` | `zip?: string` | Array of permit objects |

## Database Schema (SQLite via Prisma)

- **User** — platform-managed (do not modify)
- **HOA** — community name, zip, units, contact info, Stripe session ID, paid flag
- **ContractorWaitlist** — company, contact, category, zip, position, Stripe session ID, paid flag

## Stripe Webhook (TODO)

Stripe webhooks for `checkout.session.completed` need to be wired to mark `paid=true` on HOA/ContractorWaitlist records. Use Stripe CLI or Adaptive webhook config for this when going to production.

## Design System

- Cream base: `#F4F1EC` | Forest green: `#2A5240` | Gold: `#B8883A`
- Fonts: Playfair Display (headings) + DM Sans (body) + DM Mono (labels/mono)
- Architectural grid background (4% opacity green grid, 40px cells)

## Domain Plan

- Target domain: `gatepass.io` or `getgatepass.com`
- Business email: `joseph@gatepass.io`
- Required before submitting cloud credit applications (Google, Azure, AWS)

## Grant Applications (March 2026)

All application documents written and ready to submit:
- **NAR REACH Commercial** — deadline March 31, 2026
- **NAR REACH Residential** — deadline April 2026
- **Capital Factory** — rolling, cold email ready for investor_relations@capitalfactory.com
- **Google Cloud for Startups** — rolling, needs business email first
- **Microsoft Founders Hub** — rolling, needs LinkedIn updated + business email
- **AWS Activate Founders** — rolling, fastest approval

## Next Steps

- [ ] Register domain (gatepass.io or getgatepass.com)
- [ ] Set up business email (joseph@gatepass.io)
- [ ] Wire Stripe webhook → mark paid=true on success
- [ ] Add Resend email confirmation on HOA/Contractor signup
- [ ] Connect to real Austin Open Data API token
- [ ] Add Stripe live key when going to production
- [ ] Build homeowner-facing portal (Phase 2)
- [ ] File Texas LLC ($300 at sos.state.tx.us)
