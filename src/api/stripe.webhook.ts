import type { Context } from "hono";
import Stripe from "stripe";
import { db } from "@/api/db";
import { env } from "@/lib/env";
import { sendContractorConfirmation, sendHOAConfirmation } from "@/api/email";
import { computeSplit } from "@/api/marketplace.guards";

function getStripe() {
  const key = env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe not configured");
  return new Stripe(key);
}

async function settleMarketplaceQuote(input: {
  quoteId: string;
  idempotencyKey: string;
  stripePaymentIntentId?: string;
}) {
  return db.$transaction(async (tx) => {
    const existing = await tx.marketplaceTransaction.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
    });
    if (existing) return existing;

    const quote = await tx.contractorQuote.findUniqueOrThrow({
      where: { id: input.quoteId },
      include: { marketplaceJob: true },
    });
    if (quote.status !== "approved") {
      throw new Error("Quote must be approved before settlement");
    }

    const split = computeSplit(quote.amountCents);
    const transaction = await tx.marketplaceTransaction.create({
      data: {
        jobId: quote.marketplaceJobId,
        quoteId: quote.id,
        hoaId: quote.marketplaceJob.hoaId,
        contractorId: quote.contractorId,
        grossAmountCents: split.grossCents,
        gatepassFeeCents: split.gatepassFeeCents,
        hoaShareCents: split.hoaShareCents,
        stripePaymentIntentId: input.stripePaymentIntentId,
        idempotencyKey: input.idempotencyKey,
        status: "settled",
        settledAt: new Date(),
      },
    });

    await tx.marketplaceJob.update({
      where: { id: quote.marketplaceJobId },
      data: { status: "in_progress" },
    });

    return transaction;
  });
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, eventId: string) {
  const metadata = session.metadata ?? {};
  const paidAt = new Date();

  if (metadata.hoaId) {
    const hoa = await db.hOA.update({
      where: { id: metadata.hoaId },
      data: { paid: true, paidAt, amountCents: session.amount_total ?? 0 },
    });
    await sendHOAConfirmation({
      to: hoa.contactEmail,
      name: hoa.contactName,
      community: hoa.community,
      units: hoa.units,
      amountCents: hoa.amountCents ?? 0,
    }).catch((error) => console.error("[email] HOA confirmation failed:", error));
  }

  if (metadata.contractorId) {
    const contractor = await db.contractorWaitlist.update({
      where: { id: metadata.contractorId },
      data: { paid: true, paidAt },
    });
    await sendContractorConfirmation({
      to: contractor.email,
      name: contractor.contactName,
      company: contractor.company,
      category: contractor.category,
    }).catch((error) => console.error("[email] Contractor confirmation failed:", error));
  }

  if (metadata.kind === "contractor_seat" && metadata.waitlistId) {
    const waitlist = await db.contractorWaitlist.update({
      where: { id: metadata.waitlistId },
      data: { paid: true, paidAt },
    });
    const profile = await db.contractorProfile.upsert({
      where: { waitlistId: waitlist.id },
      update: { screeningStatus: "paid_founding_seat" },
      create: {
        waitlistId: waitlist.id,
        company: waitlist.company,
        contactName: waitlist.contactName,
        email: waitlist.email,
        phone: waitlist.phone,
        trades: JSON.stringify([metadata.trade ?? waitlist.category]),
        serviceZips: JSON.stringify([waitlist.zip]),
        screeningStatus: "paid_founding_seat",
      },
    });
    if (metadata.hoaId && metadata.trade) {
      await db.contractorCommunityAccess.upsert({
        where: {
          contractorId_hoaId_trade: {
            contractorId: profile.id,
            hoaId: metadata.hoaId,
            trade: metadata.trade,
          },
        },
        update: { status: "active", activeFrom: new Date(), activeUntil: null },
        create: {
          contractorId: profile.id,
          hoaId: metadata.hoaId,
          trade: metadata.trade,
          status: "active",
          accessType: "founding_slot",
          activeFrom: new Date(),
        },
      });
    }
  }

  if (metadata.kind === "marketplace_job" && metadata.quoteId) {
    await settleMarketplaceQuote({
      quoteId: metadata.quoteId,
      idempotencyKey: eventId,
      stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : undefined,
    });
  }
}

export async function processStripeWebhook(rawBody: string, signature?: string | string[]) {
  const stripe = getStripe();
  const sig = Array.isArray(signature) ? signature[0] : signature;

  let event: Stripe.Event;
  try {
    if (env.STRIPE_WEBHOOK_SECRET && sig) {
      event = stripe.webhooks.constructEvent(rawBody, sig, env.STRIPE_WEBHOOK_SECRET);
    } else if (env.VITE_NODE_ENV !== "production") {
      event = JSON.parse(rawBody) as Stripe.Event;
    } else {
      throw new Error("Stripe webhook secret not configured");
    }
  } catch (error) {
    console.error("[webhook] signature verification failed:", error);
    const invalidSignature = new Error("Invalid signature");
    invalidSignature.cause = error;
    throw invalidSignature;
  }

  const seen = await db.processedStripeEvent.findUnique({ where: { id: event.id } });
  if (seen) return { received: true, duplicate: true };

  try {
    if (event.type === "checkout.session.completed") {
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session, event.id);
    }

    if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      const paymentRef = typeof charge.payment_intent === "string" ? charge.payment_intent : undefined;
      if (paymentRef) {
        await db.marketplaceTransaction.updateMany({
          where: { stripePaymentIntentId: paymentRef },
          data: { status: "refunded" },
        });
      }
    }

    await db.processedStripeEvent.create({ data: { id: event.id, type: event.type } });
    return { received: true };
  } catch (error) {
    console.error("[webhook] handler error:", error);
    throw error;
  }
}

export async function stripeWebhook(c: Context) {
  try {
    const result = await processStripeWebhook(c.req.text ? await c.req.text() : "", c.req.header("stripe-signature"));
    return c.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook handler failed";
    return c.json({ error: message }, message === "Invalid signature" ? 400 : 500);
  }
}
