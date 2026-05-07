import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  IndianRupee,
  MapPin,
  MessageSquareQuote,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/shared/glass-card";
import { COMPANIES, JOB_POSTINGS, getCompany } from "@/lib/mock-data/companies";
import { getRoadmap } from "@/lib/mock-data/roadmaps";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return COMPANIES.map((c) => ({ id: c.slug }));
}

export async function generateMetadata(
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  const c = getCompany(id);
  return { title: c ? c.name : "Company" };
}

export default async function CompanyDetail(
  props: { params: Promise<{ id: string }> },
) {
  const { id } = await props.params;
  const company = getCompany(id);
  if (!company) notFound();

  const openRoles = JOB_POSTINGS.filter((j) => j.companySlug === company.slug);
  const relatedRoadmaps = company.relatedRoadmaps
    .map((slug) => getRoadmap(slug))
    .filter((r): r is NonNullable<typeof r> => Boolean(r));

  return (
    <div className="space-y-8">
      <Link
        href="/careers"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All careers
      </Link>

      <GlassCard strong className="relative overflow-hidden p-8 sm:p-10">
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 -z-10 bg-gradient-to-br opacity-25",
            company.accent,
          )}
        />
        <div className="flex flex-wrap items-start gap-5">
          <div
            className={cn(
              "grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br text-lg font-bold text-white shadow-lg shadow-black/20",
              company.accent,
            )}
          >
            {company.shortName.slice(0, 2)}
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
                {company.name}
              </h1>
              <Badge variant="success">Verified</Badge>
            </div>
            <p className="max-w-2xl text-sm text-slate-300">
              {company.description}
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                Founded {company.founded}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {company.employees} employees
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5" />
                {openRoles.length} open roles
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {company.techStack.map((t) => (
                <Badge key={t} variant="glass">
                  {t}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100">Open roles</h2>
        {openRoles.length === 0 ? (
          <GlassCard className="p-6 text-center text-sm text-slate-400">
            No open roles right now. Check back soon.
          </GlassCard>
        ) : (
          <ul className="space-y-3">
            {openRoles.map((job) => (
              <li key={job.id}>
                <GlassCard hoverable className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-slate-50">
                        {job.title}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.location}
                        </span>
                        <span>{job.remoteType}</span>
                        <span>
                          {job.experienceMin}–{job.experienceMax} yrs
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <IndianRupee className="h-3 w-3" />
                          {job.salaryMin}–{job.salaryMax} LPA
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={
                        job.matchPct >= 75
                          ? "success"
                          : job.matchPct >= 60
                            ? "warning"
                            : "outline"
                      }
                    >
                      Match {job.matchPct}%
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {job.techStack.map((t) => (
                      <Badge key={t} variant="outline" className="!text-[10px]">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </GlassCard>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100">
          What it&apos;s like to work here
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {company.employeeQuotes.map((q) => (
            <GlassCard key={q.name} className="p-6">
              <MessageSquareQuote className="h-5 w-5 text-violet-300/70" />
              <p className="mt-3 text-sm leading-relaxed text-slate-200">
                “{q.quote}”
              </p>
              <div className="mt-4 border-t border-white/[0.06] pt-3">
                <p className="text-sm font-semibold text-slate-100">
                  {q.name}
                </p>
                <p className="text-xs text-slate-400">{q.role}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <GlassCard className="p-6">
          <h2 className="text-base font-semibold text-slate-100">
            Skills they look for
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {company.skillsLookFor.map((s) => (
              <Badge key={s} variant="glass">
                {s}
              </Badge>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-base font-semibold text-slate-100">
            Roadmap to crack {company.name}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Recommended roadmaps based on hiring patterns.
          </p>
          <div className="mt-4 space-y-2.5">
            {relatedRoadmaps.map((rm) => (
              <Link
                key={rm.slug}
                href={`/roadmaps/${rm.slug}`}
                className="group flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 transition-colors hover:border-white/15 hover:bg-white/[0.04]"
              >
                <span className="text-sm text-slate-100">{rm.title}</span>
                <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
              </Link>
            ))}
          </div>
          <Button className="mt-5 w-full">
            Start preparing
            <ArrowRight className="h-4 w-4" />
          </Button>
        </GlassCard>
      </section>
    </div>
  );
}
