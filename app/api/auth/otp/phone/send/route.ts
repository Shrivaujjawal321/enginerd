import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";

import { sendPhoneOtpSchema } from "@/lib/validators/otp";
import { issueOtp } from "@/lib/otp/store";
import { sendPhoneOtp } from "@/lib/otp/msg91";
import {
  otpSendLimiter,
  otpSendByIpLimiter,
  getClientIp,
  tooManyRequests,
} from "@/lib/ratelimit";
import { logAuditEvent } from "@/lib/audit";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = sendPhoneOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { phone } = parsed.data;
  const ip = getClientIp(req);

  // Two layers: per-phone (3/h) AND per-IP (5/h). Without the IP layer
  // an attacker iterating through phone numbers can rack up real SMS cost.
  const [byPhone, byIp] = await Promise.all([
    otpSendLimiter.limit(phone),
    otpSendByIpLimiter.limit(`phone:${ip}`),
  ]);
  if (!byPhone.success || !byIp.success) {
    return tooManyRequests(Math.max(byPhone.reset, byIp.reset));
  }

  try {
    const { code, expiresAt } = await issueOtp({
      identifier: phone,
      channel: "phone",
      ip,
    });
    const send = await sendPhoneOtp({ phone, code });

    waitUntil(
      logAuditEvent({
        event: "otp.send",
        ip,
        metadata: { channel: "phone", provider: send.provider, ok: send.ok },
      }),
    );

    if (!send.ok) {
      return NextResponse.json({ error: "send_failed" }, { status: 502 });
    }

    return NextResponse.json({
      ok: true,
      expiresAt: expiresAt.toISOString(),
      // In dev with no MSG91, expose `devCode` to make local testing painless.
      // Production never has provider="console", so this is naturally gated.
      devCode: send.provider === "console" ? code : undefined,
    });
  } catch (err) {
    logger.error("otp.phone.send.failed", { err: String(err) });
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

