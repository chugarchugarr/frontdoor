# GatePass — HOA-Controlled Contractor Marketplace

**Purpose**: HOA-first permission layer between homeowners and contractors. PMC transition workflows and compliance memory get GatePass into communities; contractor access and community revenue share are the marketplace business.

**Type**: app

**Status**: active — GatePass is the primary summer lane. Current focus: investor-readiness, first paid HOA pilot, Austin contractor marketplace launch path for the Aug. 22–23 Home Show.

**Live URL**: https://frontdoor-userh9akm9bjl1wy8lioze14285.adaptive.ai

## What It Does

GatePass is the board-owned operating layer and contractor-access gate for HOA communities. It starts by helping boards move away from poor PMC control through transition intake, compliance memory, and day-to-day operating modules. The bigger business is the controlled-access marketplace: the HOA is the gatekeeper, GatePass is the gate, contractors pay to pass through, and HOAs/homeowners can earn on transactions.

**Positioning (post stress test):** Lead with Trust/compliance moat, not feature count. The asymmetric advantage is L3 Trust → L8 Memory — every violation, vote, ARC decision, and financial action stored permanently in an immutable, exportable compliance ledger. PMCs cannot match this. No other HOA software owns this layer.

**Strategic layer (Supply Chain of Intelligence):**
- Primary today: L5 Workflows
- Asymmetric advantage: L3 Trust → L8 Memory (Compliance Memory Layer — now built)
- Trajectory: CONSOLIDATES — fragmented PMC market, no dominant self-management alternative
- Moat: compliance records + vendor history + permit trails with legal/financial consequence

**GTM Wedge:** Target HOAs with PMC dissatisfaction and record/control pain. These communities enter through transition safety, compliance memory, and board-owned operations. Transition credits or recoverable support may be used case-by-case, but do not promise universal contract buyouts or guaranteed cancellation-fee coverage. Current strategic source: `.memory/gatepass/marketplace-fundraise-war-room-2026-06-24.md`.

**Moat posture (May 29/30, 2026):** Public HOA/PMC/review data is **not** the moat; it is the acquisition wedge. The uncopiable layer is the **Transition Intelligence Graph**: private PMC contract facts, board-specific switching fears, stakeholder stances, objection patterns, transition triggers, Exit Pack proof artifacts, and downstream Compliance Memory. Investor-safe line: GatePass turns every PMC exit into structured transition memory.

**Demo data boundary:** Public demo pages may use explicit static “Demo data” fallbacks for the Steiner Ranch board demo when production has no seeded HOA records. Do not seed fake production HOA records just to make the demo look active, because production metrics should remain honest real-record counts.

**Naming note:** "GatePass" risks triggering visitor management / access control mental model. Acknowledged liability — positioning copy leads with compliance/governance, not gate/access.

### 9 Modules

| Module | Function | Status |
|---|---|---|
| GatePass Core | Gate access, visitor mgmt, permit intel, contractor vetting | ✅ Live |
| PayOS | Dues collection, budgeting, financial reporting | ✅ Live |
| FineBot | Violations logging, automated notices, escalation | ✅ Live |
| ARC Agent | Architectural review, 45-day compliance tracking | ✅ Live |
| WorkOrder | Maintenance requests, vendor routing, tracking | ✅ Live |
| BoardRoom | Meetings, agendas, minutes, governance | ✅ Live |
| VoteBox | Secure elections, motions, surveys | ✅ Live |
| Amenity | Pool/clubhouse/court reservations | ✅ Live |
| CommHub | Announcements, newsletters, messaging | ✅ Live |

## Business Model

| Plan | Price | Modules |
|---|---|---|
| Full Access | $20/unit/year | All 9 modules + transition memory |
| Contractor Seat | $99 founding seat (max 25) | Austin contractor access launch |

## Architecture

- **Frontend**: React + TypeScript + Vite (`src/App.tsx` + `src/components/`)
- **Backend**: Hono + Prisma + SQLite (`src/api/procedures.ts`)
- **Payments**: Stripe Checkout (test mode)
- **Webhook ingress**: Adaptive public webhook procedure `stripeWebhook` plus Hono `/webhook/stripe` handler; both use Stripe signature verification when `STRIPE_WEBHOOK_SECRET` is set and `ProcessedStripeEvent` idempotency.
- **Permit data**: Austin Open Data API

## Component Structure

```
src/
  App.tsx              — root shell (landing, HOA onboard, OS shell)
  pages/Investors.jsx  — investor brief for $300K SAFE raise
  components/
    tokens.ts          — design system (colors, fonts, CSS)
    ui-kit.tsx         — shared components (Btn, Card, Modal, etc.)
    Sidebar.tsx        — OS navigation
    Dashboard.tsx      — HOA overview + stats
    Homeowners.tsx     — resident roster + dues accounts
    PayOS.tsx          — dues collection + budgeting
    Violations.tsx     — FineBot violation tracking
    ARCAgent.tsx       — architectural review
    BoardRoom.tsx      — meetings + governance
    VoteBox.tsx        — elections + surveys
    WorkOrders.tsx     — maintenance ops
    AmenityModule.tsx  — reservations
    CommHub.tsx        — announcements + comms
    TransitionMoat.tsx — PMC exit graph + board psychology + moat signal capture
    MarketplaceProofLoop.tsx — labeled marketplace transaction demo + production record dashboard
    InvestorProofDashboard.tsx — investor proof metrics / first-pilot checklist
    AdminConsole.tsx — private operator console for the real pilot loop
```

## Backend Procedures (44 total)

**Core**: `health`, `createHOACheckout`, `getHOAStats`, `getHOAList`, `getHOA`
**Homeowners**: `addHomeowner`, `getHomeowners`
**Contractor**: `createContractorCheckout`, `getContractorStats`, `getWaitlistPosition`
**PayOS**: `chargeMonthlyDues`, `recordPayment`, `getFinancialSummary`, `getDuesAccount`, `addBudgetLine`
**FineBot**: `createViolation`, `getViolations`, `sendViolationNotice`, `resolveViolation`
**ARC**: `submitARCRequest`, `getARCRequests`, `reviewARCRequest`
**BoardRoom**: `createMeeting`, `getMeetings`, `updateMeetingMinutes`, `addAgendaItem`
**VoteBox**: `createVote`, `getVotes`, `castVote`, `getVoteResults`, `closeVote`
**WorkOrder**: `createWorkOrder`, `getWorkOrders`, `updateWorkOrder`
**Amenity**: `createAmenity`, `getAmenities`, `createReservation`, `cancelReservation`
**CommHub**: `createAnnouncement`, `getAnnouncements`, `sendMessage`, `getMessages`, `getHOAMessages`
**Dashboard**: `getOSDashboard`
**Permits**: `getAustinPermits`
**Transition Intelligence Graph**: `createTransitionCase`, `updateTransitionCase`, `addBoardStakeholder`, `addMoatSignal`, `getTransitionMoat`, `exportPilotProofPack`

## Database Schema (SQLite via Prisma)

**Core**: User, HOA, Homeowner, HomeownerPermission, ContractorWaitlist
**PayOS**: DuesAccount, Transaction, Budget
**FineBot**: Violation, ViolationNotice
**ARC**: ARCRequest
**BoardRoom**: Meeting, AgendaItem
**VoteBox**: Vote, VoteCast
**WorkOrder**: WorkOrder
**Amenity**: Amenity, Reservation
**CommHub**: Announcement, Message
**Transition Moat**: TransitionCase, BoardStakeholder, MoatSignal
**Compliance Memory**: ComplianceEvent, ComplianceExport

## Backend Procedures (marketplace proof loop added Jun 24, 2026)

**Core**: `health`, `createHOACheckout`, `getHOAStats`, `getHOAList`, `getHOA`
**Homeowners**: `addHomeowner`, `getHomeowners`
**Contractor**: `createContractorCheckout`, `getContractorStats`, `getWaitlistPosition`
**PayOS**: `chargeMonthlyDues`, `recordPayment`, `getFinancialSummary`, `getDuesAccount`, `addBudgetLine`
**FineBot**: `createViolation`, `getViolations`, `sendViolationNotice`, `resolveViolation`
**ARC**: `submitARCRequest`, `getARCRequests`, `reviewARCRequest`
**BoardRoom**: `createMeeting`, `getMeetings`, `updateMeetingMinutes`, `addAgendaItem`
**VoteBox**: `createVote`, `getVotes`, `castVote`, `getVoteResults`, `closeVote`
**WorkOrder**: `createWorkOrder`, `getWorkOrders`, `updateWorkOrder`
**Amenity**: `createAmenity`, `getAmenities`, `createReservation`, `cancelReservation`
**CommHub**: `createAnnouncement`, `getAnnouncements`, `sendMessage`, `getMessages`, `getHOAMessages`
**Dashboard**: `getOSDashboard`
**Permits**: `getAustinPermits`
**Compliance Memory Layer (NEW)**: `logComplianceEvent` (internal), `getComplianceTimeline`, `exportCompliancePack`
**Transition Intelligence Graph (NEW)**: `createTransitionCase`, `updateTransitionCase`, `addBoardStakeholder`, `addMoatSignal`, `getTransitionMoat`, `exportPilotProofPack`
**Marketplace Proof Loop (NEW)**: `createContractorProfile`, `promoteWaitlistToContractorProfile`, `openContractorSlot`, `grantContractorCommunityAccess`, `createMarketplaceJobFromWorkOrder`, `createMarketplaceJobFromARC`, `submitContractorQuote`, `approveContractorQuote`, `settleMarketplaceTransaction`, `recordMarketplaceTransaction` (back-compatible), `recordCompliance`, `refundMarketplaceTransaction`, `recordCommunityRevenueShare`, `getMarketplaceDashboard`, `getInvestorProofMetrics`, `exportMarketplaceProofPack`

## Atomic Marketplace Proof Loop

New app surfaces:

- Public investor page: `/investors`
- Standalone CTO/investor proof loop: `/marketplace-loop`
- Standalone investor proof dashboard: `/investor-proof`
- Board demo marketplace view: `/demo?view=marketplace`
- Board demo investor proof view: `/demo?view=investor`

Purpose: show the investor-diligence loop in one screen — **software wedge → contractor access → job → GatePass fee + HOA credit → compliance memory**.

Data boundary:

- `/demo?view=marketplace`, `/demo?view=investor`, and `/demo?view=transition` use explicit static demo fallbacks for the Steiner Ranch demo HOA when production has no real records.
- Production metrics and non-demo HOA IDs query real SQLite records only.
- Do not seed fake production HOA records just to inflate traction.

Backend marketplace primitives now support:

- contractor profiles promoted from waitlist records
- community/trade access slots
- board-granted contractor community access
- jobs sourced from WorkOrders or ARC approvals
- contractor quotes and approvals
- transaction recording
- HOA community revenue-share credits
- marketplace compliance events

Investor-safe core line: **Software wedge. Marketplace business. Transition-memory moat.**

Public investor page rule: do **not** publish named investor-specific hooks or outreach targets on `/investors`. Named targeting belongs in private outreach/memory, not the public site.

CTO/GPT handoff brief: `/home/computer/storage/gatepass-marketplace-loop-cto-handoff-v1.md` / CDN `/cdn/gatepass-marketplace-loop-cto-handoff-v1.md`.

## Marketplace Hardening Integration (Jun 24/25, 2026)

Integrated the full CTO handoff hardening pack, adapted to the existing GatePass schema instead of blindly replacing field names that current UI already uses.

What changed:

- Added `ProcessedStripeEvent` ledger for Stripe webhook idempotency.
- Added `MarketplaceTransaction.idempotencyKey` and `settledAt` for retry-safe settlement.
- Added transaction-bound compliance memory via `ContractorComplianceRecord.transactionId`.
- Added state-machine guards and central fee math in `src/api/marketplace.guards.ts`.
- Hardened `submitContractorQuote`, `approveContractorQuote`, `settleMarketplaceTransaction`, `recordCompliance`, and refund handling.
- Preserved existing HOA checkout and contractor founding-seat webhook behavior while adding marketplace-job settlement support.
- Added operator console at `/admin` for the pilot loop: promote contractor → grant access → create job → quote → approve → settle → compliance → export proof pack.
- Added proof-pack PDF generation via `exportMarketplaceProofPack()` RPC. The raw Hono route exists for local/server use, but the admin UI uses RPC because Adaptive app subdomains route frontend paths through the Vite shell.

Money split remains centralized:

- GatePass fee: 5.00% of gross.
- HOA credit/share: 2.50% of gross.
- Demo example remains $18,500 gross → $925 GatePass fee → $462.50 HOA credit.

Verification completed after hardening:

- `npm run check` ✅
- `npm run lint` ✅
- `npm run prod:build` ✅ (same existing Vite chunk-size warning)
- RPC smoke tests: `health`, `getMarketplaceDashboard`, `getInvestorProofMetrics`, `exportMarketplaceProofPack` ✅
- Browser smoke tests: `/marketplace-loop`, `/investor-proof`, `/admin` ✅

## Public Website Visual Restoration (Jun 24, 2026)

The public site was restored toward the original FrontDoor/GatePass visual baseline after the marketplace proof-loop implementation drifted too far into generic investor-SaaS styling.

Current public design direction:

- Preserve the original dark Austin photo hero, forest-black surfaces, brass/gold accent, and blunt GatePass voice.
- Add an elegant editorial layer inspired by Joseph's recent field-guide artifact: sparse, direct, high-contrast, and restrained.
- Keep the core public line intact: **Software wedge. Marketplace business. Transition-memory moat.**
- Keep demo/proof data explicitly labeled as demo/sample data on public-facing surfaces.
- Avoid named investor hooks on public pages.
- Avoid fake traction, universal buyout promises, or overbroad HOA authority claims.

## Transition Intelligence Graph

New app surface: **Moat → Transition Graph**.

Demo entry: `/demo?view=transition` opens the board demo directly on the Transition Graph surface for investor/operator review.

Purpose: make GatePass more uncopiable starting with the first board conversation. Every prospect should become structured data, even before close.

What it captures:
- **PMC Exit Intake** — current PMC, source signal, complaint themes, contract status, board fear, next step.
- **Board Psychology Map** — stakeholder role, stance, primary concern, persuasion angle.
- **Moat Signals** — board objections, private contract facts, PMC failures, switching triggers, compliance risks, proof artifacts, and case-study metrics.
- **Scoring** — exit readiness, data completeness, and hard-to-copy / replicability score.
- **Pilot Proof Pack** — JSON export combining transition memory + compliance summary + first-pilot proof checklist.

Strategic rule: do not claim the scraped lead database is proprietary. Claim the transition graph becomes proprietary only after GatePass engages boards and captures private transition facts competitors cannot scrape.

## Next Steps

- [ ] Find first HOA with 1-star PMC review → execute PMC displacement play (see GTM playbook)
- [x] Wire Stripe webhook → mark paid=true on HOA/Contractor records + idempotent marketplace settlement
- [ ] Add Resend email on HOA signup, violation notices, ARC decisions
- [ ] Homeowner CSV import (bulk roster upload)
- [ ] Register domain (gatepass.io)
- [ ] Texas LLC filing ($300)
- [ ] Move to production Stripe keys
- [ ] Register the Stripe webhook URL in Stripe using Adaptive webhook endpoint format: `https://adaptive.ai/api/webhooks/app/WZY4YQNTzbCPkTT8/stripeWebhook` for platform-routed webhooks, or app route `/webhook/stripe` only if deployment routing confirms direct Hono routes are exposed in the target environment.
- [ ] Confirm `joseph@gatepass.io` email before sending Touch 1 outreach templates

## Grant Applications

- NAR REACH Commercial — deadline March 31, 2026
- NAR REACH Residential — deadline April 2026
- Capital Factory — rolling
- Google Cloud for Startups — needs business email first
- Microsoft Founders Hub — needs LinkedIn + business email
- AWS Activate Founders — rolling, fastest

## Design System

- Cream: `#F4F1EC` | Forest: `#2A5240` | Gold: `#B8883A` | Charcoal: `#1C1C1A`
- Fonts: Instrument Serif (`gp-display`) for elegant editorial headlines + Geist for body/UI + mono labels for proof/ledger details
