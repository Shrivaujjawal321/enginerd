import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import crypto from "node:crypto";

const KEY_SECRET = "rzp_test_key_secret_123456";
const WEBHOOK_SECRET = "rzp_webhook_secret_abcdef";

const ORIGINAL_ENV = { ...process.env };

/* ============================================================================
 *  Razorpay HMAC verification — the only check between a forged "I paid"
 *  callback and a real one. Failures here = free upgrades. Critical to test.
 * ============================================================================
 */

describe("verifyCheckoutSignature", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.RAZORPAY_KEY_ID = "rzp_test_id";
    process.env.RAZORPAY_KEY_SECRET = KEY_SECRET;
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.resetModules();
  });

  it("accepts a correctly-signed checkout response", async () => {
    const { verifyCheckoutSignature } = await import("@/lib/razorpay");
    const orderId = "order_ABC123";
    const paymentId = "pay_XYZ789";
    const signature = crypto
      .createHmac("sha256", KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    expect(
      verifyCheckoutSignature({ orderId, paymentId, signature }),
    ).toBe(true);
  });

  it("rejects a tampered payment id with a stale signature", async () => {
    const { verifyCheckoutSignature } = await import("@/lib/razorpay");
    const orderId = "order_ABC123";
    const realPaymentId = "pay_XYZ789";
    const sig = crypto
      .createHmac("sha256", KEY_SECRET)
      .update(`${orderId}|${realPaymentId}`)
      .digest("hex");

    // Attacker replays the same `sig` but swaps in a different payment id.
    expect(
      verifyCheckoutSignature({
        orderId,
        paymentId: "pay_TAMPERED",
        signature: sig,
      }),
    ).toBe(false);
  });

  it("rejects a signature signed with the wrong key_secret", async () => {
    const { verifyCheckoutSignature } = await import("@/lib/razorpay");
    const orderId = "order_ABC123";
    const paymentId = "pay_XYZ789";
    const wrongSig = crypto
      .createHmac("sha256", "rzp_attacker_guess_secret")
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    expect(
      verifyCheckoutSignature({
        orderId,
        paymentId,
        signature: wrongSig,
      }),
    ).toBe(false);
  });

  it("rejects an empty signature without crashing", async () => {
    const { verifyCheckoutSignature } = await import("@/lib/razorpay");
    expect(
      verifyCheckoutSignature({
        orderId: "order_X",
        paymentId: "pay_X",
        signature: "",
      }),
    ).toBe(false);
  });
});

describe("verifyWebhookSignature", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.RAZORPAY_WEBHOOK_SECRET = WEBHOOK_SECRET;
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.resetModules();
  });

  it("accepts a correctly-signed webhook body", async () => {
    const { verifyWebhookSignature } = await import("@/lib/razorpay");
    const rawBody = '{"event":"payment.captured","payload":{"foo":"bar"}}';
    const signature = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    expect(verifyWebhookSignature({ rawBody, signature })).toBe(true);
  });

  it("rejects when raw body is mutated by a single byte", async () => {
    const { verifyWebhookSignature } = await import("@/lib/razorpay");
    const rawBody = '{"event":"payment.captured"}';
    const sig = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    // Attacker tampers the body but keeps the original signature.
    const tamperedBody = '{"event":"payment.captured ","extra":"wow"}';
    expect(
      verifyWebhookSignature({ rawBody: tamperedBody, signature: sig }),
    ).toBe(false);
  });
});
