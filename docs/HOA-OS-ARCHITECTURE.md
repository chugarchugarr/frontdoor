# GatePass HOA Operating System — Architecture Document

**Version:** 2.0  
**Date:** March 2026  
**Status:** Engineering Handoff — Phase 2 Build Ready  
**Classification:** Internal — Founders + Engineering Leadership

---

## Table of Contents

1. [Product Vision & Category Kill Statement](#1-product-vision--category-kill-statement)
2. [The 9 Agent Module Specs](#2-the-9-agent-module-specs)
3. [Database Schema Evolution](#3-database-schema-evolution)
4. [Agent Architecture](#4-agent-architecture)
5. [Phased Rollout Plan](#5-phased-rollout-plan)
6. [Pricing & GTM Strategy](#6-pricing--gtm-strategy)
7. [Competitive Moat Analysis](#7-competitive-moat-analysis)
8. [Tech Decisions](#8-tech-decisions)

---

## 1. Product Vision & Category Kill Statement

### The Category We Are Eliminating

HOA management companies are a $12B/year industry built on information asymmetry. They charge $50–150/unit/year to be the middleman between residents and the operations of communities that residents already own. They hold the records. They run the meetings. They collect the dues. They send the violation notices. And they charge 10–15% of annual assessments on top of that as their management fee.

They are not providing value. They are providing access to a system that residents were never given the tools to run themselves.

**GatePass is not HOA management software.**  
**GatePass is HOA infrastructure that eliminates the need for management.**

The distinction is critical. Every competitor — CINC, Vantaca, AppFolio, BuildingLink, Buildium — sells to management companies. Their customer is the manager. They need the manager to exist to have a customer.

Our customer is the residents. We are the reason the manager no longer exists.

### The Resident Ownership Model

GatePass operates on a simple premise: a homeowner association is owned by its members. The board is elected by members. The rules are written by members. The money belongs to members. The community exists for members.

Under the current system, residents hire a management company to execute on their behalf — and lose control, transparency, and money in the process.

GatePass returns the operation to the owners:
- **AI agents** handle everything the management company's staff would do: dues billing, violation tracking, architectural reviews, work order routing, meeting agendas, election administration.
- **The board** stays in control, approving escalations, exceptions, and policy decisions — the stuff that actually requires human judgment.
- **Residents** get a portal, not a phone tree. They transact, communicate, and participate directly in the platform.
- **The community** owns its own data. No vendor lock-in. No management company walking out with the keys.

### Pricing Rationale

| Model | Cost | Who Benefits |
|---|---|---|
| Traditional management company | $50–150/unit/year | Management company |
| AppFolio / CINC (mgmt software) | ~$30–80/unit/year | Management company |
| **GatePass HOA OS** | **$20–25/unit/year** | **Residents** |

For a 200-unit community paying a management company $100/unit/year:  
- **Current spend:** $20,000/year  
- **GatePass cost:** $4,000–5,000/year  
- **Annual savings:** $15,000–16,000/year  
- **ROI pitch:** "Fire your management company. Same operations. 80% savings. You stay in control."

The $10/unit founding rate (Phase 1) was a land-grab price. The full HOA OS justifies $20–25/unit. We will grandfather founding communities at the current rate for 3 years.

---

## 2. The 9 Agent Module Specs

---

### Module 1: GatePass Core (EXISTING — EXTEND)
**Tagline:** "Your community's front door. Digital, verified, intelligent."  
**Replaces:** Manual gate logs, visitor call-ahead systems, contractor referral networks, permit research

#### Core Responsibilities
- Digital gate pass issuance and visitor authorization
- Contractor vetting against permit history and license databases
- Austin Open Data permit feed integration by zip/community
- Resident-approved guest lists
- Contractor network directory (founding 25 seats + expansion)
- Permit intelligence: surface active permits in the community for board awareness
- Delivery and service provider access windows

#### AI Agent Behaviors
**Automatic:**
- Pull Austin permit data nightly, surface new permits to board dashboard
- Flag contractors with no active license or permit history
- Generate weekly gate access summary report for board
- Auto-expire guest passes after set duration

**Requires board approval:**
- Add contractor to approved vendor list
- Issue extended access passes (>30 days)
- Blacklist a visitor

#### Data Models (additions to existing HOA / ContractorWaitlist)

```prisma
model GatePass {
  id          String   @id @default(cuid())
  hoaId       String
  hoa         HOA      @relation(fields: [hoaId], references: [id])
  residentId  String
  resident    Resident @relation(fields: [residentId], references: [id])
  visitorName String
  visitorPhone String?
  visitorEmail String?
  purpose     String   // "guest" | "contractor" | "delivery" | "service"
  validFrom   DateTime
  validUntil  DateTime
  status      String   @default("active") // "active" | "expired" | "revoked"
  usageLog    GatePassLog[]
  createdAt   DateTime @default(now())
}

model GatePassLog {
  id         String   @id @default(cuid())
  gatePassId String
  gatePass   GatePass @relation(fields: [gatePassId], references: [id])
  event      String   // "entered" | "exited" | "denied"
  timestamp  DateTime @default(now())
  note       String?
}

model PermitSnapshot {
  id          String   @id @default(cuid())
  hoaId       String
  hoa         HOA      @relation(fields: [hoaId], references: [id])
  permitNum   String
  type        String
  description String?
  address     String
  zip         String
  contractor  String?
  value       String?
  issuedDate  DateTime?
  status      String?
  snapshotAt  DateTime @default(now())
}
```

#### RPC Procedures
```typescript
createGatePass(input: { hoaId, residentId, visitorName, visitorPhone?, purpose, validFrom, validUntil }) => GatePass
revokeGatePass(id: string) => void
getActiveGatePasses(hoaId: string) => GatePass[]
logGateEvent(gatePassId: string, event: "entered" | "exited" | "denied", note?: string) => void
getPermitSnapshot(hoaId: string, zip: string) => PermitSnapshot[]
syncPermits(hoaId: string) => { added: number, updated: number }
```

#### UI Screens
- Gate Pass Dashboard (active passes, recent activity)
- Issue New Pass (form: visitor info, purpose, validity window)
- Permit Feed (filtered by community zip)
- Contractor Directory (approved vendors + founding seats)

---

### Module 2: FineBot
**Tagline:** "Violations handled before anyone picks up the phone."  
**Replaces:** Property manager inspection trips, violation notice drafting, enforcement tracking, lien escalation coordination

#### Core Responsibilities
- Violation report intake (photo + description + GPS-tagged address)
- Auto-categorized by violation type (landscaping, parking, architectural, noise, trash)
- Notice generation with AI-drafted letter based on CC&R section reference
- Escalation ladder: Courtesy → Warning → Fine → Lien referral
- Cure period tracking with automated follow-up
- Board override capability at any escalation stage
- Violation history per property (searchable)
- Fine ledger tied to PayOS

#### AI Agent Behaviors
**Automatic:**
- Generate first courtesy notice (board can edit before send, or auto-send if configured)
- Track cure deadlines and send reminders
- Escalate from Warning → Fine after cure period expires with no resolution
- Daily digest of open violations to board
- Flag repeat violators (>3 in 12 months) for board attention

**Requires board approval:**
- Issue formal fine (amount + due date)
- Escalate to lien referral
- Mark violation resolved and close case
- Override or dismiss any stage

#### Data Models

```prisma
model Violation {
  id           String   @id @default(cuid())
  hoaId        String
  hoa          HOA      @relation(fields: [hoaId], references: [id])
  propertyId   String
  property     Property @relation(fields: [propertyId], references: [id])
  reportedById String?
  reportedBy   Resident? @relation("ViolationReporter", fields: [reportedById], references: [id])
  category     String   // "landscaping" | "parking" | "architectural" | "noise" | "trash" | "other"
  description  String
  photoUrls    String?  // JSON array of CDN URLs
  address      String
  ccrSection   String?
  status       String   @default("open") // "open" | "courtesy_sent" | "warning_sent" | "fine_issued" | "resolved" | "lien_referred"
  stage        Int      @default(0)       // 0=new, 1=courtesy, 2=warning, 3=fine, 4=lien
  cureDeadline DateTime?
  fineAmount   Int?     // cents
  finePaid     Boolean  @default(false)
  notes        ViolationNote[]
  notices      ViolationNotice[]
  createdAt    DateTime @default(now())
  resolvedAt   DateTime?
}

model ViolationNote {
  id          String    @id @default(cuid())
  violationId String
  violation   Violation @relation(fields: [violationId], references: [id])
  authorId    String
  content     String
  createdAt   DateTime  @default(now())
}

model ViolationNotice {
  id          String    @id @default(cuid())
  violationId String
  violation   Violation @relation(fields: [violationId], references: [id])
  type        String    // "courtesy" | "warning" | "fine" | "lien_notice"
  content     String    // full notice text
  sentAt      DateTime?
  deliveryMethod String @default("email") // "email" | "mail" | "portal"
  createdAt   DateTime  @default(now())
}
```

#### RPC Procedures
```typescript
reportViolation(input: { hoaId, propertyId, category, description, photoUrls?, address, ccrSection? }) => Violation
generateNotice(violationId: string, type: "courtesy" | "warning" | "fine" | "lien_notice") => ViolationNotice
sendNotice(noticeId: string) => void
escalateViolation(violationId: string, approvedByBoardMemberId: string) => Violation
resolveViolation(violationId: string, note: string) => Violation
getViolations(hoaId: string, status?: string) => Violation[]
getViolationHistory(propertyId: string) => Violation[]
getViolationStats(hoaId: string) => { open: number, byCategory: Record<string, number>, avgDaysToResolution: number }
```

#### UI Screens
- Violation Dashboard (open cases, by category, escalation queue)
- Report Violation (photo upload, category, description, address lookup)
- Violation Detail (history timeline, notices, action buttons)
- Property Violation History
- Board Approval Queue (notices waiting for send approval)

---

### Module 3: PayOS
**Tagline:** "Every dollar in. Every dollar tracked. Zero manual collection."  
**Replaces:** Management company accounting staff, dues billing, late fee administration, reserve fund tracking, annual financial reports, audit prep

#### Core Responsibilities
- Annual dues billing per unit (configurable amount, billing cycle)
- Stripe-powered collection: ACH/card, autopay enrollment
- Late fee calculation and assessment (configurable grace period)
- Reserve fund tracking (separate ledger from operating fund)
- Budget builder and approval workflow
- Expense tracking and vendor payment authorization
- Monthly P&L auto-report to board
- Year-end financial summary (board + residents)
- Special assessment levying (one-time + installment)

#### AI Agent Behaviors
**Automatic:**
- Generate dues invoices on billing cycle (monthly or annual)
- Apply late fees after grace period
- Send payment reminders (7 days before, 1 day before, day of, 3 days after)
- Reconcile Stripe payments against ledger
- Generate monthly board financial digest
- Flag accounts 90+ days past due for board action

**Requires board approval:**
- Set/change dues amount
- Levy special assessment
- Authorize vendor payment >$500
- Write off unpaid balance
- Approve annual budget

#### Data Models

```prisma
model Property {
  id           String   @id @default(cuid())
  hoaId        String
  hoa          HOA      @relation(fields: [hoaId], references: [id])
  address      String
  unit         String?
  residentId   String?
  resident     Resident? @relation(fields: [residentId], references: [id])
  ownerName    String
  ownerEmail   String
  ownerPhone   String?
  mailingAddress String?
  accountBalance Int    @default(0) // cents, positive = owes HOA
  autopayEnabled Boolean @default(false)
  stripeCustomerId String?
  violations   Violation[]
  payments     Payment[]
  invoices     Invoice[]
  createdAt    DateTime @default(now())
}

model Invoice {
  id            String   @id @default(cuid())
  hoaId         String
  hoa           HOA      @relation(fields: [hoaId], references: [id])
  propertyId    String
  property      Property @relation(fields: [propertyId], references: [id])
  type          String   // "dues" | "special_assessment" | "fine" | "late_fee"
  description   String
  amountCents   Int
  dueDate       DateTime
  paidAt        DateTime?
  paidAmountCents Int    @default(0)
  status        String   @default("open") // "open" | "partial" | "paid" | "overdue" | "waived"
  stripePaymentIntentId String?
  payments      Payment[]
  createdAt     DateTime @default(now())
}

model Payment {
  id            String   @id @default(cuid())
  hoaId         String
  hoa           HOA      @relation(fields: [hoaId], references: [id])
  propertyId    String
  property      Property @relation(fields: [propertyId], references: [id])
  invoiceId     String?
  invoice       Invoice? @relation(fields: [invoiceId], references: [id])
  amountCents   Int
  method        String   // "stripe_card" | "stripe_ach" | "check" | "cash"
  stripePaymentIntentId String?
  note          String?
  recordedAt    DateTime @default(now())
}

model Budget {
  id            String   @id @default(cuid())
  hoaId         String
  hoa           HOA      @relation(fields: [hoaId], references: [id])
  fiscalYear    Int
  status        String   @default("draft") // "draft" | "pending_approval" | "approved"
  approvedAt    DateTime?
  approvedBy    String?
  lineItems     BudgetLineItem[]
  totalRevenue  Int      // cents
  totalExpenses Int      // cents
  reserveContribution Int // cents
  createdAt     DateTime @default(now())
}

model BudgetLineItem {
  id          String @id @default(cuid())
  budgetId    String
  budget      Budget @relation(fields: [budgetId], references: [id])
  category    String // "maintenance" | "insurance" | "utilities" | "legal" | "reserve" | "management" | "other"
  description String
  amountCents Int
}

model ReserveFund {
  id          String   @id @default(cuid())
  hoaId       String
  hoa         HOA      @relation(fields: [hoaId], references: [id])
  balanceCents Int     @default(0)
  lastUpdated DateTime @default(now())
  transactions ReserveFundTransaction[]
}

model ReserveFundTransaction {
  id            String      @id @default(cuid())
  reserveFundId String
  reserveFund   ReserveFund @relation(fields: [reserveFundId], references: [id])
  type          String      // "contribution" | "withdrawal"
  amountCents   Int
  description   String
  authorizedBy  String?
  recordedAt    DateTime    @default(now())
}
```

#### RPC Procedures
```typescript
generateDuesBatch(hoaId: string, dueDate: DateTime) => { created: number, totalAmountCents: number }
getFinancialSummary(hoaId: string, month?: number, year?: number) => FinancialSummary
getDelinquentAccounts(hoaId: string, daysPastDue: number) => Property[]
createSpecialAssessment(input: { hoaId, description, amountCents, dueDate, installments? }) => Invoice[]
recordManualPayment(input: { propertyId, amountCents, method, note?, invoiceId? }) => Payment
createPaymentCheckout(input: { propertyId, invoiceId }) => { url: string }
getPropertyLedger(propertyId: string) => { invoices: Invoice[], payments: Payment[], balance: number }
getBudget(hoaId: string, fiscalYear: number) => Budget
upsertBudget(input: Budget) => Budget
approveBudget(budgetId: string, boardMemberId: string) => Budget
getReserveFundBalance(hoaId: string) => ReserveFund
recordReserveTransaction(input: { hoaId, type, amountCents, description, authorizedBy }) => ReserveFundTransaction
```

#### UI Screens
- Financial Dashboard (operating balance, reserve balance, delinquency rate, monthly trend)
- Property Ledger (per-unit invoice + payment history)
- Dues Billing (batch generate, send, track)
- Budget Builder (line-item editor, approval workflow)
- Reserve Fund Tracker
- Payment Portal (resident-facing: view balance, pay invoice, enroll autopay)

---

### Module 4: ARC Agent
**Tagline:** "Architectural review on time, every time. No committee phone tag."  
**Replaces:** Architectural Review Committee (ARC) coordinator, document intake staff, approval timeline tracking

#### Core Responsibilities
- Homeowner submission portal (plans, photos, descriptions)
- CC&R design guideline library (searchable, versioned)
- Automated submission acknowledgment and completeness check
- 30/45-day review timer with board alert before expiration (TX law: approval by default if no response in 30-45 days)
- Committee assignment and individual voting
- Approval, denial, or conditional approval with conditions tracked
- Revision request and re-submission flow
- Full audit log (legally required)

#### AI Agent Behaviors
**Automatic:**
- Acknowledge submission within minutes with receipt number
- Check submission completeness against checklist
- Flag submissions that reference unapproved materials or colors (compare against guidelines)
- Remind committee members of pending votes (7 days before deadline)
- Escalate to board president if quorum not reached by deadline minus 3 days
- Draft initial analysis memo for committee (what was submitted, relevant guideline sections, comparable prior approvals)

**Requires board/committee approval:**
- All final approval, denial, or conditional decisions
- Any extension of review period beyond default

#### Data Models

```prisma
model ARCSubmission {
  id            String   @id @default(cuid())
  hoaId         String
  hoa           HOA      @relation(fields: [hoaId], references: [id])
  propertyId    String
  property      Property @relation(fields: [propertyId], references: [id])
  submittedById String
  submittedBy   Resident @relation(fields: [submittedById], references: [id])
  projectType   String   // "addition" | "fence" | "paint" | "landscaping" | "solar" | "roof" | "deck" | "other"
  description   String
  documentUrls  String?  // JSON array of CDN URLs
  photoUrls     String?  // JSON array of CDN URLs
  status        String   @default("pending") // "pending" | "under_review" | "approved" | "denied" | "conditional" | "revision_requested" | "withdrawn"
  reviewDeadline DateTime
  votes         ARCVote[]
  decision      ARCDecision?
  notes         ARCNote[]
  receiptNumber String   @unique
  createdAt     DateTime @default(now())
  decidedAt     DateTime?
}

model ARCVote {
  id           String       @id @default(cuid())
  submissionId String
  submission   ARCSubmission @relation(fields: [submissionId], references: [id])
  boardMemberId String
  boardMember  BoardMember  @relation(fields: [boardMemberId], references: [id])
  vote         String       // "approve" | "deny" | "conditional" | "abstain"
  comment      String?
  votedAt      DateTime     @default(now())
}

model ARCDecision {
  id              String       @id @default(cuid())
  submissionId    String       @unique
  submission      ARCSubmission @relation(fields: [submissionId], references: [id])
  decision        String       // "approved" | "denied" | "conditional"
  conditions      String?      // if conditional
  reasoning       String
  decidedByBoardId String
  notifiedAt      DateTime?
  createdAt       DateTime     @default(now())
}

model ARCNote {
  id           String       @id @default(cuid())
  submissionId String
  submission   ARCSubmission @relation(fields: [submissionId], references: [id])
  authorId     String
  content      String
  internal     Boolean      @default(false)
  createdAt    DateTime     @default(now())
}

model DesignGuideline {
  id          String   @id @default(cuid())
  hoaId       String
  hoa         HOA      @relation(fields: [hoaId], references: [id])
  category    String   // "colors" | "materials" | "structures" | "landscaping" | "lighting"
  title       String
  content     String
  version     Int      @default(1)
  effectiveDate DateTime
  supersedes  String?  // prior guideline ID
  createdAt   DateTime @default(now())
}
```

#### RPC Procedures
```typescript
submitARCRequest(input: { hoaId, propertyId, projectType, description, documentUrls?, photoUrls? }) => ARCSubmission
getARCSubmission(id: string) => ARCSubmission
getARCQueue(hoaId: string, status?: string) => ARCSubmission[]
castARCVote(input: { submissionId, boardMemberId, vote, comment? }) => ARCVote
issueARCDecision(input: { submissionId, decision, conditions?, reasoning, decidedByBoardId }) => ARCDecision
requestRevision(submissionId: string, note: string) => ARCSubmission
getDesignGuidelines(hoaId: string, category?: string) => DesignGuideline[]
upsertDesignGuideline(input: DesignGuideline) => DesignGuideline
getExpiringReviews(hoaId: string, daysUntilDeadline: number) => ARCSubmission[]
```

#### UI Screens
- ARC Dashboard (queue by status, upcoming deadlines, expiring reviews alert)
- Submit Request (resident-facing: project type, description, file uploads)
- Submission Detail (committee view: docs, photos, votes, notes, decision panel)
- Design Guidelines Library (searchable, categorized)
- Decision History (all decisions, searchable by property/type/outcome)

---

### Module 5: BoardRoom
**Tagline:** "Meetings that run themselves. Minutes that write themselves."  
**Replaces:** Management company meeting coordination, agenda prep, minutes transcription, document management, record-keeping compliance

#### Core Responsibilities
- Meeting scheduling (board meetings, annual general meetings, special meetings, committee meetings)
- Agenda builder with template library
- Quorum tracker (configurable: % of board required)
- Meeting notes / minutes real-time editor
- AI-assisted minutes draft from notes input
- Action item assignment and tracking from meeting decisions
- Document vault (CC&Rs, bylaws, budgets, contracts, meeting minutes — all versioned)
- Board member directory and role management
- Texas HOA Open Meetings Act compliance flags

#### AI Agent Behaviors
**Automatic:**
- Pre-populate agenda from: open violations awaiting board action, pending ARC votes, unpaid invoices flagged, WorkOrder items needing authorization
- Generate draft minutes from notes input (AI cleans, formats, extracts action items)
- Assign and track action items with due dates
- Reminder 48h and 24h before meeting to all board members
- Auto-archive approved minutes to document vault

**Requires board approval:**
- Approve final meeting minutes
- Publish agenda to resident portal
- Authorize any document upload to vault
- Assign board member roles

#### Data Models

```prisma
model BoardMember {
  id          String   @id @default(cuid())
  hoaId       String
  hoa         HOA      @relation(fields: [hoaId], references: [id])
  residentId  String
  resident    Resident @relation(fields: [residentId], references: [id])
  role        String   // "president" | "vp" | "secretary" | "treasurer" | "member_at_large"
  startDate   DateTime
  endDate     DateTime?
  active      Boolean  @default(true)
  arcVotes    ARCVote[]
  votes       BoardVote[]
  createdAt   DateTime @default(now())
}

model Meeting {
  id          String   @id @default(cuid())
  hoaId       String
  hoa         HOA      @relation(fields: [hoaId], references: [id])
  type        String   // "board" | "annual" | "special" | "committee"
  title       String
  scheduledAt DateTime
  location    String?
  virtualLink String?
  status      String   @default("scheduled") // "scheduled" | "in_progress" | "completed" | "cancelled"
  quorumReached Boolean @default(false)
  agendaItems AgendaItem[]
  attendees   MeetingAttendee[]
  minutes     MeetingMinutes?
  actionItems ActionItem[]
  createdAt   DateTime @default(now())
}

model AgendaItem {
  id          String   @id @default(cuid())
  meetingId   String
  meeting     Meeting  @relation(fields: [meetingId], references: [id])
  order       Int
  title       String
  description String?
  type        String   // "discussion" | "vote" | "report" | "announcement"
  linkedModule String? // "violation" | "arc" | "workorder" | "budget" | null
  linkedId    String?
  duration    Int?     // minutes
  status      String   @default("pending") // "pending" | "completed" | "tabled"
}

model MeetingAttendee {
  id          String   @id @default(cuid())
  meetingId   String
  meeting     Meeting  @relation(fields: [meetingId], references: [id])
  boardMemberId String
  boardMember BoardMember @relation(fields: [boardMemberId], references: [id])
  present     Boolean  @default(false)
}

model MeetingMinutes {
  id          String   @id @default(cuid())
  meetingId   String   @unique
  meeting     Meeting  @relation(fields: [meetingId], references: [id])
  rawNotes    String?
  draftContent String?
  finalContent String?
  status      String   @default("draft") // "draft" | "pending_approval" | "approved"
  approvedAt  DateTime?
  approvedById String?
  publishedAt DateTime?
  createdAt   DateTime @default(now())
}

model ActionItem {
  id          String   @id @default(cuid())
  meetingId   String
  meeting     Meeting  @relation(fields: [meetingId], references: [id])
  description String
  assignedTo  String?  // boardMemberId
  dueDate     DateTime?
  status      String   @default("open") // "open" | "in_progress" | "completed"
  completedAt DateTime?
}

model Document {
  id          String   @id @default(cuid())
  hoaId       String
  hoa         HOA      @relation(fields: [hoaId], references: [id])
  category    String   // "ccr" | "bylaws" | "minutes" | "budget" | "contract" | "insurance" | "correspondence" | "other"
  title       String
  description String?
  fileUrl     String
  fileType    String
  version     Int      @default(1)
  supersedes  String?
  uploadedBy  String
  publishedToResidents Boolean @default(false)
  createdAt   DateTime @default(now())
}
```

#### RPC Procedures
```typescript
scheduleMeeting(input: { hoaId, type, title, scheduledAt, location?, virtualLink? }) => Meeting
buildAgenda(meetingId: string) => AgendaItem[] // auto-populates from open items
addAgendaItem(input: { meetingId, title, description?, type, linkedModule?, linkedId?, order }) => AgendaItem
recordAttendance(meetingId: string, attendees: { boardMemberId: string, present: boolean }[]) => void
checkQuorum(meetingId: string) => { quorumReached: boolean, present: number, required: number }
draftMinutes(meetingId: string, rawNotes: string) => MeetingMinutes // AI drafts from raw notes
approveMinutes(minutesId: string, boardMemberId: string) => MeetingMinutes
getMeetings(hoaId: string, upcoming?: boolean) => Meeting[]
uploadDocument(input: { hoaId, category, title, fileUrl, fileType, uploadedBy }) => Document
getDocuments(hoaId: string, category?: string) => Document[]
getActionItems(hoaId: string, status?: string) => ActionItem[]
```

#### UI Screens
- Board Dashboard (upcoming meetings, open action items, pending approvals)
- Meeting Detail (agenda, attendance, minutes editor, action items)
- Schedule Meeting (form + calendar picker)
- Document Vault (grid view, categorized, version history)
- Action Item Tracker

---

### Module 6: VoteBox
**Tagline:** "Fair elections. Instant results. Legally compliant."  
**Replaces:** Election coordinator, paper ballots, vote counting, proxy management, compliance tracking

#### Core Responsibilities
- Board elections (seat nominations, candidate profiles, secure ballot)
- Community surveys and polls
- Motion voting (board-level and community-level)
- Proxy collection and validation
- Quorum calculation for official votes
- Texas HOA election compliance: Texas Property Code Chapter 209 (nonprofit HOAs), Chapter 82 (condos)
- Election timeline management (notice period, voting window, results certification)
- Audit trail (all votes immutable, timestamped)

#### AI Agent Behaviors
**Automatic:**
- Generate election notice per TX statute timing requirements
- Send ballot links to all registered voters (residents)
- Remind non-voters 48h before close
- Calculate real-time quorum status
- Close ballot at deadline and compile results
- Generate certified results document

**Requires board approval:**
- Publish election/vote
- Certify results
- Invalidate a ballot (fraud/error)
- Extend voting period

#### Data Models

```prisma
model Election {
  id            String   @id @default(cuid())
  hoaId         String
  hoa           HOA      @relation(fields: [hoaId], references: [id])
  type          String   // "board_election" | "survey" | "motion" | "special_vote"
  title         String
  description   String?
  status        String   @default("draft") // "draft" | "notice_sent" | "open" | "closed" | "certified"
  noticeDate    DateTime?
  openDate      DateTime
  closeDate     DateTime
  quorumRequired Int?    // number of voters needed
  questions     ElectionQuestion[]
  ballots       Ballot[]
  resultCertifiedAt DateTime?
  resultCertifiedBy String?
  createdAt     DateTime @default(now())
}

model ElectionQuestion {
  id          String   @id @default(cuid())
  electionId  String
  election    Election @relation(fields: [electionId], references: [id])
  order       Int
  text        String
  type        String   // "single_choice" | "multi_choice" | "yes_no" | "ranked"
  options     ElectionOption[]
  maxChoices  Int      @default(1)
}

model ElectionOption {
  id          String          @id @default(cuid())
  questionId  String
  question    ElectionQuestion @relation(fields: [questionId], references: [id])
  text        String
  description String?
  photoUrl    String?
  votes       BallotAnswer[]
}

model Ballot {
  id          String   @id @default(cuid())
  electionId  String
  election    Election @relation(fields: [electionId], references: [id])
  propertyId  String
  property    Property @relation(fields: [propertyId], references: [id])
  voterToken  String   @unique // anonymous token for voter verification
  submittedAt DateTime?
  isProxy     Boolean  @default(false)
  proxyFor    String?
  answers     BallotAnswer[]
}

model BallotAnswer {
  id          String         @id @default(cuid())
  ballotId    String
  ballot      Ballot         @relation(fields: [ballotId], references: [id])
  questionId  String
  optionId    String
  option      ElectionOption @relation(fields: [optionId], references: [id])
}
```

#### RPC Procedures
```typescript
createElection(input: { hoaId, type, title, description?, openDate, closeDate, questions: QuestionInput[] }) => Election
publishElection(electionId: string, boardMemberId: string) => Election
castBallot(input: { voterToken: string, answers: { questionId: string, optionIds: string[] }[] }) => Ballot
getBallotForVoter(propertyId: string, electionId: string) => { ballot: Ballot, voterToken: string }
getElectionResults(electionId: string) => ElectionResults
getElectionStatus(electionId: string) => { status, totalEligible, voted, quorumMet, timeRemaining }
certifyResults(electionId: string, boardMemberId: string) => Election
getElections(hoaId: string) => Election[]
```

#### UI Screens
- Elections Dashboard (active, upcoming, past)
- Create Election/Survey (question builder, timeline)
- Voting Portal (resident-facing: clean ballot UI, confirmation)
- Results View (real-time tally, charts, certification status)
- Proxy Submission (resident designates proxy voter)

---

### Module 7: WorkOrder
**Tagline:** "Request it. Route it. Resolve it. No calls, no lost tickets."  
**Replaces:** Management company maintenance coordinator, contractor dispatch, work order tracking, vendor invoice processing

#### Core Responsibilities
- Resident maintenance request intake (common areas only)
- Photo documentation of issue
- Auto-categorize by trade (plumbing, electrical, landscaping, pool, structural)
- Route to approved vendor from contractor network
- Vendor quote intake and board approval for jobs >$500
- Work order status tracking (open → assigned → in_progress → completed)
- Completion photo verification
- Invoice intake and payment authorization via PayOS
- Maintenance schedule (recurring tasks: pool service, lawn, HVAC inspection)

#### AI Agent Behaviors
**Automatic:**
- Categorize request and suggest top 3 approved vendors by trade
- Auto-assign for pre-approved recurring services under $500
- Send status updates to requesting resident
- Flag jobs not accepted within 24h, escalate to board
- Generate monthly maintenance summary for board

**Requires board approval:**
- Any job >$500 (get 2 quotes, present to board)
- New vendor not in approved network
- Emergency spend over $1,000 (retroactive approval)

#### Data Models

```prisma
model WorkOrder {
  id            String   @id @default(cuid())
  hoaId         String
  hoa           HOA      @relation(fields: [hoaId], references: [id])
  requestedById String
  requestedBy   Resident @relation(fields: [requestedById], references: [id])
  category      String   // "plumbing" | "electrical" | "landscaping" | "pool" | "structural" | "hvac" | "general" | "other"
  title         String
  description   String
  location      String   // where in common area
  photoUrls     String?  // JSON array
  priority      String   @default("normal") // "low" | "normal" | "high" | "emergency"
  status        String   @default("open") // "open" | "quoted" | "approved" | "assigned" | "in_progress" | "completed" | "cancelled"
  assignedVendorId String?
  assignedVendor ContractorWaitlist? @relation(fields: [assignedVendorId], references: [id])
  estimateCents Int?
  actualCostCents Int?
  invoiceUrl    String?
  scheduledFor  DateTime?
  completedAt   DateTime?
  completionPhotoUrls String?
  notes         WorkOrderNote[]
  createdAt     DateTime @default(now())
}

model WorkOrderNote {
  id          String    @id @default(cuid())
  workOrderId String
  workOrder   WorkOrder @relation(fields: [workOrderId], references: [id])
  authorId    String
  content     String
  internal    Boolean   @default(false)
  createdAt   DateTime  @default(now())
}

model MaintenanceSchedule {
  id          String   @id @default(cuid())
  hoaId       String
  hoa         HOA      @relation(fields: [hoaId], references: [id])
  title       String
  category    String
  vendorId    String?
  frequency   String   // "weekly" | "monthly" | "quarterly" | "annual"
  nextDue     DateTime
  lastCompleted DateTime?
  autoCreate  Boolean  @default(true) // auto-generate WorkOrder when due
  estimateCents Int?
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
}
```

#### RPC Procedures
```typescript
submitWorkOrder(input: { hoaId, requestedById, category, title, description, location, photoUrls?, priority? }) => WorkOrder
assignWorkOrder(input: { workOrderId, vendorId, scheduledFor? }) => WorkOrder
updateWorkOrderStatus(workOrderId: string, status: string, note?: string) => WorkOrder
completeWorkOrder(input: { workOrderId, completionPhotoUrls?, actualCostCents? }) => WorkOrder
getWorkOrders(hoaId: string, status?: string, category?: string) => WorkOrder[]
getMaintenanceSchedule(hoaId: string) => MaintenanceSchedule[]
upsertMaintenanceSchedule(input: MaintenanceSchedule) => MaintenanceSchedule
getPendingBoardApprovals(hoaId: string) => WorkOrder[] // jobs awaiting quote approval
```

#### UI Screens
- Work Order Dashboard (open, in-progress, completed, maintenance schedule)
- Submit Request (resident-facing: location, category, photos, description)
- Work Order Detail (status timeline, vendor info, photos, notes)
- Vendor Assignment Panel (board: view quotes, select vendor, approve)
- Maintenance Schedule (recurring tasks calendar view)

---

### Module 8: Amenity
**Tagline:** "Book it in 10 seconds. Every time."  
**Replaces:** Amenity reservation spreadsheets, phone call bookings, key checkout systems, capacity enforcement

#### Core Responsibilities
- Amenity catalog (pool, clubhouse, tennis/pickleball courts, dog park, gym, pavilion)
- Online reservation booking with calendar view
- Capacity rules (max occupants per reservation)
- Reservation windows (how far in advance, duration limits)
- Resident authentication (only active residents can book)
- Waitlist for peak capacity slots
- Recurring reservation support (weekly HOA meetings, regular events)
- Amenity rules and usage guidelines per facility
- Maintenance windows (block booking during scheduled service)

#### AI Agent Behaviors
**Automatic:**
- Confirm reservations and send reminder 24h before
- Release unclaimed reservations after grace period
- Block amenity when WorkOrder scheduled for that facility
- Generate weekly amenity usage report for board
- Waitlist auto-promote when cancellation occurs

**Requires board approval:**
- Approve exclusive-use reservations (full-day rentals)
- Override capacity limits for board-authorized events
- Add/modify amenity rules

#### Data Models

```prisma
model Amenity {
  id            String   @id @default(cuid())
  hoaId         String
  hoa           HOA      @relation(fields: [hoaId], references: [id])
  name          String
  type          String   // "pool" | "clubhouse" | "court" | "gym" | "dog_park" | "pavilion" | "other"
  description   String?
  capacity      Int
  rules         String?
  photoUrl      String?
  active        Boolean  @default(true)
  reservations  AmenityReservation[]
  timeSlots     AmenityTimeSlot[]
  createdAt     DateTime @default(now())
}

model AmenityTimeSlot {
  id          String   @id @default(cuid())
  amenityId   String
  amenity     Amenity  @relation(fields: [amenityId], references: [id])
  dayOfWeek   Int?     // 0=Sun, null=all days
  startTime   String   // "HH:MM"
  endTime     String   // "HH:MM"
  slotDuration Int     // minutes
  maxAdvanceDays Int   @default(14)
  active      Boolean  @default(true)
}

model AmenityReservation {
  id            String   @id @default(cuid())
  amenityId     String
  amenity       Amenity  @relation(fields: [amenityId], references: [id])
  residentId    String
  resident      Resident @relation(fields: [residentId], references: [id])
  propertyId    String
  property      Property @relation(fields: [propertyId], references: [id])
  startTime     DateTime
  endTime       DateTime
  guestCount    Int      @default(1)
  status        String   @default("confirmed") // "confirmed" | "cancelled" | "no_show" | "completed"
  isRecurring   Boolean  @default(false)
  recurringGroupId String?
  note          String?
  cancelledAt   DateTime?
  cancelledBy   String?
  createdAt     DateTime @default(now())
}

model AmenityWaitlist {
  id          String   @id @default(cuid())
  amenityId   String
  amenity     Amenity  @relation(fields: [amenityId], references: [id])
  residentId  String
  resident    Resident @relation(fields: [residentId], references: [id])
  desiredDate DateTime
  desiredStartTime String
  notifiedAt  DateTime?
  status      String   @default("waiting") // "waiting" | "notified" | "booked" | "expired"
  createdAt   DateTime @default(now())
}
```

#### RPC Procedures
```typescript
getAmenities(hoaId: string) => Amenity[]
getAvailability(amenityId: string, date: Date) => TimeSlot[]
createReservation(input: { amenityId, residentId, propertyId, startTime, endTime, guestCount?, note? }) => AmenityReservation
cancelReservation(reservationId: string, cancelledBy: string) => AmenityReservation
getMyReservations(residentId: string) => AmenityReservation[]
getAmenitySchedule(amenityId: string, weekOf: Date) => AmenityReservation[]
joinWaitlist(input: { amenityId, residentId, desiredDate, desiredStartTime }) => AmenityWaitlist
blockAmenity(input: { amenityId, startTime, endTime, reason: string }) => void // for maintenance
```

#### UI Screens
- Amenity Home (card grid of all amenities with availability indicator)
- Amenity Detail (photo, rules, calendar availability view)
- Book Reservation (time slot picker, guest count, confirm)
- My Reservations (upcoming, past, cancel button)
- Board: Amenity Management (rules editor, time slot config, maintenance blocking)

---

### Module 9: CommHub
**Tagline:** "One place for everything. No more email chains, no phone tags, no lost notices."  
**Replaces:** Management company communications coordinator, community newsletter, resident portal, dispute resolution

#### Core Responsibilities
- Community announcements (board-originated, pinned, categorized)
- Resident-to-board messaging (private threads, tracked)
- Resident-to-resident community forum (moderated)
- Digital newsletter builder and distribution (Resend)
- Push notification + email + SMS broadcast
- Dispute resolution intake (private, neutral, tracked)
- Community classifieds (buy/sell/swap within community)
- Event calendar (community events, not meetings — that's BoardRoom)
- Emergency broadcast (all-hands alert for urgent situations)

#### AI Agent Behaviors
**Automatic:**
- Route resident messages to correct module (maintenance issue → WorkOrder, billing → PayOS, violation question → FineBot)
- Draft board responses to common inquiries (late fee dispute, rule clarification) for board review
- Weekly community digest email to all residents
- Flag dispute submissions to board president
- Moderate forum for community guidelines violations

**Requires board approval:**
- Send community-wide announcement
- Publish newsletter
- Resolve dispute with official board finding
- Remove forum post
- Send emergency broadcast

#### Data Models

```prisma
model Resident {
  id             String   @id @default(cuid())
  hoaId          String
  hoa            HOA      @relation(fields: [hoaId], references: [id])
  userId         String?  // link to platform User if they've logged in
  user           User?    @relation(fields: [userId], references: [id])
  firstName      String
  lastName       String
  email          String
  phone          String?
  propertyId     String?
  property       Property? @relation(fields: [propertyId], references: [id])
  type           String   @default("owner") // "owner" | "tenant" | "board_member"
  active         Boolean  @default(true)
  notifyEmail    Boolean  @default(true)
  notifyPush     Boolean  @default(false)
  notifySms      Boolean  @default(false)
  gatePasses     GatePass[]
  violations     Violation[] @relation("ViolationReporter")
  arcSubmissions ARCSubmission[]
  workOrders     WorkOrder[]
  reservations   AmenityReservation[]
  waitlists      AmenityWaitlist[]
  messages       Message[]
  createdAt      DateTime @default(now())
}

model Announcement {
  id          String   @id @default(cuid())
  hoaId       String
  hoa         HOA      @relation(fields: [hoaId], references: [id])
  authorId    String
  title       String
  content     String
  category    String   // "general" | "maintenance" | "financial" | "emergency" | "event"
  pinned      Boolean  @default(false)
  publishedAt DateTime?
  expiresAt   DateTime?
  sentVia     String?  // JSON: ["email", "push", "sms"]
  createdAt   DateTime @default(now())
}

model Message {
  id          String   @id @default(cuid())
  hoaId       String
  hoa         HOA      @relation(fields: [hoaId], references: [id])
  threadId    String
  thread      MessageThread @relation(fields: [threadId], references: [id])
  senderId    String
  sender      Resident @relation(fields: [senderId], references: [id])
  content     String
  readAt      DateTime?
  createdAt   DateTime @default(now())
}

model MessageThread {
  id          String   @id @default(cuid())
  hoaId       String
  hoa         HOA      @relation(fields: [hoaId], references: [id])
  subject     String
  type        String   // "board_inquiry" | "dispute" | "general"
  status      String   @default("open") // "open" | "resolved" | "closed"
  messages    Message[]
  linkedModule String? // route to module
  linkedId    String?
  createdAt   DateTime @default(now())
  resolvedAt  DateTime?
}

model ForumPost {
  id          String   @id @default(cuid())
  hoaId       String
  hoa         HOA      @relation(fields: [hoaId], references: [id])
  authorId    String
  author      Resident @relation(fields: [authorId], references: [id])
  category    String   // "classifieds" | "discussion" | "recommendations" | "events"
  title       String
  content     String
  status      String   @default("published") // "published" | "removed" | "pending_moderation"
  replies     ForumReply[]
  createdAt   DateTime @default(now())
}

model ForumReply {
  id          String    @id @default(cuid())
  postId      String
  post        ForumPost @relation(fields: [postId], references: [id])
  authorId    String
  content     String
  createdAt   DateTime  @default(now())
}
```

#### RPC Procedures
```typescript
createAnnouncement(input: { hoaId, authorId, title, content, category, pinned?, expiresAt?, channels: string[] }) => Announcement
publishAnnouncement(announcementId: string, boardMemberId: string) => Announcement
getAnnouncements(hoaId: string, category?: string) => Announcement[]
sendMessage(input: { hoaId, senderId, threadId?, subject?, content, type? }) => Message
getThreads(hoaId: string, type?: string) => MessageThread[]
getThread(threadId: string) => MessageThread & { messages: Message[] }
createForumPost(input: { hoaId, authorId, category, title, content }) => ForumPost
replyToPost(input: { postId, authorId, content }) => ForumReply
getForumPosts(hoaId: string, category?: string) => ForumPost[]
sendBroadcast(input: { hoaId, title, message, channels: string[], boardMemberId: string }) => void
sendWeeklyDigest(hoaId: string) => void // cron-triggered
```

#### UI Screens
- Community Feed (announcements, pinned notices, recent activity)
- Message Board (board inbox: threads, status, route to module)
- Forum (categorized posts: classifieds, discussion, recommendations)
- Announcement Composer (board: rich text, category, send channels)
- Newsletter Builder (board: drag-drop sections, preview, send)
- Dispute Resolution (resident: private submission, board: case management)

---

## 3. Database Schema Evolution

### Current State (Phase 1)
```
User (platform-managed)
HOA (community record + Stripe)
ContractorWaitlist (founding 25 seats)
```

### New Tables Required (Phase 2–4)
```
Resident            → CommHub, all modules (central identity)
Property            → PayOS, FineBot, ARC, all modules (per-unit record)
BoardMember         → BoardRoom, VoteBox, ARC, FineBot escalation
GatePass            → GatePass Core
GatePassLog         → GatePass Core
PermitSnapshot      → GatePass Core
Violation           → FineBot
ViolationNote       → FineBot
ViolationNotice     → FineBot
Invoice             → PayOS
Payment             → PayOS
Budget              → PayOS
BudgetLineItem      → PayOS
ReserveFund         → PayOS
ReserveFundTransaction → PayOS
ARCSubmission       → ARC Agent
ARCVote             → ARC Agent
ARCDecision         → ARC Agent
ARCNote             → ARC Agent
DesignGuideline     → ARC Agent
Meeting             → BoardRoom
AgendaItem          → BoardRoom
MeetingAttendee     → BoardRoom
MeetingMinutes      → BoardRoom
ActionItem          → BoardRoom
Document            → BoardRoom
Election            → VoteBox
ElectionQuestion    → VoteBox
ElectionOption      → VoteBox
Ballot              → VoteBox
BallotAnswer        → VoteBox
WorkOrder           → WorkOrder
WorkOrderNote       → WorkOrder
MaintenanceSchedule → WorkOrder
Amenity             → Amenity
AmenityTimeSlot     → Amenity
AmenityReservation  → Amenity
AmenityWaitlist     → Amenity
Announcement        → CommHub
Message             → CommHub
MessageThread       → CommHub
ForumPost           → CommHub
ForumReply          → CommHub
```

### Key Relationships

```
HOA
  ├── many Residents
  ├── many Properties (each Property → one Resident)
  ├── many BoardMembers (Residents with board role)
  ├── many GatePasses (via Properties/Residents)
  ├── many Violations (on Properties)
  ├── many Invoices/Payments (on Properties)
  ├── many ARCSubmissions (on Properties by Residents)
  ├── many Meetings
  ├── many Elections
  ├── many WorkOrders
  ├── many Amenities
  └── many Announcements/Threads

Property
  ├── one Resident (current occupant/owner)
  ├── many Invoices
  ├── many Violations
  ├── many ARCSubmissions
  └── many AmenityReservations
```

### Migration Strategy

**Approach:** Additive migrations only. No destructive changes to existing HOA or ContractorWaitlist tables.

1. Add `Resident` and `Property` tables (Phase 2 start)
2. Add `BoardMember` table (Phase 2 start)
3. Add PayOS tables: Invoice, Payment, Budget, ReserveFund (Phase 2)
4. Add FineBot tables: Violation, ViolationNote, ViolationNotice (Phase 2)
5. Add CommHub tables: Resident, Announcement, Message, Forum (Phase 2)
6. Add GatePass Core extensions (Phase 3)
7. Add ARC, WorkOrder, Amenity tables (Phase 3)
8. Add BoardRoom, VoteBox tables (Phase 4)

Run each migration with `npx prisma migrate dev --name <phase>_<module>`.

---

## 4. Agent Architecture

### Execution Model

| Module | Execution Type | Trigger |
|---|---|---|
| GatePass Core | RPC (on-demand) + Cron (nightly permit sync) | User action + scheduled |
| FineBot | RPC (intake) + Cron (daily escalation check) | Report submitted + daily 6am |
| PayOS | RPC (manual) + Cron (billing cycle + reminders) | Board action + monthly cycle |
| ARC Agent | RPC (submissions/votes) + Cron (deadline check) | Submission + daily 8am |
| BoardRoom | RPC (on-demand) + Cron (meeting reminders) | Board action + 48/24h before |
| VoteBox | RPC (ballot) + Cron (deadline close + reminders) | Board publish + scheduled |
| WorkOrder | RPC (on-demand) + Cron (schedule gen) | Request + weekly Monday |
| Amenity | RPC (on-demand) + Cron (waitlist/reminders) | Booking + daily 7am |
| CommHub | RPC (messaging) + Cron (weekly digest) | Message + weekly Sunday 6pm |

### Adaptive Scheduled Agents (New Crons)

```
gatepass-permit-sync      → daily 2am    → syncPermits() for all active HOAs
finebot-escalation        → daily 6am    → check cure deadlines, escalate violations
payos-billing             → 1st of month → generate dues invoices, apply late fees
payos-reminders           → daily 8am    → send payment reminders (7d, 1d, 0d, 3d overdue)
arc-deadline-watch        → daily 8am    → flag ARC submissions within 3d of expiry
boardroom-meeting-remind  → daily 9am    → send 48h/24h reminders for upcoming meetings
votebox-close             → every hour   → close elections at deadline, compile results
votebox-remind            → daily 10am   → remind non-voters when 48h left
amenity-waitlist          → daily 7am    → promote waitlist on cancellations
commhub-digest            → Sunday 6pm  → generate + send weekly community digest
```

### AI Capabilities by Module

| Module | AI Task | Model |
|---|---|---|
| FineBot | Draft violation notice from CC&R section + violation description | gpt-4o-mini |
| ARC Agent | Draft committee analysis memo from submission + guidelines | gpt-4o-mini |
| BoardRoom | Draft minutes from raw notes | gpt-4o-mini |
| CommHub | Route resident message to correct module | gpt-4o-mini |
| CommHub | Draft board response to common inquiry templates | gpt-4o-mini |
| CommHub | Weekly digest generation from HOA activity | gpt-4o-mini |
| WorkOrder | Suggest vendors by category + prior job history | gpt-4o-mini |

**Cost estimate:** ~$0.002–0.005 per AI-assisted action. At 500 AI events/HOA/year = ~$2.50/HOA/year in AI costs. Fully covered by $20/unit pricing.

### Event-Driven Cross-Module Triggers

```
PayOS: Invoice overdue 30d → FineBot: open non-payment violation
PayOS: Special assessment approved → CommHub: send announcement to all residents
FineBot: Violation fine issued → PayOS: create fine invoice on property
ARC: Submission approaching deadline → BoardRoom: add to next meeting agenda
WorkOrder: High-priority request → CommHub: alert board president immediately
VoteBox: Election results certified → CommHub: send results announcement
BoardRoom: Minutes approved → Document: archive to vault + CommHub: notify residents
```

---

## 5. Phased Rollout Plan

### Phase 1 — COMPLETE
**Gate Access MVP** (Live)
- HOA onboarding + Stripe checkout ($10/unit/year)
- Contractor founding waitlist (25 seats, $99)
- Austin permit feed
- Landing page with design system

**Status:** Production. 0 paid HOAs, 0 paid contractors (launch phase).

---

### Phase 2 — Days 1–60: The Core OS
**Build:** PayOS + FineBot + CommHub + Resident/Property data layer

**Priority logic:** These three modules together make GatePass functional as a replacement for a management company. PayOS = money. FineBot = enforcement. CommHub = communication. A self-managed HOA needs all three before anything else.

**Deliverables:**
- [ ] Resident and Property onboarding flow (board imports roster)
- [ ] BoardMember setup (roles, auth)
- [ ] PayOS: dues invoicing, Stripe payment link, ledger
- [ ] FineBot: violation intake, auto-notice generation, escalation
- [ ] CommHub: announcement composer, resident portal, messaging
- [ ] Auth layer: resident login portal (Adaptive platform auth)
- [ ] Stripe webhook: mark invoices paid
- [ ] Resend: payment receipts, violation notices, announcements
- [ ] Board dashboard (unified view of open items across modules)
- [ ] Update pricing to $20/unit for new HOAs

**Phase 2 target metrics:** 3 paid HOAs onboarded, all using PayOS for dues collection.

---

### Phase 3 — Days 61–120: Operations Layer
**Build:** GatePass Core extensions + ARC Agent + WorkOrder + Amenity

**Priority logic:** With money and enforcement running, operational modules extend value and deepen retention. ARC is a compliance necessity. WorkOrder eliminates the last reason to call a management company. Amenity delights residents daily.

**Deliverables:**
- [ ] GatePass Core: digital gate passes, visitor management, access logs
- [ ] ARC Agent: submission portal, committee voting, deadline tracking
- [ ] WorkOrder: request intake, vendor assignment, status tracking
- [ ] Amenity: catalog, booking calendar, reservation management
- [ ] Contractor network: link approved vendors from ContractorWaitlist to WorkOrder
- [ ] Maintenance schedule: auto-generate recurring WorkOrders
- [ ] Design guideline library upload tool

**Phase 3 target metrics:** 8 paid HOAs, 3 with ARC active, NPS survey sent.

---

### Phase 4 — Days 121–180: Full Autonomy
**Build:** BoardRoom + VoteBox + cross-module AI automation

**Priority logic:** BoardRoom and VoteBox complete the governance layer. With all 9 modules live, the platform can run an HOA end-to-end. AI automation layer tightens the cross-module event triggers.

**Deliverables:**
- [ ] BoardRoom: meeting scheduler, agenda builder, minutes AI, document vault
- [ ] VoteBox: election builder, secure ballot, TX compliance, results certification
- [ ] Cross-module event triggers (full list from Agent Architecture section)
- [ ] Scheduled agents: all 10 crons live
- [ ] Board analytics dashboard: HOA health score, module activity, financial summary
- [ ] Self-onboarding flow: HOA can configure themselves without Joseph involvement
- [ ] Public-facing case studies from Phase 2-3 HOAs

**Phase 4 target metrics:** 20 paid HOAs, $400K ARR run rate, Series A pitch deck ready.

---

## 6. Pricing & GTM Strategy

### Pricing Tiers

| Tier | Price | Units | What's Included |
|---|---|---|---|
| **Founding** | $10/unit/year | <500 units | All Phase 1 features (locked in for 3 years) |
| **Core OS** | $20/unit/year | All sizes | All 9 modules, full AI agent suite |
| **Enterprise** | Custom | 1,000+ units | Multi-community, white-label, dedicated support |

**Minimum:** 25 units (to filter non-HOA signups)  
**Billing:** Annual (upfront) via Stripe. Monthly billing at 15% premium.  
**Free trial:** 90 days for self-managed HOAs transitioning from a management company.

### Self-Managed HOA Pitch

Target audience: HOAs currently self-managing with spreadsheets and Google Docs, or boards fed up with their management company.

**Message:** "You already do the work. Your HOA board spends hours every month on dues chasing, violation notices, maintenance calls, and meeting prep. GatePass agents do all of it — automatically. You stay in control. You make the decisions. The agents handle the paperwork."

**Proof points:**
- FineBot sends violation notices the day a complaint is filed
- PayOS auto-charges and auto-receipts — no more chasing dues
- ARC Agent tracks your 30-day review window so you never accidentally approve by default
- BoardRoom drafts your meeting minutes in 30 seconds

**Channel:** Direct to board presidents. Find them via NextDoor groups, Facebook HOA groups, neighborhood associations directory (Texas HOA Data System, county property records).

### Management Company Migration Pitch

Target audience: HOAs whose management contract is up for renewal (typically annual or biannual).

**Message:** "Your management company charges $X/unit/year. They're a middleman. Every service they provide — dues collection, violations, maintenance coordination, meeting support — GatePass does automatically. For 80% less. Your board decides everything. Your community owns the data."

**Sales motion:** Board president gets a demo → free 90-day trial during contract notice period → full migration before renewal date.

**Migration support:**
- GatePass imports existing property roster, financial history, governing documents
- Board gets 3 onboarding calls
- Dedicated migration checklist (notify management company, transfer records, port vendor contacts)

### Austin Metro Expansion Targets

**Phase 1 (Metro 1 — current):** Steiner Ranch, Mueller, Avery Ranch, Lakeway, Circle C, Belterra, Teravista

**Phase 2 (Metro 2 — Days 30-90):** Pflugerville, Round Rock, Cedar Park, Georgetown, Kyle, Buda  
*(Rationale: bedroom communities with high HOA density, price-sensitive boards, active Facebook groups)*

**Phase 3 (Metro 3 — Days 90-180):** San Antonio MSA (New Braunfels, Schertz, Stone Oak, Alamo Ranch)  
*(Rationale: TX second-largest metro, same legal framework, same management company problems)*

**Phase 4 (State — 180+):** Houston (Woodlands, Katy, Sugar Land), Dallas (Frisco, Allen, McKinney, Prosper)

---

## 7. Competitive Moat Analysis

### Why Incumbents Can't Copy This Fast

**CINC, Vantaca, AppFolio, BuildingLink** — all sell to management companies. Their entire go-to-market, pricing, contract structure, and product roadmap is oriented around the management company as customer. To compete with GatePass, they would have to:

1. Build a resident-facing product (they've never had to — the manager is the user)
2. Cannibalize their own customer base (management companies would leave)
3. Reprice to compete at $20/unit (their current pricing is 2-4x that, to management companies who mark up to residents)
4. Rebuild trust with boards who see them as "management company tools"

**This is a structural conflict.** They cannot compete without destroying their existing business. Classic innovator's dilemma.

### The Resident Ownership Angle

This is the deepest moat. GatePass isn't just cheaper or better software — it represents a shift in who the product serves.

Management companies hold the data. When an HOA fires their management company, they often lose access to financial records, violation history, vendor contacts, and sometimes even governing documents. GatePass flips this: **the HOA owns everything, always.** Data export is a feature, not a threat.

This creates a fundamentally different relationship. GatePass is infrastructure, not a service provider. Like Stripe vs. a payment processor. Like Shopify vs. a retail store. The platform enables ownership — it doesn't intermediate.

### AI Agent vs. Human Manager Cost Structure

| Function | Human Manager | GatePass Agent | Cost Delta |
|---|---|---|---|
| Dues billing + collections | 2–4 hrs/month/HOA | 0 hrs (automated) | 100% savings |
| Violation notices | 1–2 hrs/incident | <1 min (AI draft + send) | ~95% savings |
| Maintenance coordination | 3–5 hrs/month | Routing + tracking automated | ~70% savings |
| Meeting prep + minutes | 3–6 hrs/meeting | Agenda auto-built, minutes AI-drafted | ~80% savings |
| ARC processing | 1–3 hrs/submission | Intake + tracking automated, decision still human | ~60% savings |
| Financial reporting | 2–4 hrs/month | Auto-generated monthly | ~95% savings |

**Net result:** A management company needs 1 FTE per 15–20 HOAs. GatePass serves unlimited HOAs with the same agent infrastructure.

At 100 HOAs × 150 units × $20/unit = **$300K ARR with near-zero marginal cost of delivery.**

---

## 8. Tech Decisions

### What Stays

| Technology | Why |
|---|---|
| React + Vite + TypeScript | Proven, fast iteration, single-file component pattern works |
| Hono (backend) | Lightweight, fast, perfect for RPC pattern |
| Prisma + SQLite | Sufficient for Phase 2–3; evaluate Postgres migration at 50+ HOAs |
| Stripe | Already integrated, covers payments + subscriptions + ACH |
| Design system | Cream/Green/Gold stays — premium residential feel |

### What Gets Added

| Technology | Purpose | Module |
|---|---|---|
| **Resend** | Email delivery (violation notices, invoices, announcements, newsletter) | FineBot, PayOS, CommHub |
| **Stripe ACH (Plaid)** | Bank account autopay for dues | PayOS |
| **CDN file storage** | Photo uploads (violations, ARC submissions, work orders) | FineBot, ARC, WorkOrder |
| **OpenAI gpt-4o-mini** | Notice drafting, minutes, routing, analysis | FineBot, ARC, BoardRoom, CommHub |
| **Adaptive scheduled agents** | 10 cron jobs (permit sync, billing, reminders, digest) | All modules |

### New Adaptive Agents to Create

1. `gatepass-permit-sync` — nightly permit sync per HOA
2. `gatepass-billing-agent` — monthly dues cycle, late fees, reminders
3. `gatepass-enforcement-agent` — daily violation escalation check
4. `gatepass-arc-watch` — daily ARC deadline monitor
5. `gatepass-meeting-remind` — board meeting reminder dispatch
6. `gatepass-vote-manager` — election open/close/remind cycle
7. `gatepass-maintenance-agent` — weekly maintenance schedule execution
8. `gatepass-amenity-agent` — daily waitlist + reminder processing
9. `gatepass-digest-agent` — weekly community digest generation

### Database Scale Decision

**Current:** SQLite (per-tenant, single file)  
**Risk:** At 20+ HOAs with active billing, violations, and reservations, a single SQLite file will work but WAL mode and connection limits become relevant.  
**Decision:** Stay on SQLite through Phase 3 (20 HOAs). Migrate to PostgreSQL (Supabase or Adaptive-managed) at Phase 4 if any HOA exceeds 500 active records/day.  
**Migration path:** Prisma datasource switch from `sqlite` to `postgresql` — schema is compatible.

### Auth Layer

**Board members and residents need login.** Use Adaptive platform auth:
- Board members: full dashboard access
- Residents: portal access (payments, reservations, ARC submissions, messaging, voting)
- Public: landing page only

Role-based access: `board_president`, `board_member`, `treasurer`, `resident`, `tenant`

Implement via Adaptive auth middleware on Hono routes, role stored on `BoardMember` and `Resident` tables.

---

## Appendix: Module Build Priority Matrix

| Module | Phase | Resident Impact | Revenue Impact | Complexity |
|---|---|---|---|---|
| PayOS | 2 | High (money) | High (reduces churn) | Medium |
| FineBot | 2 | High (enforcement) | Medium | Low |
| CommHub | 2 | High (daily use) | Medium | Low |
| GatePass Core+ | 3 | Medium | Low | Medium |
| ARC Agent | 3 | High (compliance) | High | Medium |
| WorkOrder | 3 | High (ops) | High | Medium |
| Amenity | 3 | High (daily use) | Medium | Low |
| BoardRoom | 4 | Medium | Medium | High |
| VoteBox | 4 | Medium (annual) | Low | High |

**Immediate next step:** Build the Resident + Property import flow (board uploads CSV of unit roster → creates Property + Resident records). This is the prerequisite for every other module. Without residents and properties in the DB, none of the other modules have context. Estimated: 1 day.

---

*GatePass HOA OS — Architecture v2.0 — Confidential — March 2026*
