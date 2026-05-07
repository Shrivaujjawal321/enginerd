import "server-only";

import { Resend } from "resend";

import { env, hasResend } from "@/lib/env";
import { logger } from "@/lib/logger";

/**
 * Email OTP via Resend.
 *
 * In dev (no RESEND_API_KEY): logs the OTP to the server console.
 *
 * Retry: a single transient 5xx from Resend used to burn the user's per-hour
 * OTP send quota. We now retry once with a 500ms backoff before giving up,
 * which absorbs the typical Resend hiccup (sub-second blip) without
 * masking sustained outages.
 */

let resendClient: Resend | null = null;
function getClient(): Resend {
  if (!resendClient) resendClient = new Resend(env.RESEND_API_KEY);
  return resendClient;
}

const RETRY_DELAY_MS = 500;

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

/** True for the kinds of errors a quick retry should plausibly resolve —
 *  network blips, 5xx, rate-limit bumps. False for hard rejects (auth,
 *  malformed payload, suppression list). */
function isRetryable(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { name?: string; statusCode?: number; message?: string };
  if (e.statusCode && e.statusCode >= 500 && e.statusCode < 600) return true;
  if (e.statusCode === 429) return true;
  // Resend SDK surfaces some transient cases without statusCode.
  const m = (e.message ?? "").toLowerCase();
  return m.includes("network") || m.includes("timeout") || m.includes("econnreset");
}

export async function sendEmailOtp(args: {
  email: string;
  code: string;
}): Promise<{ ok: boolean; provider: "resend" | "console"; messageId?: string }> {
  if (!hasResend) {
    console.log(
      `\n[dev-otp] email=${args.email}  code=${args.code}  (set RESEND_API_KEY to send real email)\n`,
    );
    return { ok: true, provider: "console" };
  }

  const payload = {
    from: env.RESEND_FROM_EMAIL,
    to: args.email,
    subject: `${args.code} is your EngiNerd code`,
    html: emailHtml(args.code),
    text: emailText(args.code),
  };

  for (let attempt = 1; attempt <= 2; attempt++) {
    const result = await getClient().emails.send(payload);
    if (!result.error) {
      return { ok: true, provider: "resend", messageId: result.data?.id };
    }
    const retryable = isRetryable(result.error) && attempt < 2;
    logger.warn("resend.send.error", {
      attempt,
      retryable,
      err: String(result.error),
    });
    if (!retryable) {
      return { ok: false, provider: "resend" };
    }
    await sleep(RETRY_DELAY_MS);
  }
  // Loop guarantees a return inside; this line is unreachable but keeps TS happy.
  return { ok: false, provider: "resend" };
}

/* ---------- Templates --------------------------------------------------- */

function emailHtml(code: string): string {
  return `
<!doctype html>
<html>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#0a0a0f; color:#ededee; padding:32px;">
    <div style="max-width:480px; margin:0 auto; background:#111319; border:1px solid rgba(255,255,255,0.06); border-radius:16px; padding:32px;">
      <h1 style="margin:0 0 16px; font-size:20px; letter-spacing:-0.01em;">
        Your <span style="background:linear-gradient(90deg,#8b5cf6,#06b6d4);-webkit-background-clip:text;background-clip:text;color:transparent;">EngiNerd</span> code
      </h1>
      <p style="color:#a1a1aa; line-height:1.6; margin:0 0 24px;">
        Here is your 6-digit code. It expires in 10 minutes. If you didn't request this, you can safely ignore this email.
      </p>
      <div style="font-size:36px; font-weight:700; letter-spacing:0.3em; text-align:center; padding:24px; background:rgba(139,92,246,0.08); border:1px solid rgba(139,92,246,0.25); border-radius:12px; font-family:'JetBrains Mono', ui-monospace, monospace;">
        ${code}
      </div>
      <p style="color:#71717a; font-size:12px; margin-top:24px;">
        EngiNerd — your placement-prep companion.
      </p>
    </div>
  </body>
</html>`.trim();
}

function emailText(code: string): string {
  return `Your EngiNerd code: ${code}\n\nIt expires in 10 minutes. If you didn't request this, ignore this email.\n\n— EngiNerd`;
}
