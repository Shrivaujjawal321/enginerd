import { CareersExplorer } from "@/components/dashboard/careers-explorer";
import { JobAgent } from "@/components/dashboard/job-agent";
import { getRealJobs } from "@/lib/real-jobs";

export const metadata = { title: "Careers" };
// Careers data comes from public job-board APIs — refresh hourly.
export const revalidate = 3600;

export default async function CareersPage() {
  // Live aggregation across Remotive + Arbeitnow + Muse. Falls back to an
  // empty list if every provider fails — never lies with fabricated postings.
  const { jobs, companies, source } = await getRealJobs(
    "software engineer india",
  );

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
          Careers
        </h1>
        <p className="mt-2 text-base text-slate-400">
          AI-powered job search agent + live openings from public job boards.
          One-click apply through the original posting.
        </p>
      </header>

      <JobAgent />

      <section className="space-y-4">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-100">
              Live openings
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {source === "live"
                ? `${jobs.length} jobs aggregated from Remotive, Arbeitnow, and The Muse. Apply links open the original posting.`
                : "Job providers are unreachable right now. Try again in a few minutes."}
            </p>
          </div>
        </header>
        <CareersExplorer jobs={jobs} companies={companies} />
      </section>
    </div>
  );
}
