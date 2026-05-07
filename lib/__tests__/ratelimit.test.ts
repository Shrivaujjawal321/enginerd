import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { tooManyRequests, getClientIp } from "@/lib/ratelimit";

describe("tooManyRequests", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-04T10:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns a 429 with Retry-After in seconds rounded up", async () => {
    // 30 seconds in the future = Retry-After: 30
    const reset = Date.now() + 30_000;
    const res = tooManyRequests(reset);
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("30");
    const body = (await res.json()) as { error: string; reset: number };
    expect(body).toEqual({ error: "rate_limited", reset });
  });

  it("rounds 1500ms up to 2 (never zero)", () => {
    const reset = Date.now() + 1500;
    const res = tooManyRequests(reset);
    expect(res.headers.get("Retry-After")).toBe("2");
  });

  it("clamps Retry-After to >= 1 even when reset is in the past", () => {
    const reset = Date.now() - 5000;
    const res = tooManyRequests(reset);
    expect(res.headers.get("Retry-After")).toBe("1");
  });

  it("supports overriding the body error code", async () => {
    const res = tooManyRequests(Date.now() + 10_000, "otp_quota_exceeded");
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("otp_quota_exceeded");
  });
});

describe("getClientIp", () => {
  const make = (headers: Record<string, string>): Request =>
    new Request("https://example.test/api", { headers });

  it("prefers x-vercel-forwarded-for when present", () => {
    const ip = getClientIp(
      make({
        "x-vercel-forwarded-for": "203.0.113.10",
        "x-forwarded-for": "10.0.0.1",
      }),
    );
    expect(ip).toBe("203.0.113.10");
  });

  it("returns the FIRST entry of x-vercel-forwarded-for when comma-separated", () => {
    const ip = getClientIp(
      make({
        "x-vercel-forwarded-for": "203.0.113.10, 10.0.0.1",
      }),
    );
    expect(ip).toBe("203.0.113.10");
  });

  it("returns the LAST hop of x-forwarded-for as a fallback", () => {
    // A spoofed XFF prefix can't beat the load-balancer-appended trailing
    // entry; this test locks the trust-the-tail behaviour.
    const ip = getClientIp(
      make({
        "x-forwarded-for": "1.2.3.4, 5.6.7.8, 198.51.100.7",
      }),
    );
    expect(ip).toBe("198.51.100.7");
  });

  it("uses x-real-ip when only that header is set", () => {
    const ip = getClientIp(make({ "x-real-ip": "192.0.2.5" }));
    expect(ip).toBe("192.0.2.5");
  });

  it("returns 'unknown' when no IP headers are present", () => {
    const ip = getClientIp(make({}));
    expect(ip).toBe("unknown");
  });
});
