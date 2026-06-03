import { JobAgent } from "@/components/dashboard/job-agent";

export const metadata = { title: "Careers" };
// Page itself is static — JobAgent fetches its own live data client-side.
export const revalidate = 3600;

export default function CareersPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
          Careers
        </h1>
        <p className="mt-2 text-base text-slate-400">
          Upload your resume — the agent fetches live openings from public job
          boards and ranks them against your background using your own LLM key.
          One-click apply opens the original posting.
        </p>
      </header>

      <JobAgent />
    </div>
  );
}
