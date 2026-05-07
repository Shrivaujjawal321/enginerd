import { auth } from "@/auth";
import { SUBJECTS } from "@/lib/mock-data/subjects";
import { library } from "@/lib/agents/library";
import { getUserProgressMaps } from "@/lib/user-progress-stats";
import { SubjectsExplorer } from "@/components/dashboard/subjects-explorer";

export const metadata = { title: "Subjects" };
// Per-user progress is fetched fresh — but the catalog itself is cacheable.
export const dynamic = "force-dynamic";

export default async function SubjectsPage() {
  const [generated, session] = await Promise.all([
    library.listSubjects(),
    auth(),
  ]);
  const generatedSlugs = new Set(generated.map((s) => s.slug));
  const remainingMocks = SUBJECTS.filter((s) => !generatedSlugs.has(s.slug));
  const merged = [...generated, ...remainingMocks];

  // Real per-user progress — replaces hardcoded `progressPct: 18`.
  const { bySubject } = await getUserProgressMaps(session?.user?.id);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
          Subjects
        </h1>
        <p className="mt-2 text-base text-slate-400">
          Deep dives. Hinglish content. Diagrams and interview answers for
          every topic.
        </p>
        {generated.length > 0 ? (
          <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-200">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-300" />
            {generated.length} fresh subjects from the latest pipeline run
          </p>
        ) : null}
      </header>
      <SubjectsExplorer subjects={merged} progressBySubject={bySubject} />
    </div>
  );
}
