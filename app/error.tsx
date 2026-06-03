"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Per-segment error boundary — caught by Next.js when any child server or
 * client component throws. Sentry's `@sentry/nextjs` integration auto-captures
 * via `captureUnderscoreErrorException` once we wire it up; for now this is
 * the stable "something broke" surface.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Surface the digest so on-call can correlate with server logs.
    console.error("[error-boundary]", error.digest, error.message);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-rose-300">
          Something broke
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-50">
          Something went wrong.
        </h1>
        <p className="mt-3 text-sm text-slate-300">
          We&apos;ve been notified. Try reloading — if it still doesn&apos;t
          load, head back home.
        </p>
        {error.digest ? (
          <p className="mt-4 inline-block rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 font-mono text-[11px] text-slate-300">
            ref: {error.digest}
          </p>
        ) : null}
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button onClick={() => reset()}>
            <RotateCw className="h-4 w-4" />
            Try again
          </Button>
          <Link href="/home">
            <Button variant="glass">
              <ArrowLeft className="h-4 w-4" />
              Go home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
