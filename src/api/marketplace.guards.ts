export const GATEPASS_FEE_BPS = 500;
export const HOA_CREDIT_BPS = 250;

export type JobStatus = "open" | "quoted" | "approved" | "in_progress" | "complete" | "completed" | "cancelled";
export type QuoteStatus = "submitted" | "approved" | "rejected" | "declined" | "withdrawn" | "expired";

const JOB_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  open: ["quoted", "cancelled"],
  quoted: ["approved", "cancelled"],
  approved: ["in_progress", "cancelled"],
  in_progress: ["complete", "completed", "cancelled"],
  complete: [],
  completed: [],
  cancelled: [],
};

const QUOTE_TRANSITIONS: Record<QuoteStatus, QuoteStatus[]> = {
  submitted: ["approved", "rejected", "declined", "withdrawn", "expired"],
  approved: ["rejected", "declined", "withdrawn"],
  rejected: [],
  declined: [],
  withdrawn: [],
  expired: [],
};

export function assertJobTransition(from: string, to: JobStatus) {
  const current = from as JobStatus;
  if (!JOB_TRANSITIONS[current]?.includes(to)) {
    throw new Error(`Illegal job transition: ${from} -> ${to}`);
  }
}

export function assertQuoteTransition(from: string, to: QuoteStatus) {
  const current = from as QuoteStatus;
  if (!QUOTE_TRANSITIONS[current]?.includes(to)) {
    throw new Error(`Illegal quote transition: ${from} -> ${to}`);
  }
}

export function computeSplit(grossCents: number) {
  const gatepassFeeCents = Math.round((grossCents * GATEPASS_FEE_BPS) / 10000);
  const hoaShareCents = Math.round((grossCents * HOA_CREDIT_BPS) / 10000);
  return { grossCents, gatepassFeeCents, hoaShareCents };
}
