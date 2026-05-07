"use client";

import * as React from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  subtopicSlug: string;
  initialStatus?: "not_started" | "in_progress" | "completed";
  className?: string;
};

/**
 * Minimal optimistic mark-complete control.
 *
 * Posts to /api/progress and flips local state immediately. On 401 we send
 * the user to /login with a callback. On 503 (no DATABASE_URL) we surface a
 * one-line toast — the API explains the missing config.
 */
export function MarkCompleteButton({
  subtopicSlug,
  initialStatus = "not_started",
  className,
}: Props) {
  const [status, setStatus] = React.useState(initialStatus);
  const [pending, setPending] = React.useState(false);

  const isDone = status === "completed";

  const onClick = async () => {
    setPending(true);
    const next = isDone ? "in_progress" : "completed";
    const previous = status;
    setStatus(next);

    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subtopicSlug, status: next }),
      });

      if (res.status === 401) {
        const here = window.location.pathname + window.location.search;
        window.location.href = `/login?callbackUrl=${encodeURIComponent(here)}`;
        return;
      }

      if (!res.ok) {
        setStatus(previous);
        const data = (await res.json().catch(() => null)) as
          | { error?: string; message?: string }
          | null;
        toast.error(
          data?.message ??
            (data?.error === "no_database"
              ? "Database is offline — progress won't be saved."
              : "Couldn't save. Please try again."),
        );
        return;
      }

      if (next === "completed") {
        // Read the entry — the server returns `streakMilestone` when the
        // new streak crosses 7 / 14 / 30 / 50 / 100 / 200 / 365.
        const data = (await res.json().catch(() => null)) as
          | { ok?: boolean; entry?: { streakMilestone?: number | null } }
          | null;
        const milestone = data?.entry?.streakMilestone ?? null;
        if (milestone) {
          // Indian-context celebration with a clear streak number — fire
          // separate from the regular "Complete" toast so it stands out.
          toast.success(`🔥 ${milestone}-day streak! Keep going.`, {
            description:
              milestone >= 100
                ? "Triple digits. Forward this to a friend who said you couldn't."
                : milestone >= 30
                  ? "A full month. The compounding is real."
                  : "You've crossed the consistency line — most learners stop before this.",
            duration: 6000,
          });
        } else {
          toast.success("Complete ✓ — streak counted.");
        }
      }
    } catch {
      setStatus(previous);
      toast.error("Network error. Check your connection.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Button
      type="button"
      variant={isDone ? "glass" : "primary"}
      onClick={onClick}
      disabled={pending}
      className={cn(
        "min-w-[180px]",
        isDone && "border-emerald-500/30 text-emerald-200",
        className,
      )}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Check className={cn("h-4 w-4", isDone && "text-emerald-300")} />
      )}
      {isDone ? "Completed — undo" : "Mark complete"}
    </Button>
  );
}
