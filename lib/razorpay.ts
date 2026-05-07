import "server-only";

import crypto from "node:crypto";
import Razorpay from "razorpay";

import { env, hasRazorpay } from "@/lib/env";
import { logger } from "@/lib/logger";

/**
 *  Razorpay server SDK — singleton, reused across requests.
 *
 *  Throws if instantiated without keys. Callers that should noop in dev
 *  should branch on `hasRazorpay` first.
 *
 *  At module load (only in production with hasRazorpay=true) we sanity-check
 *  that RAZORPAY_KEY_ID matches NEXT_PUBLIC_RAZORPAY_KEY_ID. A mismatch is
 *  the most common cause of "Payment gateway error" with no useful client
 *  log — the popup opens with the public key but signature verify fails on
 *  the server. Surfacing the mismatch loudly at boot saves debug pain.
 */

if (
  hasRazorpay &&
  env.NEXT_PUBLIC_RAZORPAY_KEY_ID &&
  env.RAZORPAY_KEY_ID !== env.NEXT_PUBLIC_RAZORPAY_KEY_ID
) {
  logger.error("razorpay.key_mismatch", {
    msg:
      "RAZORPAY_KEY_ID and NEXT_PUBLIC_RAZORPAY_KEY_ID differ — checkout will fail signature verify. Sync them and redeploy.",
    serverEndsWith: env.RAZORPAY_KEY_ID!.slice(-4),
    clientEndsWith: env.NEXT_PUBLIC_RAZORPAY_KEY_ID.slice(-4),
  });
}

let cached: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (!hasRazorpay) {
    throw new Error(
      "Razorpay is not configured. Set RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET.",
    );
  }
  if (!cached) {
    cached = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID!,
      key_secret: env.RAZORPAY_KEY_SECRET!,
    });
  }
  return cached;
}

/* ============================================================================
 *  Order creation — for one-time payments and the first charge of a
 *  subscription. The client opens Razorpay Checkout with the returned id.
 * ============================================================================
 */

export type CreateOrderArgs = {
  amountPaise: number;
  currency?: "INR";
  receipt?: string;
  notes?: Record<string, string>;
};

export async function createOrder(args: CreateOrderArgs) {
  const rzp = getRazorpay();
  const order = await rzp.orders.create({
    amount: args.amountPaise,
    currency: args.currency ?? "INR",
    receipt: args.receipt,
    notes: args.notes,
    payment_capture: true,
  });
  logger.info("razorpay.order.created", {
    orderId: order.id,
    amount: order.amount,
    receipt: order.receipt,
  });
  return order;
}

/* ============================================================================
 *  Signature verification — every payment + every webhook is HMAC-signed
 *  with our key_secret. This is the ONLY reliable way to know a payment
 *  succeeded; trusting the client-side success callback alone is unsafe.
 * ============================================================================
 */

/**
 *  Checkout success payload signature:
 *    `${order_id}|${payment_id}` HMAC-SHA256 with key_secret
 */
export function verifyCheckoutSignature(args: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (!hasRazorpay) return false;
  const expected = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET!)
    .update(`${args.orderId}|${args.paymentId}`)
    .digest("hex");
  return safeEqual(expected, args.signature);
}

/**
 *  Webhook signature: HMAC-SHA256 of the *raw request body* with the
 *  webhook secret (separate from key_secret). Set this in the Razorpay
 *  Dashboard → Webhooks → Add webhook → Secret.
 */
export function verifyWebhookSignature(args: {
  rawBody: string;
  signature: string;
}): boolean {
  if (!env.RAZORPAY_WEBHOOK_SECRET) return false;
  const expected = crypto
    .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
    .update(args.rawBody)
    .digest("hex");
  return safeEqual(expected, args.signature);
}

/** Constant-time string compare — prevents timing leaks on signature checks. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
