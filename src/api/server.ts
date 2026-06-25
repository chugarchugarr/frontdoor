import { Hono } from "hono";
import { deserialize, serialize } from "superjson";
import { serve } from "@hono/node-server";
import {
  honoMiddleware,
  initializeServerEnvironment,
} from "@adaptive-ai/sdk/server";
import { env } from "@/lib/env";
import { stripeWebhook } from "@/api/stripe.webhook";
import { proofPackRoute } from "@/api/proofPack.route";

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
app.post("/webhook/stripe", stripeWebhook);
app.get("/admin/proof-pack.pdf", proofPackRoute);

app.use(honoMiddleware({ procedures, jobs, transcoder }));

serve({
  fetch: app.fetch,
  port: Number(env.PORT) + 1,
});
