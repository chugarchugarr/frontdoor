import {
  getQueue,
  mcp,
  type Job,
  type QueueHandlers,
} from "@adaptive-ai/sdk/server";
import { db } from "@/api/db";

// ─── Shared AI helpers ────────────────────────────────────────────────

async function ai<T>(message: string, schema: object): Promise<T> {
  const result = await mcp.promptAgent({ message, outputJsonSchema: schema });
  return result.response as T;
}

// ─── Agent Jobs ───────────────────────────────────────────────────────

export const jobs = {

  // ── 1. GatePass Core: Screen contractor waitlist entry ──────────────
  async screenContractor(payload: { contractorId: string },  _job: Job) {
    const contractor = await db.contractorWaitlist.findUnique({
      where: { id: payload.contractorId },
    });
    if (!contractor) return;

    const result = await ai<{
      riskScore: number;
      flags: string[];
      recommendation: "approve" | "review" | "reject";
      reasoning: string;
    }>(
      `You are GatePass Core — a contractor screening AI for an HOA platform.
      
Evaluate this contractor application for legitimacy and fit:
- Company: ${contractor.company}
- Contact: ${contractor.contactName}
- Category: ${contractor.category}
- Zip: ${contractor.zip}
- Email: ${contractor.email}

Rate risk (0-100), identify any flags, and recommend approve/review/reject.
Consider: business name legitimacy, email domain, service category match to Austin market.`,
      {
        type: "object",
        properties: {
          riskScore: { type: "number", description: "0 = low risk, 100 = high risk" },
          flags: { type: "array", items: { type: "string" } },
          recommendation: { type: "string", enum: ["approve", "review", "reject"] },
          reasoning: { type: "string" },
        },
        required: ["riskScore", "flags", "recommendation", "reasoning"],
      }
    );

    await db.contractorWaitlist.update({
      where: { id: payload.contractorId },
      data: {
        aiScreeningResult: JSON.stringify(result),
        aiScreenedAt: new Date(),
      },
    });
  },

  // ── 2. PayOS: Analyze delinquency and draft collection email ────────
  async analyzeDelinquency(payload: { hoaId: string; homeownerId: string },  _job: Job) {
    const homeowner = await db.homeowner.findUnique({
      where: { id: payload.homeownerId },
      include: {
        duesAccount: true,
        hoa: { select: { community: true, contactEmail: true } },
      },
    });
    if (!homeowner || !homeowner.duesAccount) return;

    const account = homeowner.duesAccount;
    const overdueMonths = account.overdueMonths ?? 0;
    const totalOwed = account.balanceCents ?? 0;

    const result = await ai<{
      riskLevel: "low" | "medium" | "high" | "critical";
      recommendedAction: string;
      emailSubject: string;
      emailBody: string;
      escalateTo: "reminder" | "formal_notice" | "lien_warning" | "legal";
    }>(
      `You are PayOS — the dues collection AI for ${homeowner.hoa.community} HOA.

Homeowner: ${homeowner.name}
Address: ${homeowner.address}
Monthly due: $${(account.monthlyDueCents / 100).toFixed(2)}
Current balance owed: $${(totalOwed / 100).toFixed(2)}
Months overdue: ${overdueMonths}
Last payment: ${account.lastPaymentAt ? new Date(account.lastPaymentAt).toLocaleDateString() : "Never"}

Assess delinquency risk, recommend action level, and draft a professional but firm collection email.
The email should be from ${homeowner.hoa.community} HOA board. Tone scales with severity.`,
      {
        type: "object",
        properties: {
          riskLevel: { type: "string", enum: ["low", "medium", "high", "critical"] },
          recommendedAction: { type: "string" },
          emailSubject: { type: "string" },
          emailBody: { type: "string" },
          escalateTo: { type: "string", enum: ["reminder", "formal_notice", "lien_warning", "legal"] },
        },
        required: ["riskLevel", "recommendedAction", "emailSubject", "emailBody", "escalateTo"],
      }
    );

    await db.duesAccount.update({
      where: { id: account.id },
      data: { aiAnalysis: JSON.stringify(result), aiAnalyzedAt: new Date() },
    });
  },

  // ── 3. FineBot: Classify violation and draft notice ─────────────────
  async classifyViolation(payload: { violationId: string },  _job: Job) {
    const violation = await db.violation.findUnique({
      where: { id: payload.violationId },
      include: {
        homeowner: true,
        hoa: { select: { community: true } },
      },
    });
    if (!violation) return;

    const result = await ai<{
      confirmedCategory: string;
      severity: "minor" | "moderate" | "major";
      ccAndRSection: string;
      recommendedAction: string;
      noticeText: string;
      estimatedFine: number;
      escalationRisk: "low" | "medium" | "high";
    }>(
      `You are FineBot — the violations enforcement AI for ${violation.hoa.community} HOA.

New violation reported:
- Address: ${violation.address}
- Category: ${violation.category}
- Description: ${violation.description}
- Reported by: ${violation.reportedBy ?? "Board member"}

Tasks:
1. Confirm or correct the category
2. Assess severity (minor/moderate/major)
3. Cite the relevant CC&R section (use standard HOA CC&R structure)
4. Recommend action (warning/formal notice/fine)
5. Draft a professional violation notice (2-3 sentences)
6. Estimate appropriate fine if applicable ($0, $25, $50, $100, $250)
7. Rate escalation risk`,
      {
        type: "object",
        properties: {
          confirmedCategory: { type: "string" },
          severity: { type: "string", enum: ["minor", "moderate", "major"] },
          ccAndRSection: { type: "string" },
          recommendedAction: { type: "string" },
          noticeText: { type: "string" },
          estimatedFine: { type: "number" },
          escalationRisk: { type: "string", enum: ["low", "medium", "high"] },
        },
        required: ["confirmedCategory", "severity", "ccAndRSection", "recommendedAction", "noticeText", "estimatedFine", "escalationRisk"],
      }
    );

    await db.violation.update({
      where: { id: payload.violationId },
      data: {
        severity: result.severity,
        aiAnalysis: JSON.stringify(result),
        aiAnalyzedAt: new Date(),
      },
    });
  },

  // ── 4. ARC Agent: Review architectural request vs CC&Rs ─────────────
  async reviewARCRequest(payload: { arcId: string },  _job: Job) {
    const arc = await db.aRCRequest.findUnique({
      where: { id: payload.arcId },
      include: {
        homeowner: true,
        hoa: { select: { community: true } },
      },
    });
    if (!arc) return;

    const result = await ai<{
      recommendation: "approve" | "conditional_approve" | "deny" | "needs_info";
      confidence: number;
      ccAndRCompliance: string;
      conditions: string[];
      concerns: string[];
      draftDecisionLetter: string;
      reviewNotes: string;
    }>(
      `You are ARC Agent — the Architectural Review Committee AI for ${arc.hoa.community} HOA.

Application details:
- Homeowner: ${arc.homeowner.name} at ${arc.homeowner.address}
- Project type: ${arc.projectType}
- Description: ${arc.description}
- Estimated cost: ${arc.estimatedCost ? `$${(arc.estimatedCost / 100).toLocaleString()}` : "Not provided"}
- Start date: ${arc.startDate ? new Date(arc.startDate).toLocaleDateString() : "Not specified"}

Apply standard HOA ARC review criteria:
- Materials/colors must match neighborhood aesthetic
- Structures must comply with local building codes
- Projects must not adversely affect neighboring properties
- Proper permits required for structural work

Provide recommendation with confidence (0-1), compliance notes, any conditions, concerns, and draft a decision letter.`,
      {
        type: "object",
        properties: {
          recommendation: { type: "string", enum: ["approve", "conditional_approve", "deny", "needs_info"] },
          confidence: { type: "number" },
          ccAndRCompliance: { type: "string" },
          conditions: { type: "array", items: { type: "string" } },
          concerns: { type: "array", items: { type: "string" } },
          draftDecisionLetter: { type: "string" },
          reviewNotes: { type: "string" },
        },
        required: ["recommendation", "confidence", "ccAndRCompliance", "conditions", "concerns", "draftDecisionLetter", "reviewNotes"],
      }
    );

    await db.aRCRequest.update({
      where: { id: payload.arcId },
      data: { aiAnalysis: JSON.stringify(result), aiAnalyzedAt: new Date() },
    });
  },

  // ── 5. WorkOrder: Route to vendor + estimate cost ───────────────────
  async routeWorkOrder(payload: { workOrderId: string },  _job: Job) {
    const workOrder = await db.workOrder.findUnique({
      where: { id: payload.workOrderId },
      include: { hoa: { select: { community: true, zip: true } } },
    });
    if (!workOrder) return;

    // Get available contractors in the HOA's area
    const contractors = await db.contractorWaitlist.findMany({
      where: { paid: true },
      select: { id: true, company: true, category: true, zip: true },
      take: 20,
    });

    const result = await ai<{
      urgencyLevel: "routine" | "urgent" | "emergency";
      estimatedCostCents: number;
      estimatedDurationDays: number;
      recommendedVendorCategory: string;
      recommendedVendorId: string | null;
      routingReason: string;
      scopeNotes: string;
      requiredPermits: string[];
    }>(
      `You are WorkOrder — the maintenance routing AI for ${workOrder.hoa.community} HOA.

Work order details:
- Title: ${workOrder.title}
- Area: ${workOrder.area ?? "Common area"}
- Priority: ${workOrder.priority}
- Description: ${workOrder.notes ?? workOrder.title}
- HOA zip: ${workOrder.hoa.zip}

Available contractors (paid GatePass members):
${contractors.map(c => `- ID: ${c.id} | ${c.company} | ${c.category} | zip: ${c.zip}`).join("\n") || "None available yet"}

Tasks:
1. Assess urgency (routine/urgent/emergency)
2. Estimate cost in cents (realistic Austin market rate)
3. Estimate duration in business days
4. Identify required vendor category
5. Recommend best matching contractor from list (or null if none match)
6. Note any permits likely needed
7. Provide scope notes`,
      {
        type: "object",
        properties: {
          urgencyLevel: { type: "string", enum: ["routine", "urgent", "emergency"] },
          estimatedCostCents: { type: "number" },
          estimatedDurationDays: { type: "number" },
          recommendedVendorCategory: { type: "string" },
          recommendedVendorId: { type: ["string", "null"] },
          routingReason: { type: "string" },
          scopeNotes: { type: "string" },
          requiredPermits: { type: "array", items: { type: "string" } },
        },
        required: ["urgencyLevel", "estimatedCostCents", "estimatedDurationDays", "recommendedVendorCategory", "recommendedVendorId", "routingReason", "scopeNotes", "requiredPermits"],
      }
    );

    await db.workOrder.update({
      where: { id: payload.workOrderId },
      data: {
        estimatedCost: result.estimatedCostCents,
        aiAnalysis: JSON.stringify(result),
        aiAnalyzedAt: new Date(),
      },
    });
  },

  // ── 6. BoardRoom: Generate meeting agenda from open items ────────────
  async generateAgenda(payload: { meetingId: string },  _job: Job) {
    const meeting = await db.meeting.findUnique({
      where: { id: payload.meetingId },
      include: { hoa: true },
    });
    if (!meeting) return;

    const hoaId = meeting.hoaId;

    // Pull all open items across modules
    const [violations, workOrders, arcRequests, votes, financialSummary] = await Promise.all([
      db.violation.findMany({
        where: { hoaId, status: { in: ["open", "noticed", "escalated"] } },
        select: { category: true, severity: true, address: true },
        take: 10,
      }),
      db.workOrder.findMany({
        where: { hoaId, status: { in: ["open", "assigned"] } },
        select: { title: true, priority: true, estimatedCost: true },
        take: 10,
      }),
      db.aRCRequest.findMany({
        where: { hoaId, status: { in: ["submitted", "under_review"] } },
        select: { projectType: true, homeowner: { select: { address: true } } },
        take: 5,
      }),
      db.vote.findMany({
        where: { hoaId, status: "open" },
        select: { title: true, type: true },
        take: 5,
      }),
      db.duesAccount.aggregate({
        where: { homeowner: { hoaId }, balanceCents: { gt: 0 } },
        _sum: { balanceCents: true },
        _count: true,
      }),
    ]);

    const result = await ai<{
      agendaItems: Array<{
        order: number;
        title: string;
        category: string;
        estimatedMinutes: number;
        presenter: string;
        notes: string;
        actionRequired: boolean;
      }>;
      callToOrder: string;
      adjournmentNotes: string;
      totalEstimatedMinutes: number;
    }>(
      `You are BoardRoom — the governance AI for ${meeting.hoa.community} HOA.

Generate a structured meeting agenda for: "${meeting.title}"
Type: ${meeting.type}
Date: ${new Date(meeting.scheduledAt).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}

Open items across all modules:

VIOLATIONS (${violations.length} open):
${violations.map(v => `- ${v.severity} ${v.category} at ${v.address}`).join("\n") || "None"}

WORK ORDERS (${workOrders.length} open):
${workOrders.map(w => `- [${w.priority}] ${w.title}${w.estimatedCost ? ` (~$${(w.estimatedCost/100).toLocaleString()})` : ""}`).join("\n") || "None"}

PENDING ARC REVIEWS (${arcRequests.length}):
${arcRequests.map(a => `- ${a.projectType} at ${a.homeowner.address}`).join("\n") || "None"}

OPEN VOTES (${votes.length}):
${votes.map(v => `- ${v.title} (${v.type})`).join("\n") || "None"}

FINANCIAL: ${financialSummary._count} accounts with outstanding balances totaling $${((financialSummary._sum.balanceCents ?? 0) / 100).toLocaleString()}

Generate a complete, Robert's Rules-compliant agenda with estimated time for each item. Include standard HOA agenda structure (call to order, quorum, minutes approval, treasurer report, etc.).`,
      {
        type: "object",
        properties: {
          agendaItems: {
            type: "array",
            items: {
              type: "object",
              properties: {
                order: { type: "number" },
                title: { type: "string" },
                category: { type: "string" },
                estimatedMinutes: { type: "number" },
                presenter: { type: "string" },
                notes: { type: "string" },
                actionRequired: { type: "boolean" },
              },
              required: ["order", "title", "category", "estimatedMinutes", "presenter", "notes", "actionRequired"],
            },
          },
          callToOrder: { type: "string" },
          adjournmentNotes: { type: "string" },
          totalEstimatedMinutes: { type: "number" },
        },
        required: ["agendaItems", "callToOrder", "adjournmentNotes", "totalEstimatedMinutes"],
      }
    );

    // Store generated agenda items in DB
    const existingItems = await db.agendaItem.count({ where: { meetingId: payload.meetingId } });
    if (existingItems === 0) {
      await Promise.all(
        result.agendaItems.map((item) =>
          db.agendaItem.create({
            data: {
              meetingId: payload.meetingId,
              order: item.order,
              title: item.title,
              description: `${item.notes} (Est. ${item.estimatedMinutes} min — ${item.presenter})`,
              duration: item.estimatedMinutes,
              actionRequired: item.actionRequired,
            },
          })
        )
      );
    }

    await db.meeting.update({
      where: { id: payload.meetingId },
      data: { aiAnalysis: JSON.stringify(result), aiAnalyzedAt: new Date() },
    });
  },

  // ── 7. VoteBox: Summarize results + draft resolution ────────────────
  async summarizeVoteResults(payload: { voteId: string },  _job: Job) {
    const vote = await db.vote.findUnique({
      where: { id: payload.voteId },
      include: {
        hoa: { select: { community: true } },
        casts: { select: { selection: true } },
      },
    });
    if (!vote) return;

    const tally: Record<string, number> = {};
    for (const cast of vote.casts) {
      tally[cast.selection] = (tally[cast.selection] ?? 0) + 1;
    }
    const comments: string[] = [];

    const result = await ai<{
      passed: boolean;
      margin: string;
      resolution: string;
      minutesLanguage: string;
      keyThemes: string[];
      nextSteps: string[];
      implementationNotes: string;
    }>(
      `You are VoteBox — the elections and governance AI for ${vote.hoa.community} HOA.

Vote: "${vote.title}"
Type: ${vote.type}
Description: ${vote.description ?? ""}
Options: ${(JSON.parse(vote.options) as string[]).join(", ")}
Requires quorum: ${vote.requiresQuorum}
Quorum count: ${vote.quorumCount ?? "Not set"}

Results:
${Object.entries(tally).map(([k, v]) => `- ${k}: ${v} votes`).join("\n")}
Total votes cast: ${vote.casts.length}

Resident comments:
${comments.length > 0 ? comments.map(c => `"${c}"`).join("\n") : "None"}

Tasks:
1. Determine if vote passed (majority or as specified)
2. Calculate margin
3. Draft official resolution language (formal, binding)
4. Write minutes language for the record
5. Identify key themes from comments
6. List concrete next steps for implementation
7. Note any implementation considerations`,
      {
        type: "object",
        properties: {
          passed: { type: "boolean" },
          margin: { type: "string" },
          resolution: { type: "string" },
          minutesLanguage: { type: "string" },
          keyThemes: { type: "array", items: { type: "string" } },
          nextSteps: { type: "array", items: { type: "string" } },
          implementationNotes: { type: "string" },
        },
        required: ["passed", "margin", "resolution", "minutesLanguage", "keyThemes", "nextSteps", "implementationNotes"],
      }
    );

    await db.vote.update({
      where: { id: payload.voteId },
      data: { aiAnalysis: JSON.stringify(result), aiAnalyzedAt: new Date() },
    });
  },

  // ── 8. Amenity: Detect conflicts + suggest alternatives ─────────────
  async analyzeReservation(payload: { reservationId: string },  _job: Job) {
    const reservation = await db.reservation.findUnique({
      where: { id: payload.reservationId },
      include: {
        amenity: true,
        homeowner: { select: { name: true, address: true } },
      },
    });
    if (!reservation) return;

    // Check for conflicts on same date (string comparison of HH:MM times)
    const conflicts = await db.reservation.findMany({
      where: {
        amenityId: reservation.amenityId,
        id: { not: reservation.id },
        date: reservation.date,
        status: { in: ["confirmed", "pending"] },
      },
      include: { homeowner: { select: { name: true } } },
    });

    // Filter actual time overlaps in JS (strings are HH:MM, sortable)
    const overlapping = conflicts.filter(c =>
      c.startTime < reservation.endTime && c.endTime > reservation.startTime
    );

    const result = await ai<{
      hasConflict: boolean;
      conflictSeverity: "none" | "partial" | "full";
      decision: "confirm" | "waitlist" | "suggest_alternative" | "reject";
      alternativeSlots: string[];
      confirmationMessage: string;
      ruleChecks: string[];
    }>(
      `You are Amenity — the reservation management AI for ${reservation.amenity.name}.

Reservation request:
- Resident: ${reservation.homeowner.name} (${reservation.homeowner.address})
- Amenity: ${reservation.amenity.name} (capacity: ${reservation.amenity.capacity ?? "unlimited"})
- Date: ${reservation.date}, Time: ${reservation.startTime}–${reservation.endTime}
- Purpose: ${reservation.notes ?? "Not specified"}
- Party size: ${reservation.partySize ?? "Not specified"}

Overlapping reservations on this date: ${overlapping.length > 0 ? overlapping.map(c => `${c.homeowner.name} (${c.startTime}–${c.endTime})`).join(", ") : "None"}

All bookings on this date: ${conflicts.map(c => `${c.startTime}–${c.endTime}`).join(", ") || "None"}
Available window: 08:00–22:00

Amenity rules: max 4-hour blocks, 24h advance notice required, residents only, no commercial use.

Determine if this reservation should be confirmed, waitlisted, or redirected to an alternative slot. Suggest 3 alternative HH:MM time slots on the same date if there's a conflict.`,
      {
        type: "object",
        properties: {
          hasConflict: { type: "boolean" },
          conflictSeverity: { type: "string", enum: ["none", "partial", "full"] },
          decision: { type: "string", enum: ["confirm", "waitlist", "suggest_alternative", "reject"] },
          alternativeSlots: { type: "array", items: { type: "string" } },
          confirmationMessage: { type: "string" },
          ruleChecks: { type: "array", items: { type: "string" } },
        },
        required: ["hasConflict", "conflictSeverity", "decision", "alternativeSlots", "confirmationMessage", "ruleChecks"],
      }
    );

    // Auto-confirm if no conflict
    const newStatus = result.decision === "confirm" ? "confirmed" : "pending";
    await db.reservation.update({
      where: { id: payload.reservationId },
      data: { status: newStatus, aiAnalysis: JSON.stringify(result), aiAnalyzedAt: new Date() },
    });
  },

  // ── 9. CommHub: Draft announcement + score for clarity/tone ─────────
  async draftAnnouncement(payload: { announcementId: string },  _job: Job) {
    const announcement = await db.announcement.findUnique({
      where: { id: payload.announcementId },
      include: { hoa: { select: { community: true, units: true } } },
    });
    if (!announcement) return;

    const result = await ai<{
      improvedTitle: string;
      improvedBody: string;
      clarityScore: number;
      toneScore: number;
      urgencyLevel: "routine" | "important" | "urgent";
      suggestedChannels: string[];
      estimatedReadTime: number;
      keyPoints: string[];
      callToAction: string | null;
      warnings: string[];
    }>(
      `You are CommHub — the community communications AI for ${announcement.hoa.community} HOA (${announcement.hoa.units} units).

Original announcement:
Title: ${announcement.title}
Body: ${announcement.body}
Category: ${announcement.category ?? "general"}

Tasks:
1. Improve the title for clarity and engagement (keep under 60 chars)
2. Rewrite the body to be clear, professional, and appropriately toned for an HOA
   - Remove jargon, passive voice, legal-ese
   - Use plain English
   - Be direct but not aggressive
3. Score clarity (0-100) and tone (0-100, where 100 = perfectly appropriate for residents)
4. Determine urgency level
5. Suggest channels (email/app notification/physical bulletin board/all)
6. Extract key points (bullet list)
7. Identify a call to action if one exists
8. Flag any warnings (liability language, offensive tone, missing info, etc.)`,
      {
        type: "object",
        properties: {
          improvedTitle: { type: "string" },
          improvedBody: { type: "string" },
          clarityScore: { type: "number" },
          toneScore: { type: "number" },
          urgencyLevel: { type: "string", enum: ["routine", "important", "urgent"] },
          suggestedChannels: { type: "array", items: { type: "string" } },
          estimatedReadTime: { type: "number" },
          keyPoints: { type: "array", items: { type: "string" } },
          callToAction: { type: ["string", "null"] },
          warnings: { type: "array", items: { type: "string" } },
        },
        required: ["improvedTitle", "improvedBody", "clarityScore", "toneScore", "urgencyLevel", "suggestedChannels", "estimatedReadTime", "keyPoints", "callToAction", "warnings"],
      }
    );

    await db.announcement.update({
      where: { id: payload.announcementId },
      data: { aiAnalysis: JSON.stringify(result), aiAnalyzedAt: new Date() },
    });
  },

} satisfies QueueHandlers;

export const queue = getQueue<typeof jobs>();
