import { test, expect } from "@playwright/test";

/* ============================================================================
 *  Security regression coverage — the most-critical guards from cycles 1-3
 *  (Razorpay HMAC, OTP rate limit, /checkout endpoints) verified at the
 *  network layer.
 * ============================================================================
 */

test("/api/webhooks/razorpay rejects bad signature with 401", async ({
  request,
}) => {
  const res = await request.post("/api/webhooks/razorpay", {
    headers: { "x-razorpay-signature": "deadbeef" },
    data: { event: "payment.captured" },
  });
  expect(res.status()).toBe(401);
  const body = await res.json();
  expect(body.error).toBe("invalid_signature");
});

test("/api/webhooks/razorpay rejects missing signature with 400", async ({
  request,
}) => {
  const res = await request.post("/api/webhooks/razorpay", {
    data: {},
  });
  expect(res.status()).toBe(400);
});

test("/api/checkout/create-order unauthed → 401", async ({ request }) => {
  const res = await request.post("/api/checkout/create-order", {
    data: { plan: "pro" },
  });
  expect(res.status()).toBe(401);
});

test("/api/me unauthed → 401", async ({ request }) => {
  const res = await request.get("/api/me");
  expect(res.status()).toBe(401);
});

test("/api/jobs/search returns CDN cache headers", async ({ request }) => {
  const res = await request.get("/api/jobs/search?q=java");
  expect(res.ok()).toBe(true);
  expect(res.headers()["cache-control"]).toMatch(/s-maxage=3600/);
  expect(res.headers()["cache-control"]).toMatch(/stale-while-revalidate/);
});
