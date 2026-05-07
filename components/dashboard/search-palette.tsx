"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Code2, Map, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Result = {
  kind: "subject" | "roadmap" | "problem";
  slug: string;
  title: string;
  subtitle: string;
  href: string;
  haystack: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

let cachedIndex: Result[] | null = null;
let inflight: Promise<Result[]> | null = null;

/**
 * Lazy-fetch the search index from /api/search-index. Cached process-wide
 * after first call so subsequent palette opens are instant.
 *
 * Replaces the previous static import of `lib/mock-data/problems.ts`,
 * which only had 30 legacy problems — the live DB has 459.
 */
async function loadIndex(): Promise<Result[]> {
  if (cachedIndex) return cachedIndex;
  if (inflight) return inflight;
  inflight = fetch("/api/search-index", { cache: "force-cache" })
    .then(async (res) => {
      if (!res.ok) return [];
      const data = (await res.json()) as { items: Result[] };
      cachedIndex = data.items;
      return cachedIndex;
    })
    .catch(() => [])
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function SearchPalette({ open, onOpenChange }: Props) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [index, setIndex] = React.useState<Result[] | null>(cachedIndex);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  // Fetch the index on first open. Subsequent opens use the cached array.
  React.useEffect(() => {
    if (!open || index) return;
    let cancelled = false;
    void loadIndex().then((items) => {
      if (!cancelled) setIndex(items);
    });
    return () => {
      cancelled = true;
    };
  }, [open, index]);

  const results = React.useMemo(() => {
    if (!index) return [];
    const q = query.trim().toLowerCase();
    if (!q) {
      // Empty query — show roadmaps as the curated default
      return index.filter((r) => r.kind === "roadmap").slice(0, 8);
    }
    const tokens = q.split(/\s+/).filter(Boolean);
    return index
      .filter((r) => tokens.every((t) => r.haystack.includes(t)))
      .slice(0, 20);
  }, [query, index]);

  React.useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      // Defer focus until after the modal mounts
      const id = window.setTimeout(() => inputRef.current?.focus(), 50);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  React.useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(results.length - 1, i + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const target = results[activeIndex];
        if (target) {
          onOpenChange(false);
          router.push(target.href);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, results, activeIndex, router, onOpenChange]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[200] flex items-start justify-center px-4 pt-[15vh]"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d12]/95 shadow-2xl shadow-black/40 backdrop-blur-2xl">
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search roadmaps, subjects, problems…"
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="button"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="rounded-md p-1 text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-400">
              No results. Try a different keyword — &ldquo;React&rdquo;,
              &ldquo;Kafka&rdquo;, &ldquo;LoRA&rdquo;, or &ldquo;Spring
              Boot&rdquo;.
            </div>
          ) : (
            <ul className="space-y-1">
              {!query.trim() ? (
                <li className="px-3 pb-1 pt-2 text-[10px] uppercase tracking-wider text-slate-400">
                  Browse roadmaps
                </li>
              ) : null}
              {results.map((r, i) => {
                const Icon =
                  r.kind === "roadmap"
                    ? Map
                    : r.kind === "subject"
                      ? BookOpen
                      : Code2;
                const isActive = i === activeIndex;
                return (
                  <li key={`${r.kind}-${r.slug}`}>
                    <Link
                      href={r.href}
                      onClick={() => onOpenChange(false)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                        isActive
                          ? "bg-white/[0.07] text-white"
                          : "text-slate-300 hover:bg-white/[0.04]",
                      )}
                    >
                      <span
                        className={cn(
                          "grid h-8 w-8 shrink-0 place-items-center rounded-lg border",
                          r.kind === "roadmap"
                            ? "border-violet-500/30 bg-violet-500/10 text-violet-300"
                            : r.kind === "subject"
                              ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
                              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-100">
                          {r.title}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          {r.subtitle}
                        </p>
                      </div>
                      <span className="rounded-md border border-white/[0.06] bg-white/[0.02] px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-slate-400">
                        {r.kind}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-white/[0.06] bg-white/[0.02] px-4 py-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="rounded border border-white/[0.08] bg-white/[0.04] px-1 py-0.5 font-mono">
                ↑↓
              </kbd>{" "}
              navigate
            </span>
            <span>
              <kbd className="rounded border border-white/[0.08] bg-white/[0.04] px-1 py-0.5 font-mono">
                ↵
              </kbd>{" "}
              open
            </span>
            <span>
              <kbd className="rounded border border-white/[0.08] bg-white/[0.04] px-1 py-0.5 font-mono">
                esc
              </kbd>{" "}
              close
            </span>
          </div>
          <span>
            {results.length} result{results.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </div>
  );
}
