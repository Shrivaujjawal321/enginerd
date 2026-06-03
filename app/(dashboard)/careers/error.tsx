"use client";

import * as React from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Localized error boundary for the /careers route.
 *
 * Without this, a render fault inside <JobAgent /> bubbles up to the root
 * `app/error.tsx`, which replaces the entire dashboard shell (sidebar, topbar,
 * footer, mobile tabs) with a full-page "Something went wrong." surface. That
 * looks like the whole app crashed and was the headline regression flagged by
 * 13 reviewers in QA cycle 3.
 *
 * Catching here keeps the dashboard chrome intact and shows an inline,
 * dismissible banner so users can retry the careers feature in isolation
 * without losing navigation context.
 */
export default function CareersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("[careers/error]", error.digest, error.message);
  }, [error]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
          Careers
        </h1>
        <p className="mt-2 text-base text-slate-300">
          Upload your resume — the agent fetches live openings from public job
          boards and ranks them against your background using your own LLM key.
        </p>
      </header>

      <div
        role="alert"
        className="flex flex-col gap-4 rounded-2xl border border-rose-500/30 bg-rose-500/[0.05] p-6 sm:flex-row sm:items-start sm:gap-5"
      >
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-rose-100">
            Couldn&apos;t load the job search agent.
          </p>
          <p className="mt-1 text-sm text-slate-300">
            Something went wrong while rendering this page. Your session is
            still active — the rest of EngiNerd is unaffected. Try again, or
            head to another section while we look into it.
          </p>
          {error.digest ? (
            <p className="mt-3 inline-block rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 font-mono text-[11px] text-slate-400">
              ref: {error.digest}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => reset()}>
              <RotateCw className="h-4 w-4" />
              Try again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
