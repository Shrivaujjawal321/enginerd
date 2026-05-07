import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { auth } from "@/auth";
import {
  getProblemBySlug,
  listProblemSlugs,
  listRecentSubmissionsForProblem,
} from "@/lib/problems-store";
import { ProblemWorkspace } from "@/components/dashboard/problem-workspace";

export const dynamicParams = true;
// New problems land via DB after this build; allow on-demand SSG for them.
export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await listProblemSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> },
) {
  const { slug } = await props.params;
  const p = await getProblemBySlug(slug);
  return { title: p ? p.title : "Problem" };
}

export default async function ProblemDetail(
  props: { params: Promise<{ slug: string }> },
) {
  const { slug } = await props.params;
  const [problem, session] = await Promise.all([
    getProblemBySlug(slug),
    auth(),
  ]);
  if (!problem) notFound();

  const submissions = session?.user?.id
    ? await listRecentSubmissionsForProblem({
        userId: session.user.id,
        problemSlug: slug,
        limit: 5,
      })
    : [];

  // Overlay status from this user's history.
  const userStatus =
    submissions.length === 0
      ? "unsolved"
      : submissions.some((s) => s.status === "accepted")
        ? "solved"
        : "attempted";

  return (
    <div className="space-y-4">
      <Link
        href="/practice"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All problems
      </Link>
      <ProblemWorkspace
        problem={{ ...problem, status: userStatus }}
        recentSubmissions={submissions.map((s) => ({
          id: s.id,
          status: s.status,
          language: s.language,
          casesPassed: s.casesPassed,
          casesTotal: s.casesTotal,
          runtimeMs: s.runtimeMs,
          submittedAt: s.submittedAt.toISOString(),
        }))}
        isAuthed={!!session?.user?.id}
      />
    </div>
  );
}
