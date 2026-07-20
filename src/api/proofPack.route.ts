import type { Context } from "hono";
import { buildProofPack } from "@/api/proofPack";

export async function proofPackRoute(c: Context) {
  const live = c.req.query("demo") !== "true";
  const hoaId = c.req.query("hoaId") || undefined;

  if (!live && process.env.GATEPASS_ALLOW_DEMO !== "true") {
    return c.json({ error: "Demo record pack disabled in this environment." }, 403);
  }

  const pdf = await buildProofPack({ live, hoaId });
  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="gatepass-record-pack${live ? "" : "-demo"}.pdf"`,
    },
  });
}
