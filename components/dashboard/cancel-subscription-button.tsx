"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/**
 * Cancel-subscription confirmation dialog. Replaces window.confirm() — the
 * native browser confirm is unstyled, blocks the main thread, and on iOS
 * shows the page origin in the chrome which feels phishing-adjacent. This
 * is an inline modal: focus-trapped, Escape-to-close, backdrop-click-to-close,
 * and styled to match the dashboard surface.
 */
export function CancelSubscriptionButton() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const cancelRef = React.useRef<HTMLButtonElement | null>(null);
  const confirmRef = React.useRef<HTMLButtonElement | null>(null);

  // When the modal opens, move focus to the safe (Keep Pro) button so the
  // user has to deliberately move to the destructive action. Restore focus
  // to the trigger when it closes.
  React.useEffect(() => {
    if (open) {
      cancelRef.current?.focus();
    } else {
      triggerRef.current?.focus();
    }
  }, [open]);

  // Escape closes; Tab cycles focus between Keep / Confirm to stay trapped.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (!pending) setOpen(false);
        return;
      }
      if (e.key === "Tab") {
        e.preventDefault();
        const next =
          document.activeElement === cancelRef.current
            ? confirmRef.current
            : cancelRef.current;
        next?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, pending]);

  const onConfirm = async () => {
    setPending(true);
    try {
      const res = await fetch("/api/subscription/cancel", { method: "POST" });
      if (!res.ok) {
        toast.error("Couldn't cancel. Please try again.");
        return;
      }
      toast.success("Cancellation scheduled.", {
        description: "You'll keep Pro until the current period ends.",
      });
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Network error.");
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        variant="glass"
        onClick={() => setOpen(true)}
        className="!text-rose-300"
      >
        Cancel subscription
      </Button>
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-sub-title"
          aria-describedby="cancel-sub-desc"
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
        >
          {/* Backdrop — click closes when not pending. */}
          <button
            type="button"
            aria-label="Close dialog"
            onClick={() => {
              if (!pending) setOpen(false);
            }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <div className="glass relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 p-6 shadow-2xl">
            <h2
              id="cancel-sub-title"
              className="text-lg font-semibold text-slate-50"
            >
              Cancel your subscription?
            </h2>
            <p
              id="cancel-sub-desc"
              className="mt-2 text-sm leading-relaxed text-slate-400"
            >
              You&apos;ll keep Pro features until the end of the current
              billing period. After that your account drops to the free tier
              automatically. You can resubscribe any time.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                ref={cancelRef}
                type="button"
                variant="glass"
                onClick={() => setOpen(false)}
                disabled={pending}
              >
                Keep Pro
              </Button>
              <Button
                ref={confirmRef}
                type="button"
                onClick={() => void onConfirm()}
                disabled={pending}
                className="!bg-rose-500 hover:!bg-rose-400 hover:!shadow-rose-500/40"
              >
                {pending ? "Cancelling…" : "Confirm cancellation"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
