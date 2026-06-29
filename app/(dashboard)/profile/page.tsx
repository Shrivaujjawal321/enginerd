import { and, eq, sql } from "drizzle-orm";
import {
  BookOpen,
  Code2,
  Flame,
  Mail,
  Phone,
  ShieldCheck,
  Trophy,
} from "lucide-react";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { hasDatabase } from "@/lib/env";
import { users, submissions } from "@/lib/db/schema";
import { getUserStats } from "@/lib/progress";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/shared/glass-card";
import { HandlePicker } from "@/components/dashboard/handle-picker";

export const metadata = { title: "Profile" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    // Proxy already redirects, but defensive guard.
    return null;
  }

  const userId = session.user.id;

  // Fetch full row for verification timestamps + linked-account info.
  let row: typeof users.$inferSelect | null = null;
  if (hasDatabase) {
    try {
      row =
        (await db.query.users.findFirst({ where: eq(users.id, userId) })) ??
        null;
    } catch {
      // ignore — fall through to session data
    }
  }

  // Real DSA-solved count = distinct accepted submissions.
  let solvedCount = 0;
  if (hasDatabase) {
    try {
      const r = await db
        .select({
          c: sql<number>`count(distinct ${submissions.problemId})::int`,
        })
        .from(submissions)
        .where(
          and(
            eq(submissions.userId, userId),
            eq(submissions.status, "accepted"),
          ),
        );
      solvedCount = r[0]?.c ?? 0;
    } catch {
      // ignore
    }
  }

  const stats = await getUserStats(userId);

  const displayName =
    row?.name ??
    session.user.name ??
    (row?.email ?? session.user.email)?.split("@")[0] ??
    row?.phone ??
    session.user.phone ??
    "You";
  const initial = displayName.trim().charAt(0).toUpperCase();
  const email = row?.email ?? session.user.email;
  const phone = row?.phone ?? session.user.phone;
  const emailVerified = row?.emailVerified ?? null;
  const phoneVerified = row?.phoneVerified ?? null;

  const STAT_TILES = [
    {
      label: "Day streak",
      value: String(stats.currentStreak),
      icon: Flame,
      sub: stats.longestStreak > 0 ? `Best: ${stats.longestStreak}d` : null,
    },
    {
      label: "Subjects done",
      value: String(stats.subjectsCompleted),
      icon: BookOpen,
      sub:
        stats.subjectsInProgress > 0
          ? `${stats.subjectsInProgress} in progress`
          : null,
    },
    {
      label: "DSA solved",
      value: String(solvedCount),
      icon: Code2,
      sub: solvedCount === 0 ? "Solve your first problem" : null,
    },
    {
      label: "Best streak",
      value:
        stats.longestStreak > 0 ? `${stats.longestStreak}d` : "—",
      icon: Trophy,
      sub: null,
    },
  ] as const;

  return (
    <div className="space-y-8">
      {/* ---- Header card ------------------------------------------------ */}
      <GlassCard strong className="p-6 sm:p-8">
        <div className="flex flex-wrap items-start gap-5">
          {row?.image || session.user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={(row?.image ?? session.user.image) as string}
              alt={displayName}
              width={80}
              height={80}
              className="h-20 w-20 rounded-2xl object-cover"
            />
          ) : (
            <div className="grid h-20 w-20 place-items-center rounded-2xl gradient-primary text-2xl font-bold text-white shadow-lg shadow-violet-500/30">
              {initial}
            </div>
          )}
          <div className="flex-1 space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
              {displayName}
            </h1>
            <p className="text-sm text-slate-400">EngiNerd learner</p>
            {row?.collegeName ? (
              <p className="text-sm text-slate-300">{row.collegeName}</p>
            ) : null}
          </div>
        </div>
      </GlassCard>

      {/* ---- Stats grid ------------------------------------------------- */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_TILES.map((s) => (
          <GlassCard key={s.label} className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-slate-400">
                {s.label}
              </p>
              <s.icon className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-slate-50">
              {s.value}
            </p>
            {s.sub ? (
              <p className="mt-1 text-xs text-slate-400">{s.sub}</p>
            ) : null}
          </GlassCard>
        ))}
      </section>

      {/* ---- Public profile / handle ------------------------------------*/}
      <section>
        <GlassCard className="p-6">
          <HandlePicker initialHandle={row?.handle ?? null} />
        </GlassCard>
      </section>

      {/* ---- Connected accounts / verification --------------------------*/}
      <section>
        <GlassCard className="p-6">
          <header className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            <h2 className="text-base font-semibold text-slate-100">
              Connected accounts
            </h2>
          </header>
          <p className="mt-1 text-xs text-slate-400">
            Sign-in methods linked to this account.
          </p>
          <ul className="mt-5 space-y-3 text-sm">
            <li className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <span className="inline-flex items-center gap-2.5 text-slate-200">
                <Mail className="h-4 w-4 text-slate-400" />
                {email ?? <span className="text-slate-400">No email linked</span>}
              </span>
              {email ? (
                emailVerified ? (
                  <Badge variant="success">Verified</Badge>
                ) : (
                  <Badge variant="warning">Unverified</Badge>
                )
              ) : (
                <Badge variant="outline">—</Badge>
              )}
            </li>
            <li className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <span className="inline-flex items-center gap-2.5 text-slate-200">
                <Phone className="h-4 w-4 text-slate-400" />
                {phone ?? <span className="text-slate-400">No phone linked</span>}
              </span>
              {phone ? (
                phoneVerified ? (
                  <Badge variant="success">Verified</Badge>
                ) : (
                  <Badge variant="warning">Unverified</Badge>
                )
              ) : (
                <Badge variant="outline">—</Badge>
              )}
            </li>
          </ul>
        </GlassCard>
      </section>

      {/* ---- Settings ---------------------------------------------------- */}
      <section>
        <GlassCard className="p-6">
          <h2 className="text-base font-semibold text-slate-100">Settings</h2>
          <p className="mt-1 text-xs text-slate-400">
            Appearance and account preferences.
          </p>
          <div className="mt-5 space-y-3 text-sm text-slate-300">
            <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <span>Theme</span>
              <Badge variant="outline">Dark (locked)</Badge>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <span>Account language</span>
              <Badge variant="glass">English UI · Hinglish content</Badge>
            </div>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
