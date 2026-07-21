# GatePass — Compliance Memory Layer

> **Historical record — do not use for public positioning.** This document predates the current GatePass marketplace definition and contains superseded exclusivity, switching-cost, and management-transition claims. Association-owned records remain a supporting acquisition and continuity mechanism, not the business itself. `APP.md` and `CODEX.md` are authoritative. Restoring an older claim requires contact from reality.
## Technical Spec · L3 Trust → L8 Memory Build

**Status:** Spec complete — ready for engineering implementation  
**Strategic purpose:** Transform GatePass from a workflow tool (L5) into an irreplaceable compliance memory store (L3 Trust → L8 Memory). Once a board's 5-year compliance history lives here, switching cost is catastrophic.

---

## Why This Matters (Sales Pitch Language)

> "Every violation notice, ARC decision, board vote, and vendor contract your community has ever had — timestamped, searchable, and legally defensible — lives in GatePass and nowhere else. When a homeowner sues, an insurance claim arrives, or you fire your management company, you have the full legal record in 30 seconds. No management company preserves this for you. No other HOA software owns this layer."

One-liner for D2D: *"GatePass is the only platform that holds your community's legal memory."*

---

## 1. Prisma Schema Additions

Add the following two models to `schema.prisma` after the existing `Message` model.

```prisma
// ─── Compliance Memory Layer ──────────────────────────────────────────

model ComplianceEvent {
  id              String   @id @default(cuid())

  // Source
  hoaId           String
  hoa             HOA      @relation(fields: [hoaId], references: [id])
  module          String   // core | payos | finebot | arc | workorder | boardroom | votebox | amenity | commhub
  eventType       String   // see Event Taxonomy below

  // Actor
  actorType       String   // board | homeowner | system | admin
  actorId         String?  // homeownerId or userId — null for system events
  actorName       String   // display name for rendering (denormalized for immutability)

  // Target
  targetType      String?  // unit | vendor | vote | violation | arc_request | work_order | meeting | dues_account | announcement
  targetId        String?  // FK to the source record (soft reference — not a Prisma relation, intentional)
  targetLabel     String?  // human-readable: "123 Oak Ln", "Motion: Special Assessment", "Vendor: Austin Roofing Co."

  // Content
  summary         String   // plain English summary: "Violation notice #2 sent to 123 Oak Ln for landscaping"
  detail          String?  // extended detail, markdown OK
  dataSnapshot    String?  // JSON — snapshot of relevant record fields AT TIME OF EVENT (immutable record)

  // Legal significance
  legalFlag       Boolean  @default(false)  // true = high legal/financial consequence
  legalCategory   String?  // liability | financial | governance | enforcement | contract

  // Document trail
  documentHash    String?  // SHA-256 of attached document (future: when file upload added)
  documentUrl     String?  // CDN URL of attached document

  // Metadata
  ipAddress       String?  // for board actions — audit trail
  userAgent       String?
  createdAt       DateTime @default(now())

  @@index([hoaId, createdAt])
  @@index([hoaId, module])
  @@index([hoaId, eventType])
  @@index([hoaId, legalFlag])
  @@index([targetId])
}

model ComplianceExport {
  id              String   @id @default(cuid())
  hoaId           String
  requestedBy     String   // actorName
  dateRangeStart  DateTime
  dateRangeEnd    DateTime
  eventCount      Int
  exportJson      String   // the full export payload (stored for audit of what was exported)
  purpose         String?  // "PMC transition" | "legal hold" | "insurance claim" | "board review"
  createdAt       DateTime @default(now())
}
```

### Schema changes to HOA model

Add one relation to the existing `HOA` model:

```prisma
  complianceEvents ComplianceEvent[]
  complianceExports ComplianceExport[]
```

---

## 2. Event Taxonomy

All events that must be logged as `ComplianceEvent` records. These are called by existing procedures immediately after the DB write succeeds.

### Module: `finebot`
| eventType | legalFlag | legalCategory | Example summary |
|---|---|---|---|
| `violation.created` | false | enforcement | "Violation logged at 123 Oak Ln: landscaping (minor)" |
| `violation.notice_sent` | **true** | enforcement | "Notice #1 sent to 123 Oak Ln — due 2026-05-01" |
| `violation.notice_sent` | **true** | enforcement | "Notice #2 (final) sent to 123 Oak Ln — fine attached: $150" |
| `violation.fined` | **true** | financial | "Fine of $150 assessed against 123 Oak Ln (violation #3)" |
| `violation.escalated` | **true** | liability | "Violation escalated to legal — 123 Oak Ln, 90 days unresolved" |
| `violation.resolved` | false | enforcement | "Violation resolved — 123 Oak Ln confirmed compliant" |

### Module: `arc`
| eventType | legalFlag | legalCategory | Example summary |
|---|---|---|---|
| `arc.submitted` | false | governance | "ARC request submitted: fence at 456 Elm St, est. $4,200" |
| `arc.approved` | **true** | governance | "ARC approved: fence at 456 Elm St — conditions: cedar only, max 6ft" |
| `arc.denied` | **true** | governance | "ARC denied: pool at 789 Pine Ave — reason: setback violation" |
| `arc.revision_requested` | false | governance | "ARC revision requested: shed at 101 Main St — provide dimensions" |
| `arc.expired` | **true** | governance | "ARC expired without decision: addition at 202 Oak Ln (45-day limit)" |

### Module: `votebox`
| eventType | legalFlag | legalCategory | Example summary |
|---|---|---|---|
| `vote.opened` | false | governance | "Vote opened: Special Assessment — $500/unit for pool resurfacing" |
| `vote.closed` | **true** | governance | "Vote closed: Special Assessment PASSED — 34 yes / 12 no / quorum met" |
| `vote.certified` | **true** | governance | "Board certified vote result: Special Assessment — effective 2026-06-01" |
| `vote.cancelled` | **true** | governance | "Vote cancelled by board: Bylaw Amendment #3 — reason: procedural error" |

### Module: `boardroom`
| eventType | legalFlag | legalCategory | Example summary |
|---|---|---|---|
| `meeting.scheduled` | false | governance | "Board meeting scheduled: Annual Meeting — 2026-06-15 at Clubhouse" |
| `meeting.minutes_recorded` | **true** | governance | "Meeting minutes recorded: Annual Meeting 2026-06-15" |
| `meeting.quorum_failed` | **true** | governance | "Meeting cancelled — quorum not met: Annual Meeting 2026-06-15 (3 of 5 required)" |
| `meeting.completed` | false | governance | "Meeting completed: Board Meeting 2026-05-01 — 4 agenda items, 2 action items" |

### Module: `payos`
| eventType | legalFlag | legalCategory | Example summary |
|---|---|---|---|
| `dues.delinquent_30` | **true** | financial | "Account delinquent 30 days: 123 Oak Ln — $240 outstanding" |
| `dues.delinquent_60` | **true** | financial | "Account delinquent 60 days: 123 Oak Ln — $480 outstanding" |
| `dues.delinquent_90` | **true** | financial | "Account delinquent 90+ days: 123 Oak Ln — referred to collections" |
| `dues.special_assessment` | **true** | financial | "Special assessment charged: $500 to all 127 units — pool resurfacing" |
| `dues.lien_eligible` | **true** | liability | "Account flagged lien-eligible: 123 Oak Ln — $960 outstanding, 120+ days" |
| `transaction.payment` | false | financial | "Payment received: $240 from 123 Oak Ln" |
| `transaction.late_fee` | **true** | financial | "Late fee assessed: $50 to 123 Oak Ln" |

### Module: `workorder`
| eventType | legalFlag | legalCategory | Example summary |
|---|---|---|---|
| `workorder.board_approved` | **true** | financial | "Board approved work order: Pool pump replacement — $3,200 (Austin Pool Pros)" |
| `workorder.completed` | false | contract | "Work order completed: Pool pump replacement — actual cost $3,150" |
| `workorder.vendor_assigned` | false | contract | "Vendor assigned: Austin Pool Pros to pool pump WO-2026-047" |

### Module: `core`
| eventType | legalFlag | legalCategory | Example summary |
|---|---|---|---|
| `hoa.enrolled` | **true** | governance | "HOA enrolled on GatePass: Steiner Ranch HOA — 400 units, Full OS" |
| `hoa.plan_upgraded` | **true** | financial | "HOA plan upgraded: Starter → Full OS — Steiner Ranch HOA" |

### Module: `commhub`
| eventType | legalFlag | legalCategory | Example summary |
|---|---|---|---|
| `announcement.sent` | false | governance | "Community announcement sent: 'Pool closure Nov 1–15' — 127 homeowners" |
| `announcement.urgent` | **true** | governance | "URGENT announcement sent: 'Boil water notice in effect'" |

---

## 3. Backend Procedures

Add these three procedures to `src/api/procedures.ts`.

### 3a. `logComplianceEvent` — Internal utility

```typescript
// ─── Compliance Memory Layer ──────────────────────────────────────────

/**
 * Internal utility — called by other procedures immediately after
 * the triggering DB write. Never exposed directly to the frontend.
 * Designed to be fire-and-forget (never throw, never block the parent operation).
 */
export async function logComplianceEvent(input: {
  hoaId: string;
  module: "core" | "payos" | "finebot" | "arc" | "workorder" | "boardroom" | "votebox" | "amenity" | "commhub";
  eventType: string;
  actorType: "board" | "homeowner" | "system" | "admin";
  actorId?: string;
  actorName: string;
  targetType?: string;
  targetId?: string;
  targetLabel?: string;
  summary: string;
  detail?: string;
  dataSnapshot?: Record<string, unknown>;
  legalFlag?: boolean;
  legalCategory?: "liability" | "financial" | "governance" | "enforcement" | "contract";
  documentHash?: string;
  documentUrl?: string;
}) {
  try {
    await db.complianceEvent.create({
      data: {
        hoaId: input.hoaId,
        module: input.module,
        eventType: input.eventType,
        actorType: input.actorType,
        actorId: input.actorId,
        actorName: input.actorName,
        targetType: input.targetType,
        targetId: input.targetId,
        targetLabel: input.targetLabel,
        summary: input.summary,
        detail: input.detail,
        dataSnapshot: input.dataSnapshot ? JSON.stringify(input.dataSnapshot) : undefined,
        legalFlag: input.legalFlag ?? false,
        legalCategory: input.legalCategory,
        documentHash: input.documentHash,
        documentUrl: input.documentUrl,
      },
    });
  } catch (err) {
    // Log but never propagate — compliance logging must never break the parent operation
    console.error("[ComplianceEvent] Failed to log event:", err);
  }
}
```

### 3b. `getComplianceTimeline` — Paginated timeline for a community

```typescript
export async function getComplianceTimeline(input: {
  hoaId: string;
  page?: number;
  pageSize?: number;
  module?: string;         // filter by module
  legalOnly?: boolean;     // filter to legalFlag = true only
  actorType?: string;      // filter by actor type
  targetId?: string;       // filter by linked record
  search?: string;         // text search across summary
  dateFrom?: string;       // ISO string
  dateTo?: string;         // ISO string
}) {
  const page = input.page ?? 1;
  const pageSize = input.pageSize ?? 25;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = { hoaId: input.hoaId };
  if (input.module) where.module = input.module;
  if (input.legalOnly) where.legalFlag = true;
  if (input.actorType) where.actorType = input.actorType;
  if (input.targetId) where.targetId = input.targetId;
  if (input.search) where.summary = { contains: input.search };
  if (input.dateFrom || input.dateTo) {
    where.createdAt = {
      ...(input.dateFrom ? { gte: new Date(input.dateFrom) } : {}),
      ...(input.dateTo ? { lte: new Date(input.dateTo) } : {}),
    };
  }

  const [events, total] = await Promise.all([
    db.complianceEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    db.complianceEvent.count({ where }),
  ]);

  return {
    events,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    legalCount: await db.complianceEvent.count({ where: { hoaId: input.hoaId, legalFlag: true } }),
  };
}
```

### 3c. `exportCompliancePack` — Legal/audit export

```typescript
export async function exportCompliancePack(input: {
  hoaId: string;
  dateFrom: string;    // ISO string
  dateTo: string;      // ISO string
  purpose?: string;    // "pmc_transition" | "legal_hold" | "insurance_claim" | "board_review"
  requestedBy: string; // actor name — logged
}) {
  const hoa = await db.hOA.findUnique({ where: { id: input.hoaId } });
  if (!hoa) throw new Error("HOA not found");

  const events = await db.complianceEvent.findMany({
    where: {
      hoaId: input.hoaId,
      createdAt: {
        gte: new Date(input.dateFrom),
        lte: new Date(input.dateTo),
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const legalEvents = events.filter(e => e.legalFlag);

  const pack = {
    exportMeta: {
      generatedAt: new Date().toISOString(),
      requestedBy: input.requestedBy,
      purpose: input.purpose ?? "general",
      hoaId: hoa.id,
      hoaName: hoa.name,
      community: hoa.community,
      dateRangeStart: input.dateFrom,
      dateRangeEnd: input.dateTo,
    },
    summary: {
      totalEvents: events.length,
      legalEvents: legalEvents.length,
      moduleBreakdown: events.reduce((acc, e) => {
        acc[e.module] = (acc[e.module] ?? 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    },
    legalHighlights: legalEvents.map(e => ({
      date: e.createdAt,
      module: e.module,
      eventType: e.eventType,
      summary: e.summary,
      actor: e.actorName,
      legalCategory: e.legalCategory,
    })),
    fullTimeline: events.map(e => ({
      id: e.id,
      date: e.createdAt,
      module: e.module,
      eventType: e.eventType,
      summary: e.summary,
      detail: e.detail,
      actor: `${e.actorName} (${e.actorType})`,
      target: e.targetLabel,
      legalFlag: e.legalFlag,
      legalCategory: e.legalCategory,
    })),
  };

  // Persist export record for audit trail
  await db.complianceExport.create({
    data: {
      hoaId: input.hoaId,
      requestedBy: input.requestedBy,
      dateRangeStart: new Date(input.dateFrom),
      dateRangeEnd: new Date(input.dateTo),
      eventCount: events.length,
      exportJson: JSON.stringify(pack),
      purpose: input.purpose,
    },
  });

  return pack;
}
```

---

## 4. Frontend: `ComplianceTimeline.tsx` — Component Spec

### Location
`src/components/ComplianceTimeline.tsx`

### Purpose
Renders the full compliance audit ledger for a community. Accessible from the Sidebar as a new module item: **"Compliance"** (icon: shield). Surfaced to board members only.

### State / Data
```typescript
// Query
const { data, isLoading } = useQuery({
  queryKey: ["complianceTimeline", hoaId, filters],
  queryFn: () => rpc.getComplianceTimeline({ hoaId, ...filters }),
});
```

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  COMPLIANCE RECORD                           [Export Pack ↓] │
│  Steiner Ranch HOA · 847 events · 213 legal                  │
├─────────────────────────────────────────────────────────────┤
│  [All Modules ▼]  [Legal Only]  [Date Range]  [Search...]   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ● APR 14 2026                                  FineBot      │
│  ⚖ Notice #2 sent to 123 Oak Ln (landscaping)               │
│    Sent by: Board · Due: May 1, 2026 · Fine: $150           │
│    [View Violation →]                                        │
│                                                              │
│  ● APR 12 2026                                  VoteBox      │
│  ⚖ Vote PASSED: Special Assessment $500/unit                 │
│    34 yes / 12 no · Quorum met · Certified by board         │
│    [View Vote →]                                             │
│                                                              │
│  ● APR 10 2026                                  ARC Agent    │
│  ✓ ARC Approved: fence at 456 Elm St                        │
│    Conditions: cedar only, max 6ft · Reviewed by: J. Smith  │
│    [View ARC Request →]                                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Event card rendering rules

| Condition | Visual treatment |
|---|---|
| `legalFlag = true` | Left border: gold (`#B8883A`) + ⚖ icon prefix |
| `legalFlag = false` | Left border: muted gray + ✓ icon |
| `actorType = "system"` | Italic actor name, no border highlight |
| `module = "finebot"` | Red-tinted left border for escalated/fined events |

### Filters
- **Module selector:** All / Core / PayOS / FineBot / ARC / WorkOrder / BoardRoom / VoteBox / CommHub
- **Legal Only toggle:** Filters to `legalFlag = true` — one click
- **Date range:** From/To date pickers — defaults to current year
- **Search:** Queries `summary` field — debounced 300ms

### Export CTA

Button: **"Export Compliance Pack"** — opens a modal with:
- Date range (pre-filled to current filter range)
- Purpose selector: PMC Transition / Legal Hold / Insurance Claim / Board Review
- Requester name field (pre-filled from logged-in user)
- Submit → calls `exportCompliancePack` → triggers JSON download

**File format:** `GatePass-CompliancePack-{communityName}-{date}.json`

### Sidebar integration

Add to `Sidebar.tsx` OSView enum and nav items:
```typescript
// In OSView type
| "compliance"

// In nav items array
{ id: "compliance", label: "Compliance", icon: <ShieldIcon /> }
```

---

## 5. Migration File

Create `/home/computer/frontdoor/migrations/{timestamp}_add_compliance_memory/migration.sql`:

```sql
-- Compliance Memory Layer
-- Adds ComplianceEvent (immutable audit ledger) and ComplianceExport (export audit trail)

CREATE TABLE "ComplianceEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hoaId" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorType" TEXT NOT NULL,
    "actorId" TEXT,
    "actorName" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "targetLabel" TEXT,
    "summary" TEXT NOT NULL,
    "detail" TEXT,
    "dataSnapshot" TEXT,
    "legalFlag" BOOLEAN NOT NULL DEFAULT false,
    "legalCategory" TEXT,
    "documentHash" TEXT,
    "documentUrl" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ComplianceEvent_hoaId_fkey" FOREIGN KEY ("hoaId") REFERENCES "HOA" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "ComplianceExport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hoaId" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "dateRangeStart" DATETIME NOT NULL,
    "dateRangeEnd" DATETIME NOT NULL,
    "eventCount" INTEGER NOT NULL,
    "exportJson" TEXT NOT NULL,
    "purpose" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "ComplianceEvent_hoaId_createdAt_idx" ON "ComplianceEvent"("hoaId", "createdAt");
CREATE INDEX "ComplianceEvent_hoaId_module_idx" ON "ComplianceEvent"("hoaId", "module");
CREATE INDEX "ComplianceEvent_hoaId_eventType_idx" ON "ComplianceEvent"("hoaId", "eventType");
CREATE INDEX "ComplianceEvent_hoaId_legalFlag_idx" ON "ComplianceEvent"("hoaId", "legalFlag");
CREATE INDEX "ComplianceEvent_targetId_idx" ON "ComplianceEvent"("targetId");
```

---

## 6. Instrumentation — Where to Add `logComplianceEvent` Calls

These are the exact procedure calls in `procedures.ts` that need `logComplianceEvent` wired in **after** the DB write.

| Procedure | Event to log | Notes |
|---|---|---|
| `sendViolationNotice` | `violation.notice_sent` | Pass `noticeNumber` in dataSnapshot |
| `createViolation` | `violation.created` | legalFlag = false |
| `resolveViolation` | `violation.resolved` | — |
| `reviewARCRequest` (approve) | `arc.approved` | legalFlag = true |
| `reviewARCRequest` (deny) | `arc.denied` | legalFlag = true |
| `closeVote` | `vote.closed` | Pass resultSummary in dataSnapshot |
| `updateMeetingMinutes` | `meeting.minutes_recorded` | legalFlag = true |
| `chargeMonthlyDues` (overdue escalation) | `dues.delinquent_30/60/90` | Check overdueMonths after charge |
| `updateWorkOrder` (status → completed) | `workorder.completed` | — |
| `updateWorkOrder` (boardApproved → true) | `workorder.board_approved` | legalFlag = true |
| `createHOACheckout` | `hoa.enrolled` | Fires after stripe session created |

---

## 7. Implementation Order

1. **Schema** — Add models to `schema.prisma`, add relations to `HOA`
2. **Migration** — Create migration SQL file, run `npx prisma migrate dev`
3. **`logComplianceEvent`** — Add to procedures.ts first (blocking nothing)
4. **Wire calls** — Add `logComplianceEvent` calls to 11 procedures listed above
5. **`getComplianceTimeline`** — Add procedure
6. **`exportCompliancePack`** — Add procedure
7. **`ComplianceTimeline.tsx`** — Build component
8. **Sidebar** — Add "Compliance" nav item, wire to component

---

## 8. Strategic Notes for Engineering Leadership

- **The `dataSnapshot` field is intentional.** It stores a JSON copy of the triggering record's key fields at the moment of the event. This means the compliance timeline remains accurate even if the source record is later edited or deleted. This is the "immutability" that makes the layer legally defensible.
- **`targetId` is a soft reference** (no Prisma relation constraint). This is intentional — compliance events must outlive the records that created them.
- **`logComplianceEvent` never throws.** It wraps in try/catch and logs errors silently. The parent operation must never fail because of compliance logging.
- **Export format is JSON, not PDF (for now).** The JSON structure is designed so a PDF renderer (e.g. Puppeteer, React-PDF) can be dropped in later. The `legalHighlights` array maps cleanly to a 1-page executive summary page; `fullTimeline` maps to the appendix.
- **`ComplianceExport` table** creates an audit trail of who exported what and when — critical if a legal dispute arises about what records were shared.
