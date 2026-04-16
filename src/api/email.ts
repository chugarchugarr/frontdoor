// ─── GatePass Email via Resend ────────────────────────────────────────
// All transactional emails. Uses Resend API directly (no SDK needed).

const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM = "GatePass <info@gatepasshoa.com>";

async function send(to: string, subject: string, html: string) {
  if (!RESEND_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping send");
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error ${res.status}: ${err}`);
  }
}

// ─── HOA Confirmation ─────────────────────────────────────────────────
export async function sendHOAConfirmation(input: {
  to: string;
  name: string;
  community: string;
  units: number;
  amountCents: number;
}) {
  const amount = `$${(input.amountCents / 100).toLocaleString()}`;
  await send(
    input.to,
    `Welcome to GatePass — ${input.community} is enrolled`,
    `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4F1EC;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F1EC;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #D4CFC6;">
        <!-- Header -->
        <tr><td style="background:#2A5240;padding:32px 40px;">
          <p style="margin:0;color:#F4F1EC;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;font-family:'Courier New',monospace;">GatePass</p>
          <h1 style="margin:8px 0 0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.02em;">You're enrolled.</h1>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px;">
          <p style="margin:0 0 20px;color:#4A4A44;font-size:15px;line-height:1.7;">Hi ${input.name},</p>
          <p style="margin:0 0 20px;color:#4A4A44;font-size:15px;line-height:1.7;">
            <strong>${input.community}</strong> is now a founding GatePass community. You've locked in the $10/unit/year rate before we move to $15 at public launch.
          </p>
          <!-- Receipt box -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#EAF0EC;border-radius:6px;border:1px solid rgba(42,82,64,0.15);margin:0 0 28px;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 4px;color:#8A8A82;font-size:10px;font-family:'Courier New',monospace;letter-spacing:0.08em;text-transform:uppercase;">Enrollment Summary</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
                <tr>
                  <td style="color:#4A4A44;font-size:13px;padding:4px 0;">Community</td>
                  <td align="right" style="color:#1C1C1A;font-size:13px;font-weight:600;">${input.community}</td>
                </tr>
                <tr>
                  <td style="color:#4A4A44;font-size:13px;padding:4px 0;">Units</td>
                  <td align="right" style="color:#1C1C1A;font-size:13px;font-weight:600;">${input.units}</td>
                </tr>
                <tr>
                  <td style="color:#4A4A44;font-size:13px;padding:4px 0;">Annual Rate</td>
                  <td align="right" style="color:#1C1C1A;font-size:13px;font-weight:600;">$10/unit/year</td>
                </tr>
                <tr style="border-top:1px solid #D4CFC6;">
                  <td style="color:#2A5240;font-size:14px;font-weight:700;padding-top:12px;">Total Charged</td>
                  <td align="right" style="color:#2A5240;font-size:18px;font-weight:700;padding-top:12px;">${amount}</td>
                </tr>
              </table>
            </td></tr>
          </table>
          <p style="margin:0 0 20px;color:#4A4A44;font-size:15px;line-height:1.7;">
            We'll reach out within 2 business days to schedule your community onboarding. In the meantime, reply to this email with any questions.
          </p>
          <p style="margin:0;color:#4A4A44;font-size:15px;line-height:1.7;">— The GatePass Team</p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 40px;border-top:1px solid #EAE6DE;">
          <p style="margin:0;color:#8A8A82;font-size:11px;font-family:'Courier New',monospace;">Austin TX · Metro 1 · gatepasshoa.com</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
  );
}

// ─── Contractor Confirmation ──────────────────────────────────────────
export async function sendContractorConfirmation(input: {
  to: string;
  name: string;
  company: string;
  category: string;
  position: number;
}) {
  await send(
    input.to,
    `Your seat is reserved — GatePass Contractor #${input.position}`,
    `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4F1EC;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F1EC;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #D4CFC6;">
        <!-- Header -->
        <tr><td style="background:#B8883A;padding:32px 40px;">
          <p style="margin:0;color:rgba(255,255,255,0.7);font-size:11px;letter-spacing:0.1em;text-transform:uppercase;font-family:'Courier New',monospace;">GatePass · Contractor Seat</p>
          <h1 style="margin:8px 0 0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.02em;">Seat #${input.position} secured.</h1>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px;">
          <p style="margin:0 0 20px;color:#4A4A44;font-size:15px;line-height:1.7;">Hi ${input.name},</p>
          <p style="margin:0 0 20px;color:#4A4A44;font-size:15px;line-height:1.7;">
            <strong>${input.company}</strong> is in. You hold founding contractor seat <strong>#${input.position} of 25</strong> in the Austin metro.
          </p>
          <!-- Receipt box -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#FDF8EF;border-radius:6px;border:1px solid rgba(184,136,58,0.2);margin:0 0 28px;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 4px;color:#8A8A82;font-size:10px;font-family:'Courier New',monospace;letter-spacing:0.08em;text-transform:uppercase;">Your Details</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
                <tr>
                  <td style="color:#4A4A44;font-size:13px;padding:4px 0;">Company</td>
                  <td align="right" style="color:#1C1C1A;font-size:13px;font-weight:600;">${input.company}</td>
                </tr>
                <tr>
                  <td style="color:#4A4A44;font-size:13px;padding:4px 0;">Category</td>
                  <td align="right" style="color:#1C1C1A;font-size:13px;font-weight:600;">${input.category}</td>
                </tr>
                <tr>
                  <td style="color:#4A4A44;font-size:13px;padding:4px 0;">Market</td>
                  <td align="right" style="color:#1C1C1A;font-size:13px;font-weight:600;">Austin TX · Metro 1</td>
                </tr>
                <tr style="border-top:1px solid #D4CFC6;">
                  <td style="color:#B8883A;font-size:14px;font-weight:700;padding-top:12px;">Seat</td>
                  <td align="right" style="color:#B8883A;font-size:18px;font-weight:700;padding-top:12px;">#${input.position} of 25</td>
                </tr>
              </table>
            </td></tr>
          </table>
          <p style="margin:0 0 20px;color:#4A4A44;font-size:15px;line-height:1.7;">
            Your $99 deposit is fully refundable if GatePass doesn't launch within 6 months. You'll be among the first contacted when homeowner leads are live.
          </p>
          <p style="margin:0;color:#4A4A44;font-size:15px;line-height:1.7;">— The GatePass Team</p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 40px;border-top:1px solid #EAE6DE;">
          <p style="margin:0;color:#8A8A82;font-size:11px;font-family:'Courier New',monospace;">Austin TX · Metro 1 · gatepasshoa.com</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
  );
}
