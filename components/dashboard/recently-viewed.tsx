import Link from "next/link";
import { ArrowUpRight, History } from "lucide-react";

import { GlassCard } from "@/components/shared/glass-card";
import { formatRelative } from "@/lib/format";

type Item = {
  slug: string;
  title: string;
  category: string;
  estHours: number;
  iconAccent: string;
  lastSeenAt: Date;
  progressPct: number;
  status: "not_started" | "in_progress" | "completed";
};

/**
 *  RecentlyViewed — last N subjects the learner touched, ordered by
 *  `user_progress.last_seen_at`. Drops them straight back into the subject
 *  page, format preserved if they were in slides / mindmap / flashcards
 *  (we don't capture per-format last view yet — cycle 23 candidate).
 *
 *  Rendered server-side. Caller is responsible for the DB query.
 */
export function RecentlyViewed({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return (
      <section>
        <header className="mb-3 flex items-center gap-2">
          <History className="h-4 w-4 text-slate-400" />
          <h2 className="text-base font-semibold text-slate-100">
            Recently viewed
          </h2>
        </header>
        <GlassCard className="p-6">
          <p className="text-sm text-slate-300">
            Nothing here yet. The subjects you open will land in this list so
            you can pick up exactly where you stopped.
          </p>
          <Link
            href="/subjects"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-violet-200 hover:text-violet-100"
          >
            Browse the catalog
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </GlassCard>
      </section>
    );
  }

  return (
    <section>
      <header className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-slate-400" />
          <h2 className="text-base font-semibold text-slate-100">
            Recently viewed
          </h2>
        </div>
        <Link
          href="/subjects"
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-300 hover:text-white"
        >
          All subjects
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </header>
      <GlassCard className="overflow-hidden p-0">
        <ul className="divide-y divide-white/[0.04]">
          {items.map((item) => (
            <li key={item.slug}>
              <Link
                href={`/subjects/${item.slug}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03]"
              >
                <span
                  aria-hidden
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${item.iconAccent} text-xs font-bold text-white`}
                >
                  {item.title.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-100">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-400">
                    {item.category} · {item.estHours}h ·{" "}
                    <span className="text-slate-300">
                      {item.status === "completed"
                        ? "Completed"
                        : item.status === "in_progress"
                          ? "In progress"
                          : "Just opened"}
                    </span>
                  </p>
                </div>
                <span className="hidden text-xs text-slate-400 sm:inline">
                  {formatRelative(item.lastSeenAt)} ago
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              </Link>
            </li>
          ))}
        </ul>
      </GlassCard>
    </section>
  );
}
