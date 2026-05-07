import "server-only";

import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { env, hasUpstash } from "@/lib/env";

/**
 * Distributed token-bucket rate limiter via Upstash Redis.
 *
 * In dev (no Upstash creds): in-memory limiter so flows still work locally
 * but every cold start resets the bucket. NEVER ship to prod without
 * Upstash configured.
 */

interface LimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

class MemoryRatelimit {
  private buckets = new Map<string, { count: number; resetAt: number }>();
  // Trip an opportunistic sweep of expired buckets every Nth call so the
  // Map can't grow unbounded under heavy traffic (an attacker iterating IPs
  // or a long-running dev server). Capped at 50k live entries as a hard fuse.
  private static readonly SWEEP_EVERY = 256;
  private static readonly HARD_CAP = 50_000;
  private callCount = 0;

  constructor(
    private readonly max: number,
    private readonly windowMs: number,
    private readonly prefix: string,
  ) {}

  private sweep(now: number): void {
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt < now) this.buckets.delete(key);
    }
    if (this.buckets.size > MemoryRatelimit.HARD_CAP) {
      // Should never happen after a sweep, but if it does drop the oldest
      // half (Map preserves insertion order).
      const drop = Math.floor(this.buckets.size / 2);
      let i = 0;
      for (const key of this.buckets.keys()) {
        if (i++ >= drop) break;
        this.buckets.delete(key);
      }
    }
  }

  async limit(identifier: string): Promise<LimitResult> {
    const key = `${this.prefix}:${identifier}`;
    const now = Date.now();
    if (++this.callCount % MemoryRatelimit.SWEEP_EVERY === 0) {
      this.sweep(now);
    }
    const bucket = this.buckets.get(key);
    if (!bucket || bucket.resetAt < now) {
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
      return {
        success: true,
        limit: this.max,
        remaining: this.max - 1,
        reset: now + this.windowMs,
      };
    }
    bucket.count += 1;
    const success = bucket.count <= this.max;
    return {
      success,
      limit: this.max,
      remaining: Math.max(0, this.max - bucket.count),
      reset: bucket.resetAt,
    };
  }
}

const redis = hasUpstash
  ? new Redis({
      url: env.UPSTASH_REDIS_REST_URL!,
      token: env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

/** OTP send: 3 per hour per identifier (phone or email). */
export const otpSendLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "1 h"),
      prefix: "rl:otp:send",
      analytics: true,
    })
  : new MemoryRatelimit(3, 60 * 60_000, "rl:otp:send");

/** OTP verify: 10 attempts per 15 min per identifier (locks brute force). */
export const otpVerifyLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "15 m"),
      prefix: "rl:otp:verify",
      analytics: true,
    })
  : new MemoryRatelimit(10, 15 * 60_000, "rl:otp:verify");

/** Generic per-user/per-IP API limiter (60/min). Default tier — read-heavy GETs. */
export const apiLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "1 m"),
      prefix: "rl:api",
      analytics: true,
    })
  : new MemoryRatelimit(60, 60_000, "rl:api");

/** Read-tier limiter (120/min) — light GETs (`/api/me`, listings) where the
 *  bottleneck is server cost, not abuse. Higher ceiling so a single user
 *  refreshing the dashboard doesn't trip a 429. */
export const apiReadLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(120, "1 m"),
      prefix: "rl:api:read",
      analytics: true,
    })
  : new MemoryRatelimit(120, 60_000, "rl:api:read");

/** Mutation-tier limiter (30/min) — POST/PATCH/DELETE that mutate user state
 *  (handle change, progress mark, submission). Tighter ceiling because each
 *  call costs DB writes; brute-force protection. */
export const apiMutationLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "1 m"),
      prefix: "rl:api:mutation",
      analytics: true,
    })
  : new MemoryRatelimit(30, 60_000, "rl:api:mutation");

/** Checkout-tier limiter (10/min) — Razorpay order creation + verify. Tight
 *  because each call hits Razorpay's API (rate-limited by Razorpay too) and
 *  a leaked endpoint becomes a payment-spam vector. */
export const apiCheckoutLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      prefix: "rl:api:checkout",
      analytics: true,
    })
  : new MemoryRatelimit(10, 60_000, "rl:api:checkout");

/** Per-IP layer for OTP send (5/h) — protects SMS cost when an attacker
 *  iterates through phone numbers (each new phone resets the per-identifier
 *  bucket but the per-IP one keeps counting). */
export const otpSendByIpLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      prefix: "rl:otp:send:ip",
      analytics: true,
    })
  : new MemoryRatelimit(5, 60 * 60_000, "rl:otp:send:ip");

/** Anonymous feedback / search (30/min/IP) — public endpoints with no userId. */
export const publicLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "1 m"),
      prefix: "rl:public",
      analytics: true,
    })
  : new MemoryRatelimit(30, 60_000, "rl:public");

/** LLM-cost limiter for resume / job-match endpoints (5/min/user). */
export const llmCostLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      prefix: "rl:llm",
      analytics: true,
    })
  : new MemoryRatelimit(5, 60_000, "rl:llm");

/** Standard 429 response with `Retry-After` (seconds) — every rate-limited
 *  route should funnel through here so HTTP clients learn when to retry
 *  instead of hammering. Pass the limiter's `reset` timestamp (ms since
 *  epoch). Optional `error` lets a route override the body code. */
export function tooManyRequests(
  reset: number,
  error: string = "rate_limited",
): NextResponse {
  const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
  return NextResponse.json(
    { error, reset },
    {
      status: 429,
      headers: { "Retry-After": retryAfter.toString() },
    },
  );
}

/**
 *  Best-effort client-IP extraction. On Vercel `x-vercel-forwarded-for` is
 *  signed by the edge and reliable. Otherwise we take the LAST hop in
 *  `x-forwarded-for` (closest to our edge) — clients can spoof XFF prefixes
 *  but not the trailing entry our load balancer adds.
 */
export function getClientIp(req: Request): string {
  const v = req.headers.get("x-vercel-forwarded-for");
  if (v) return v.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const parts = xff.split(",").map((s) => s.trim()).filter(Boolean);
    return parts[parts.length - 1] ?? "unknown";
  }
  return "unknown";
}
