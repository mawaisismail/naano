/**
 * Transactional email.
 *
 * One provider-agnostic entry point so the recovery flow does not care who
 * actually delivers the message. Resend is wired up because its API is a
 * single POST with a bearer token; swapping it for Postmark or SES is a change
 * inside this file only.
 *
 * With no credentials configured the message is written to the server log
 * instead of being sent, and the caller is told it was not delivered. That is
 * deliberate: a local developer needs to see the code to finish the flow, and
 * silently swallowing the send would make a broken production config look fine.
 */

export type Email = { to: string; subject: string; text: string };

export type SendResult = { delivered: boolean; reason?: string };

const placeholder = (v?: string) =>
  !v || !v.trim() || /^(dummy|changeme|your[-_]|re_dummy)/i.test(v.trim());

export function emailConfigured(): boolean {
  return !placeholder(process.env.RESEND_API_KEY) && !placeholder(process.env.EMAIL_FROM);
}

export async function sendEmail({ to, subject, text }: Email): Promise<SendResult> {
  if (!emailConfigured()) {
    // Never log the recipient's address next to the body in production; this
    // branch only runs when there is no provider, i.e. in development.
    console.info(
      `[email] not configured — message not sent.\n  to: ${to}\n  subject: ${subject}\n  ${text.replace(/\n/g, "\n  ")}`
    );
    return { delivered: false, reason: "not-configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to, subject, text }),
      cache: "no-store",
    });
    if (!res.ok) {
      // The provider's body can echo the API key back in an error payload, so
      // only the status code is kept.
      console.error(`[email] provider rejected the send (${res.status})`);
      return { delivered: false, reason: `provider-${res.status}` };
    }
    return { delivered: true };
  } catch {
    console.error("[email] provider unreachable");
    return { delivered: false, reason: "unreachable" };
  }
}

/**
 * Whether the build may fall back to a fixed demo reset code.
 *
 * Two conditions, both required. A fixed code is an account-takeover hole —
 * anyone who knows it can reset anyone's password — so it is only ever allowed
 * where there is no mailbox to send a real one AND the build is not a
 * production deployment. DEMO_PASSWORD_RESET=1 is the deliberate override for
 * a hosted demo, which has to be typed by a person rather than happening by
 * accident because someone forgot to set an API key.
 */
export function demoResetEnabled(): boolean {
  if (emailConfigured()) return false;
  if (process.env.DEMO_PASSWORD_RESET === "1") return true;
  return process.env.NODE_ENV !== "production";
}

/** The fixed code used in demo mode. Never used when email is configured. */
export const DEMO_RESET_CODE = "123456";
