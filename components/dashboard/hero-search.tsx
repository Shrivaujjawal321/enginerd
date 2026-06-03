"use client";

import * as React from "react";
import { ArrowRight, Search } from "lucide-react";

import { SearchPalette } from "@/components/dashboard/search-palette";
import { cn } from "@/lib/utils";

/**
 *  HeroSearch — full-width "Search anything" input pinned to the top of
 *  /home. Tapping it opens the same SearchPalette modal that the topbar
 *  uses (cmd+K). Acts as the dashboard's primary discovery affordance —
 *  the rest of the page is recall-driven (continue last subject, recent
 *  views, streak), this is the search-driven side.
 */
export function HeroSearch({ placeholder }: { placeholder?: string }) {
  const [open, setOpen] = React.useState(false);
  // Default to Ctrl on SSR / non-Mac so the chip never lies before hydration.
  const [isMac, setIsMac] = React.useState(false);
  React.useEffect(() => {
    if (typeof navigator === "undefined") return;
    setIsMac(navigator.platform.toLowerCase().startsWith("mac"));
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open search"
        className={cn(
          "group flex w-full items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-left transition-colors hover:border-white/[0.16] hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f] sm:px-5 sm:py-4",
        )}
      >
        <span
          aria-hidden
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500/30 to-cyan-500/20 text-violet-200"
        >
          <Search className="h-4 w-4" />
        </span>
        <span className="flex flex-1 flex-col text-left">
          <span className="text-sm font-medium text-slate-100 sm:text-base">
            {placeholder ?? "Search subjects, roadmaps, or problems"}
          </span>
          <span className="hidden text-xs text-slate-400 sm:block">
            Type a topic or paste a job spec — we&apos;ll match it to a subject.
          </span>
        </span>
        <kbd className="hidden rounded-md border border-white/[0.08] bg-white/[0.04] px-1.5 py-1 font-mono text-[11px] text-slate-300 sm:inline">
          {isMac ? "⌘K" : "Ctrl K"}
        </kbd>
        <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-100" />
      </button>
      <SearchPalette open={open} onOpenChange={setOpen} />
    </>
  );
}
