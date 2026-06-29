"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ============================================================================
 *  Razorpay Checkout button.
 *
 *  Flow:
 *    1. If unauthed → redirect to /login?callbackUrl=/billing&plan=<plan>
 *    2. If authed:
 *       a. POST /api/checkout/create-order   → server creates RZP Order
 *       b. Lazy-load https://checkout.razorpay.com/v1/checkout.js
 *       c. Open Razorpay popup with returned `keyId` + `orderId`
 *       d. On success callback → POST /api/checkout/verify (server validates
 *          HMAC signature, activates subscription)
 *       e. Redirect to /billing on activation.
 *
 *  No card data ever touches our servers. The popup is fully Razorpay-hosted.
 * ============================================================================
 */

const RZP_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

type RazorpayInstance = {
  open(): void;
  on(event: "payment.failed", cb: (resp: RazorpayFailure) => void): void;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpaySuccess) => void;
  modal?: { ondismiss: () => void };
};

type RazorpaySuccess = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayFailure = {
  error: {
    code?: string;
    description?: string;
    source?: string;
    step?: string;
    reason?: string;
  };
};

async function loadRazorpayScript(): Promise<boolean> {
  if (window.Razorpay) return true;
  return new Promise((resolve) => {
    const existing = document.querySelector(
      `script[src="${RZP_SCRIPT_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }
    const s = document.createElement("script");
    s.src = RZP_SCRIPT_SRC;
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

type Props = {
  plan: "pro" | "career";
  planName: string;
  className?: string;
  variant?: "primary" | "glass";
  children: React.ReactNode;
};

export function UpgradeButton({
  plan,
  planName,
  className,
  variant = "primary",
  children,
}: Props) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [pending, setPending] = React.useState(false);

  const onClick = async () => {
    if (status !== "authenticated") {
      const callback = `/billing?plan=${plan}`;
      router.push(`/login?callbackUrl=${encodeURIComponent(callback)}`);
      return;
    }

    setPending(true);
    try {
      // 1. Create order on server.
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      if (res.status === 503) {
        const data = await res.json().catch(() => null);
        toast.error("Payments temporarily unavailable.", {
          description:
            data?.message ?? "Please try again later or contact support.",
        });
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error("Couldn't create order.", {
          description: data?.message ?? "Please try again.",
        });
        return;
      }
      const order = (await res.json()) as {
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
        plan: string;
        planName: string;
      };

      // 2. Load Razorpay Checkout script.
      const ok = await loadRazorpayScript();
      if (!ok || !window.Razorpay) {
        toast.error("Razorpay failed to load. Check your connection.");
        return;
      }

      // 3. Open the popup. Track outcome so the dismiss handler knows
      //    whether to show a "you closed without paying" nudge.
      let outcome: "success" | "failed" | null = null;

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "EngiNerd",
        description: `Upgrade to ${order.planName}`,
        order_id: order.orderId,
        prefill: {
          name: session?.user?.name ?? undefined,
          email: session?.user?.email ?? undefined,
          contact: session?.user?.phone ?? undefined,
        },
        theme: { color: "#8b5cf6" },
        handler: async (resp) => {
          outcome = "success";
          // 4. Verify signature on the server.
          try {
            const verifyRes = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(resp),
            });
            if (verifyRes.ok) {
              toast.success(`Welcome to ${order.planName}! 🚀`);
              router.push("/billing");
            } else {
              const data = await verifyRes.json().catch(() => null);
              toast.error(
                "Payment received but verification failed. Please contact support.",
                {
                  description: data?.error ?? "",
                  action: {
                    label: "Email support",
                    onClick: () =>
                      window.open(
                        `mailto:support@enginerd.in?subject=Payment%20${encodeURIComponent(
                          order.orderId,
                        )}`,
                        "_blank",
                      ),
                  },
                },
              );
            }
          } catch {
            toast.error("Verification request failed. Please log in again.");
          }
        },
        modal: {
          ondismiss: () => {
            // If neither success nor failure fired, the user closed the
            // popup themselves. Soft nudge so they know how to come back.
            if (outcome === null) {
              toast.message("Checkout closed.", {
                description:
                  "Your order is still pending — no money was charged.",
              });
            }
          },
        },
      });

      // Surface bank declines / UPI fails — without this the user thinks
      // money may have been debited when it wasn't.
      rzp.on("payment.failed", (resp) => {
        outcome = "failed";
        toast.error("Payment failed.", {
          description:
            resp.error?.description ??
            "Your bank declined the payment. Try another method.",
          action: { label: "Try again", onClick: () => void onClick() },
        });
      });

      rzp.open();
    } catch (err) {
      toast.error("Something went wrong.", {
        description:
          err instanceof Error
            ? err.message.slice(0, 80)
            : "Please try again.",
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      onClick={onClick}
      disabled={pending}
      className={cn("w-full", className)}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {pending ? "Opening checkout…" : children}
    </Button>
  );
}
