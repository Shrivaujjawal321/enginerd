"use client";

import * as React from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

const ANON_KEY = "enginerd:anonymous-id";

function getOrCreateAnonId(): string {
  if (typeof window === "undefined") return "ssr";
  let id = window.localStorage.getItem(ANON_KEY);
  if (!id) {
    id = `anon-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
    window.localStorage.setItem(ANON_KEY, id);
  }
  return id;
}

type Props = {
  subjectSlug: string;
};

/**
 * Per-subject "Was this helpful?" thumbs widget.
 *
 * - Anonymous-friendly: works without login via a localStorage anonymous id.
 * - Optimistic UI: clicking thumbs flips state immediately, posts to the API
 *   in the background. Failures roll back and surface a toast.
 * - Idempotent: clicking the same thumb again no-ops; clicking the opposite
 *   updates the existing row server-side.
 */
export function FeedbackWidget({ subjectSlug }: Props) {
  const [vote, setVote] = React.useState<"up" | "down" | null>(null);
  const [pending, setPending] = React.useState(false);

  const submit = async (rating: "up" | "down") => {
    if (vote === rating || pending) return;
    const previous = vote;
    setVote(rating);
    setPending(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectSlug,
          rating,
          anonymousId: getOrCreateAnonId(),
        }),
      });
      if (!res.ok) {
        setVote(previous);
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        if (data?.error === "no_database") {
          toast.error("Couldn't save feedback — database is offline.");
        } else {
          toast.error("Couldn't save your vote. Please try again.");
        }
        return;
      }
      toast.success(
        rating === "up" ? "Thanks — keep going! 🙌" : "Got it — we'll improve this.",
      );
    } catch {
      setVote(previous);
      toast.error("Network error.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="my-12 flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4">
      <div>
        <p className="text-sm font-medium text-slate-100">
          Was this subject helpful?
        </p>
        <p className="text-xs text-slate-400">
          Anonymous vote — one click. Comment is optional and off by default.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Yes, helpful"
          onClick={() => void submit("up")}
          className={cn(
            "inline-flex h-10 items-center gap-1.5 rounded-lg border px-3 text-sm transition-colors",
            vote === "up"
              ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
              : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:bg-white/[0.05] hover:text-white",
          )}
        >
          <ThumbsUp className="h-4 w-4" />
          Helpful
        </button>
        <button
          type="button"
          aria-label="No, not helpful"
          onClick={() => void submit("down")}
          className={cn(
            "inline-flex h-10 items-center gap-1.5 rounded-lg border px-3 text-sm transition-colors",
            vote === "down"
              ? "border-rose-400/30 bg-rose-500/10 text-rose-200"
              : "border-white/[0.06] bg-white/[0.02] text-slate-400 hover:bg-white/[0.05] hover:text-white",
          )}
        >
          <ThumbsDown className="h-4 w-4" />
          Improve
        </button>
      </div>
    </div>
  );
}
