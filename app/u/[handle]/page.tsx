import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Code2,
  Flame,
  GraduationCap,
  Trophy,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/shared/glass-card";
import { getPublicProfileByHandle } from "@/lib/users-store";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await props.params;
  const profile = await getPublicProfileByHandle(handle);
  if (!profile) return { title: "Profile not found" };
  const name = profile.name ?? `@${profile.handle}`;
  return {
    title: `${name} on EngiNerd`,
    description: `${profile.stats.problemsSolved} DSA solved · ${profile.stats.subjectsCompleted} subjects · ${profile.stats.longestStreak}-day streak`,
  };
}

export default async function PublicProfilePage(props: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await props.params;
  const profile = await getPublicProfileByHandle(handle);
  if (!profile) notFound();

  const stats = [
    {
      label: "Problems solved",
      value: profile.stats.problemsSolved,
      icon: Code2,
    },
    {
      label: "Subjects completed",
      value: profile.stats.subjectsCompleted,
      icon: Trophy,
    },
    {
      label: "Current streak",
      value: profile.stats.currentStreak,
      suffix: "d",
      icon: Flame,
    },
    {
      label: "Best streak",
      value: profile.stats.longestStreak,
      suffix: "d",
      icon: Flame,
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-20">
      {/* ===== Hero =================================================== */}
      <GlassCard strong className="overflow-hidden p-6 sm:p-10">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6">
          <Avatar src={profile.image} name={profile.name ?? profile.handle} />
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-wider text-slate-400">
              @{profile.handle}
            </p>
            <h1 className="mt-0.5 truncate text-2xl font-bold tracking-tight text-slate-50 sm:text-4xl">
              {profile.name ?? `@${profile.handle}`}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
              {profile.collegeName ? (
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5" />
                  {profile.collegeName}
                  {profile.graduationYear ? ` · ${profile.graduationYear}` : ""}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Joined {formatDate(profile.joinedAt)}
              </span>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* ===== Stats grid ============================================ */}
      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <GlassCard
            key={s.label}
            className="flex items-center gap-3 px-4 py-3"
          >
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/[0.04] text-violet-300">
              <s.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wider text-slate-400">
                {s.label}
              </p>
              <p className="text-base font-semibold text-slate-100">
                {s.value}
                {"suffix" in s && s.value > 0 ? s.suffix : ""}
              </p>
            </div>
          </GlassCard>
        ))}
      </section>

      {/* ===== Footer CTA ============================================ */}
      <div className="mt-10 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-center">
        <p className="text-sm text-slate-300">
          Want a profile like this?
        </p>
        <Link href="/login" className="mt-3 inline-block">
          <Button>
            Get started
            <Sparkles className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function Avatar({
  src,
  name,
}: {
  src: string | null;
  name: string;
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={name}
        width={80}
        height={80}
        className="h-20 w-20 shrink-0 rounded-2xl border border-white/[0.08] object-cover"
      />
    );
  }
  const initials = name
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl gradient-primary text-2xl font-bold text-white shadow-lg shadow-violet-500/20">
      {initials || "?"}
    </div>
  );
}
