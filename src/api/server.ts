import { Hono } from "hono";
import { deserialize, serialize } from "superjson";
import { serve } from "@hono/node-server";
import {
  honoMiddleware,
  initializeServerEnvironment,
} from "@adaptive-ai/sdk/server";
import { env } from "@/lib/env";
import Stripe from "stripe";
import { db } from "@/api/db";
import { sendHOAConfirmation, sendContractorConfirmation } from "@/api/email";

const transcoder = { serialize, deserialize };

initializeServerEnvironment({
  baseUrl: env.VITE_BASE_URL,
  realtimeDomain: env.VITE_REALTIME_DOMAIN,
  guestServicesUrl: env.GUEST_SERVICES_URL,
  environment: env.VITE_NODE_ENV,
  apiKey: env.API_KEY,
  queueDbPath: env.QUEUE_DB_FILE_NAME,
  errorsDbPath: env.ERRORS_DB_FILE_NAME,
});

// Import these after initializing the environment
const { procedures, jobs } = await import("@/api");

const app = new Hono();

// ─── Stripe Webhook ────────────────────────────────────────────────────
app.post("/webhook/stripe", async (c) => {
  const stripeKey = env.STRIPE_SECRET_KEY;
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
  if (!stripeKey) return c.json({ error: "Stripe not configured" }, 500);

  const stripe = new Stripe(stripeKey);
  const sig = c.req.header("stripe-signature");
  const rawBody = await c.req.text();

  let event: Stripe.Event;

  try {
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } else {
      // No secret configured — parse without verification (dev only)
      event = JSON.parse(rawBody) as Stripe.Event;
    }
  } catch (err) {
    console.error("[webhook] signature verification failed:", err);
    return c.json({ error: "Invalid signature" }, 400);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { hoaId, contractorId } = session.metadata ?? {};
    const paidAt = new Date();

    if (hoaId) {
      const hoa = await db.hOA.update({
        where: { id: hoaId },
        data: { paid: true, paidAt, amountCents: session.amount_total ?? 0 },
      });
      // Send confirmation email
      await sendHOAConfirmation({
        to: hoa.contactEmail,
        name: hoa.contactName,
        community: hoa.community,
        units: hoa.units,
        amountCents: hoa.amountCents ?? 0,
      }).catch((e) => console.error("[email] HOA confirmation failed:", e));
    }

    if (contractorId) {
      const contractor = await db.contractorWaitlist.update({
        where: { id: contractorId },
        data: { paid: true, paidAt, },
      });
      await sendContractorConfirmation({
        to: contractor.email,
        name: contractor.contactName,
        company: contractor.company,
        category: contractor.category,
        position: contractor.position ?? 0,
      }).catch((e) => console.error("[email] Contractor confirmation failed:", e));
    }
  }

  return c.json({ received: true });
});

app.use(honoMiddleware({ procedures, jobs, transcoder }));

serve({
  fetch: app.fetch,
  port: Number(env.PORT) + 1,
});
