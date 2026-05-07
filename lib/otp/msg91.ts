import "server-only";

import { env, hasMsg91 } from "@/lib/env";
import { logger } from "@/lib/logger";

/**
 * MSG91 OTP SMS sender (India-friendly: cheap, DLT-compliant).
 *
 * Docs: https://docs.msg91.com/p/tf9GTextN/e/SmDOOVHv1H/MSG91
 *
 * In dev (no MSG91_AUTH_KEY): logs the OTP to the server console. This lets
 * you exercise the full flow locally before completing DLT registration —
 * which can take 4–7 days.
 *
 * Retry: a single transient 5xx from MSG91 used to burn the user's per-hour
 * quota. We now retry once with a 500ms backoff before giving up.
 */

const RETRY_DELAY_MS = 500;
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function sendPhoneOtp(args: {
  phone: string; // E.164 — e.g. "+919876543210"
  code: string;
}): Promise<{ ok: boolean; provider: "msg91" | "console"; messageId?: string }> {
  if (!hasMsg91) {
    // Dev fallback — surface OTP to terminal so we can finish login.
    console.log(
      `\n[dev-otp] phone=${args.phone}  code=${args.code}  (set MSG91_AUTH_KEY to send real SMS)\n`,
    );
    return { ok: true, provider: "console" };
  }

  const url = "https://control.msg91.com/api/v5/otp";
  const body = {
    template_id: env.MSG91_TEMPLATE_ID,
    mobile: args.phone.replace(/^\+/, ""),
    sender: env.MSG91_SENDER_ID,
    otp: args.code,
    otp_length: 6,
    otp_expiry: 10,
  };

  for (let attempt = 1; attempt <= 2; attempt++) {
    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authkey: env.MSG91_AUTH_KEY!,
        },
        body: JSON.stringify(body),
      });
    } catch (err) {
      // Network-layer failure (DNS, timeout, ECONNRESET).
      logger.warn("msg91.send.network_error", {
        attempt,
        err: String(err),
      });
      if (attempt < 2) {
        await sleep(RETRY_DELAY_MS);
        continue;
      }
      return { ok: false, provider: "msg91" };
    }

    if (res.ok) {
      const data = (await res.json()) as {
        type?: string;
        request_id?: string;
      };
      return {
        ok: data.type === "success",
        provider: "msg91",
        messageId: data.request_id,
      };
    }

    // Retry on 5xx and 429; bail immediately on 4xx (bad payload, auth fail).
    const retryable = (res.status >= 500 || res.status === 429) && attempt < 2;
    const text = await res.text();
    logger.warn("msg91.send.error", {
      attempt,
      status: res.status,
      retryable,
      body: text.slice(0, 200),
    });
    if (!retryable) {
      return { ok: false, provider: "msg91" };
    }
    await sleep(RETRY_DELAY_MS);
  }
  return { ok: false, provider: "msg91" };
}
