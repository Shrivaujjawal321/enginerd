"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* ============================================================================
 *  HandlePicker — sets the user's public profile slug.
 *  Displayed inside the dashboard /profile page.
 * ============================================================================
 */

type Props = {
  initialHandle: string | null;
};

export function HandlePicker({ initialHandle }: Props) {
  const router = useRouter();
  const [handle, setHandle] = React.useState(initialHandle ?? "");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const isSetMode = initialHandle !== null;

  const profileUrl =
    isSetMode && initialHandle
      ? `${typeof window === "undefined" ? "" : window.location.origin}/u/${initialHandle}`
      : null;

  const onSave = async () => {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/profile/handle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string; handle?: string }
        | null;
      if (!res.ok || !data?.ok) {
        const msg =
          data?.error === "taken"
            ? "That handle is already taken."
            : data?.error === "reserved"
              ? "That handle is reserved."
              : data?.error === "invalid"
                ? "Use 3–24 chars: letters, numbers, _ or -."
                : "Couldn't save handle. Please try again.";
        setError(msg);
        return;
      }
      toast.success("Handle saved.", {
        description: `Your profile lives at /u/${data.handle}`,
      });
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setPending(false);
    }
  };

  const onCopy = async () => {
    if (!profileUrl) return;
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-slate-100">Public profile</p>
        <p className="text-xs text-slate-400">
          Pick a handle and share your stats on LinkedIn or X. Letters, numbers,
          _, and -. 3–24 chars.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
            /u/
          </span>
          <Input
            value={handle}
            onChange={(e) =>
              setHandle(
                e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9_-]/g, "")
                  .slice(0, 24),
              )
            }
            placeholder="your-handle"
            className="!pl-10"
            invalid={!!error}
          />
        </div>
        <Button
          onClick={onSave}
          disabled={pending || handle.length < 3 || handle === initialHandle}
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : isSetMode ? (
            "Update"
          ) : (
            "Claim"
          )}
        </Button>
      </div>

      {error ? <p className="text-xs text-rose-300">{error}</p> : null}

      {profileUrl ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs">
          <span className="truncate font-mono text-slate-400">
            {profileUrl}
          </span>
          <button
            type="button"
            onClick={onCopy}
            className="ml-auto inline-flex items-center gap-1 text-slate-300 hover:text-white"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-300" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </button>
          <a
            href={`/u/${initialHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-violet-300 hover:text-violet-200"
          >
            View
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      ) : null}
    </div>
  );
}
