# GatePass — HOA Operating System

**Purpose**: HOA self-management platform — replaces property management companies. PMC displacement play, not a tools upgrade.

**Type**: app

**Status**: active — Phase 2 complete. GTM pivot underway: targeting HOAs with 1-star PMC reviews.

**Live URL**: https://frontdoor-userh9akm9bjl1wy8lioze14285.adaptive.ai

## What It Does

GatePass is the OS for HOAs. Replaces the $50–150/unit/year management company with 9 AI agent modules at $20–22/unit/year.

**Positioning (post stress test):** Lead with Trust/compliance moat, not feature count. The asymmetric advantage is L3 Trust → L8 Memory — every violation, vote, ARC decision, and financial action stored permanently in an immutable, exportable compliance ledger. PMCs cannot match this. No other HOA software owns this layer.

**Strategic layer (Supply Chain of Intelligence):**
- Primary today: L5 Workflows
- Asymmetric advantage: L3 Trust → L8 Memory (Compliance Memory Layer — now built)
- Trajectory: CONSOLIDATES — fragmented PMC market, no dominant self-management alternative
- Moat: compliance records + vendor history + permit trails with legal/financial consequence

**GTM Wedge:** Target HOAs giving their PMC 1-star Google reviews. These communities are trapped and want out. GatePass is the escape hatch. Offer contract buyout (up to $5K) to close. See `.memory/gatepass/gtm-pmc-displacement-playbook.md`.

**Moat posture (May 29/30, 2026):** Public HOA/PMC/review data is **not** the moat; it is the acquisition wedge. The uncopiable layer is the **Transition Intelligence Graph**: private PMC contract facts, board-specific switching fears, stakeholder stances, objection patterns, transition triggers, Exit Pack proof artifacts, and downstream Compliance Memory. Investor-safe line: GatePass turns every PMC exit into structured transition memory.

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
| Starter | $20/unit/year | Core + CommHub + PayOS |
| Full OS | $22/unit/year | All 9 modules |
| Contractor Seat | $99 deposit (max 25) | Founding rate |

## Architecture

- **Frontend**: React + TypeScript + Vite (`src/App.tsx` + `src/components/`)
- **Backend**: Hono + Prisma + SQLite (`src/api/procedures.ts`)
- **Payments**: Stripe Checkout (test mode)
- **Permit data**: Austin Open Data API

## Component Structure

```
src/
  App.tsx              — root shell (landing, HOA onboard, OS shell)
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

## Backend Procedures (47 total)

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
- [ ] Wire Stripe webhook → mark paid=true on HOA/Contractor records
- [ ] Add Resend email on HOA signup, violation notices, ARC decisions
- [ ] Homeowner CSV import (bulk roster upload)
- [ ] Register domain (gatepass.io)
- [ ] Texas LLC filing ($300)
- [ ] Move to production Stripe keys
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
- Fonts: Playfair Display (headings) + DM Sans (body) + DM Mono (labels)
