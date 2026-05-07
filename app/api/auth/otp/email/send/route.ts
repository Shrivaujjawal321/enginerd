import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";

import { sendEmailOtpSchema } from "@/lib/validators/otp";
import { issueOtp } from "@/lib/otp/store";
import { sendEmailOtp } from "@/lib/otp/email";
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

  const parsed = sendEmailOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { email } = parsed.data;
  const ip = getClientIp(req);

  // Two layers: per-identifier (3/h) AND per-IP (5/h). Without the IP layer
  // an attacker who iterates through email addresses reaps fresh per-email
  // budgets at our SMS/email cost.
  const [byEmail, byIp] = await Promise.all([
    otpSendLimiter.limit(email),
    otpSendByIpLimiter.limit(`email:${ip}`),
  ]);
  if (!byEmail.success || !byIp.success) {
    return tooManyRequests(Math.max(byEmail.reset, byIp.reset));
  }

  try {
    const { code, expiresAt } = await issueOtp({
      identifier: email,
      channel: "email",
      ip,
    });
    const send = await sendEmailOtp({ email, code });

    waitUntil(
      logAuditEvent({
        event: "otp.send",
        ip,
        metadata: { channel: "email", provider: send.provider, ok: send.ok },
      }),
    );

    if (!send.ok) {
      return NextResponse.json({ error: "send_failed" }, { status: 502 });
    }

    return NextResponse.json({
      ok: true,
      expiresAt: expiresAt.toISOString(),
      devCode: send.provider === "console" ? code : undefined,
    });
  } catch (err) {
    logger.error("otp.email.send.failed", { err: String(err) });
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

