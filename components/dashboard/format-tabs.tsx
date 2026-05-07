"use client";

/**
 * FormatTabs — the Read / Slides / Mindmap / Flashcards selector that sits
 * above subject content. Format state lives in the URL (`?format=slides`)
 * so the choice is shareable, backable, and survives a refresh.
 *
 * On click we fire a `format.selected` analytics event so we can watch which
 * formats users actually use over time. The tab itself uses next/link so the
 * page re-renders server-side with the new active format — no client-side
 * conditional rendering, no hydration mismatch risk.
 */

import * as React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { BookOpen, Layers, Network, Zap } from "lucide-react";

import { cn } from "@/lib/utils";

export type SubjectFormat = "read" | "slides" | "mindmap" | "flashcards";

const FORMATS: Array<{
  id: SubjectFormat;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "read", label: "Read", Icon: BookOpen },
  { id: "slides", label: "Slides", Icon: Layers },
  { id: "mindmap", label: "Mindmap", Icon: Network },
  { id: "flashcards", label: "Flashcards", Icon: Zap },
];

type Props = {
  active: SubjectFormat;
  subjectSlug: string;
};

export function FormatTabs({ active, subjectSlug }: Props) {
  const pathname = usePathname();
  const params = useSearchParams();

  // Build a fresh querystring for each tab — preserves any other params
  // already on the URL (e.g. `?ref=...` from a marketing campaign).
  const buildHref = (id: SubjectFormat) => {
    const next = new URLSearchParams(params?.toString() ?? "");
    if (id === "read") next.delete("format");
    else next.set("format", id);
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const reportSelection = (id: SubjectFormat) => {
    if (id === active) return;
    // Fire-and-forget — don't block the navigation. POST is intentional
    // (mutation/observation), even though the body is small.
    fetch("/api/analytics/format", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjectSlug, format: id }),
      keepalive: true,
    }).catch(() => {
      // Tracking is best-effort — never block UX on it.
    });
  };

  return (
    <div
      role="tablist"
      aria-label="Subject format"
      className="mb-8 flex flex-wrap gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1 sm:w-fit"
    >
      {FORMATS.map(({ id, label, Icon }) => {
        const selected = active === id;
        return (
          <Link
            key={id}
            href={buildHref(id)}
            role="tab"
            aria-selected={selected}
            scroll={false}
            onClick={() => reportSelection(id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
              selected
                ? "bg-white/[0.08] text-white"
                : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-100",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
