import "server-only";

import bcrypt from "bcryptjs";
import { and, eq, gt, isNull, lt } from "drizzle-orm";

import { db } from "@/lib/db";
import { otpCodes } from "@/lib/db/schema";
import { otpVerifyLimiter } from "@/lib/ratelimit";

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;

/** Cryptographically-random 6-digit numeric OTP. */
export function generateOtp(): string {
  // 6-digit zero-padded — 1,000,000 distinct values.
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  const n = buf[0]! % 1_000_000;
  return n.toString().padStart(OTP_LENGTH, "0");
}

/**
 * Persist a freshly-generated OTP. Returns the *plaintext* code so the caller
 * can hand it to MSG91 / Resend. Only the bcrypt hash hits the database.
 */
export async function issueOtp(args: {
  identifier: string;
  channel: "phone" | "email";
  ip?: string;
}): Promise<{ code: string; expiresAt: Date }> {
  const code = generateOtp();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000);

  await db.insert(otpCodes).values({
    identifier: args.identifier,
    channel: args.channel,
    codeHash,
    expiresAt,
    ip: args.ip ?? null,
  });

  return { code, expiresAt };
}

/**
 * Verify and consume an OTP. Returns true on success.
 *
 * Behavior:
 *   - distributed rate limit: caps verify attempts per identifier across
 *     OTP rotations (prevents "request fresh OTP every hour, brute force 5,
 *     repeat" attacks)
 *   - matches the *most recent* unconsumed, unexpired OTP for this identifier
 *   - increments `attempts` only on a wrong-code branch, so successful
 *     verifies don't waste the budget
 *   - on success, marks `consumedAt` so the same code can't be reused
 */
export async function consumeOtp(args: {
  identifier: string;
  channel: "phone" | "email";
  code: string;
}): Promise<boolean> {
  // Distributed rate limit BEFORE any DB / bcrypt work — protects from
  // a hot identifier soaking through fresh OTP rotations. 10/15min.
  const rlKey = `${args.channel}:${args.identifier}`;
  const rl = await otpVerifyLimiter.limit(rlKey);
  if (!rl.success) return false;

  const now = new Date();

  // Pick the freshest live OTP row.
  const candidate = await db.query.otpCodes.findFirst({
    where: and(
      eq(otpCodes.identifier, args.identifier),
      eq(otpCodes.channel, args.channel),
      gt(otpCodes.expiresAt, now),
      isNull(otpCodes.consumedAt),
    ),
    orderBy: (t, { desc }) => [desc(t.createdAt)],
  });

  if (!candidate) return false;

  if (candidate.attempts >= MAX_ATTEMPTS) {
    return false;
  }

  const ok = await bcrypt.compare(args.code, candidate.codeHash);

  if (!ok) {
    // Wrong code — burn one attempt on this row.
    await db
      .update(otpCodes)
      .set({ attempts: candidate.attempts + 1 })
      .where(eq(otpCodes.id, candidate.id));
    return false;
  }

  // Right code — mark consumed, don't burn an attempt.
  await db
    .update(otpCodes)
    .set({ consumedAt: new Date() })
    .where(eq(otpCodes.id, candidate.id));

  return true;
}

/** Housekeeping — call from a cron / Inngest scheduled function. */
export async function purgeExpiredOtps(): Promise<number> {
  const cutoff = new Date(Date.now() - 24 * 3600_000);
  const res = await db
    .delete(otpCodes)
    .where(lt(otpCodes.expiresAt, cutoff))
    .returning({ id: otpCodes.id });
  return res.length;
}
