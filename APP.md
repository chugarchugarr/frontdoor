# GatePass — HOA Operating System

**Purpose**: Full HOA operating system — 9 AI agent modules that replace HOA management companies

**Type**: app

**Status**: active — Phase 2 (OS build complete, public launch prep)

**Live URL**: https://frontdoor-userh9akm9bjl1wy8lioze14285.adaptive.ai

## What It Does

GatePass is the OS for HOAs. Replaces the $50–150/unit/year management company with 9 AI agent modules at $20–22/unit/year.

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

## Next Steps

- [ ] Wire Stripe webhook → mark paid=true on HOA/Contractor records
- [ ] Add Resend email on HOA signup, violation notices, ARC decisions
- [ ] Homeowner CSV import (bulk roster upload)
- [ ] Register domain (gatepass.io)
- [ ] Texas LLC filing ($300)
- [ ] Move to production Stripe keys
- [ ] NAR REACH grant deadline: March 31, 2026

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
