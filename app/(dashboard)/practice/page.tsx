import Link from "next/link";
import { LogIn } from "lucide-react";

import { auth } from "@/auth";
import { listProblems, getUserProblemStatuses } from "@/lib/problems-store";
import { PracticeExplorer } from "@/components/dashboard/practice-explorer";

export const metadata = { title: "DSA Practice" };
// 5-min ISR — problem catalog rarely changes; per-user status overlaid below.
export const revalidate = 300;

export default async function PracticePage() {
  const [problems, session] = await Promise.all([listProblems(), auth()]);

  const statuses = session?.user?.id
    ? await getUserProblemStatuses(session.user.id)
    : {};

  // Overlay per-user submission status on top of the cached catalog.
  const enriched = problems.map((p) => ({
    ...p,
    status: statuses[p.slug] ?? "unsolved",
  }));

  const solved = enriched.filter((p) => p.status === "solved").length;
  const attempted = enriched.filter((p) => p.status === "attempted").length;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
            DSA Practice
          </h1>
          <p className="mt-2 text-base text-slate-400">
            Original problems — MNC-tagged, hints in Hinglish, solutions you
            can run right here.
          </p>
        </div>
        {session?.user?.id ? (
          <div className="flex items-center gap-3 text-sm">
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-emerald-200">
              {solved} solved
            </span>
            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-amber-200">
              {attempted} attempted
            </span>
            <span className="text-slate-400">of {enriched.length}</span>
          </div>
        ) : null}
      </header>

      {/* Unauthed sign-in nudge — visible only on the public /practice
          listing for visitors without a session. The catalog itself stays
          fully browsable; this is a soft prompt, not a wall. */}
      {!session?.user?.id ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-400/20 bg-violet-500/[0.06] px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-violet-500/15 text-violet-200">
              <LogIn className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-100">
                Sign in to track which problems you&apos;ve solved.
              </p>
              <p className="text-xs text-slate-400">
                Streak, leaderboard, an in-browser code runner — all free.
              </p>
            </div>
          </div>
          <Link
            href="/login?callbackUrl=%2Fpractice"
            className="inline-flex items-center gap-1.5 rounded-lg gradient-primary px-3 py-2 text-xs font-semibold text-white shadow-md shadow-violet-500/30 transition-transform hover:-translate-y-0.5"
          >
            Sign in
          </Link>
        </div>
      ) : null}

      <PracticeExplorer problems={enriched} />
    </div>
  );
}
