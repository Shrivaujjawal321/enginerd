/**
 * Fill-pipeline — process all 5 known high-paying roadmaps in parallel.
 *
 * Different from the Trend pipeline:
 *   - Skips Trend Researcher (we already have the canonical 5)
 *   - Skips Subject Mapper (subjects are hand-curated in mock-data)
 *   - For each of the 5 roadmaps, runs Topic Deep-diver per subject (parallel)
 *     and Hinglish Writer per subtopic (parallel)
 *   - Auto-publishes each roadmap to the library AS SOON AS it completes,
 *     so the user sees content stream into /roadmaps live
 *
 * Per roadmap: 4 subjects × 2 topics × 2 subtopics = 16 writer sub-agents.
 * Across 5 roadmaps: 80 writer sub-agents + 20 topic-deepdiver = 100 LLM calls.
 *
 * Stub mode: completes in ~5 seconds with deterministic content.
 * Live mode: ~30-60 seconds with parallelism, ~$3-5 cost.
 */

import { isLive } from "@/lib/llm";
import { runTopicDeepdiver } from "./topic-deepdiver";
import { runHinglishWriter } from "./hinglish-writer";
import { runQualityOrchestrator } from "./quality-orchestrator";
import {
  runStore,
  type GeneratedRoadmap,
  type Run,
} from "./store";
import {
  ZERO_USAGE,
  emit,
  emitDepths,
  emptyDepths,
  initSummary,
  recordUsage,
  timed,
} from "./pipeline-helpers";
import type {
  CareerSeed,
  GeneratedSubject,
  GeneratedSubtopic,
  GeneratedTopic,
} from "./types";
import { ROADMAPS, getRoadmap } from "@/lib/mock-data/roadmaps";
import { SUBJECTS_BY_SLUG } from "@/lib/mock-data/subjects";
import { library } from "./library";
import type { Roadmap } from "@/lib/mock-data/types";

export type FillTriggerInput = {
  /** Specific roadmap slugs to fill. Defaults to all 5 from ROADMAPS. */
  slugs?: string[];
  maxSubjectsPerRoadmap?: number;
  maxTopicsPerSubject?: number;
  maxSubtopicsPerTopic?: number;
};

export async function triggerFillRoadmaps(
  input: FillTriggerInput & { userId?: string | null } = {},
): Promise<Run> {
  const mode: "live" | "stub" = isLive() ? "live" : "stub";
  const slugs = input.slugs ?? ROADMAPS.map((r) => r.slug);
  const run = await runStore.createRun(
    { industry: `fill-roadmaps · ${slugs.length} roadmaps`, count: slugs.length },
    mode,
    { userId: input.userId ?? null },
  );

  runFillPipeline(run.id, slugs, {
    maxSubjects: input.maxSubjectsPerRoadmap ?? 4,
    maxTopics: input.maxTopicsPerSubject ?? 2,
    maxSubtopics: input.maxSubtopicsPerTopic ?? 2,
  }).catch(async (err) => {
    const message = err instanceof Error ? err.message : String(err);
    await runStore.setError(run.id, message);
    void runStore.emit(run.id, {
      type: "agent.failed",
      runId: run.id,
      agent: "topic-deepdiver",
      target: "fill-pipeline",
      error: message,
      timestamp: Date.now(),
    });
  });

  return run;
}

async function runFillPipeline(
  runId: string,
  slugs: string[],
  caps: { maxSubjects: number; maxTopics: number; maxSubtopics: number },
) {
  const startedAt = Date.now();
  const depths = emptyDepths();
  const summary = initSummary();

  emit(runId, {
    type: "run.started",
    runId,
    input: { industry: `fill-roadmaps · ${slugs.length} roadmaps`, count: slugs.length },
    mode: isLive() ? "live" : "stub",
    timestamp: startedAt,
  });

  const roadmaps = slugs
    .map((s) => getRoadmap(s))
    .filter((r): r is Roadmap => Boolean(r));
  if (roadmaps.length === 0) {
    throw new Error("No matching roadmaps found for the provided slugs.");
  }

  summary.totals.careers = roadmaps.length;

  // Process all roadmaps in parallel. Each one is self-contained — failure
  // in one doesn't take the others down (we use Promise.allSettled).
  const results = await Promise.allSettled(
    roadmaps.map((roadmap) =>
      fillSingleRoadmap(runId, roadmap, caps, summary, depths),
    ),
  );

  const failures = results.filter((r) => r.status === "rejected");
  if (failures.length > 0) {
    // Surface failures but don't fail the whole run — partial completion is fine.
    for (const f of failures) {
      const reason = f.status === "rejected" ? f.reason : null;
      const message = reason instanceof Error ? reason.message : String(reason);
      emit(runId, {
        type: "agent.failed",
        runId,
        agent: "hinglish-writer",
        target: "fill-roadmap",
        error: message,
        timestamp: Date.now(),
      });
    }
  }

  summary.totals.durationMs = Date.now() - startedAt;
  emitDepths(runId, emptyDepths());
  emit(runId, {
    type: "run.completed",
    runId,
    summary,
    timestamp: Date.now(),
  });
}

async function fillSingleRoadmap(
  runId: string,
  roadmap: Roadmap,
  caps: { maxSubjects: number; maxTopics: number; maxSubtopics: number },
  summary: import("./store").RunSummary,
  depths: import("./pipeline-helpers").QueueDepths,
) {
  const career: CareerSeed = {
    title: roadmap.title,
    description: roadmap.description,
    category: roadmap.category,
    difficulty: roadmap.difficulty,
    estDurationMonths: roadmap.durationMonths,
  };

  // Build GeneratedSubject inputs from the hand-curated subject list.
  const subjectInputs: GeneratedSubject[] = roadmap.subjectSlugs
    .slice(0, caps.maxSubjects)
    .map((slug, idx) => {
      const found = SUBJECTS_BY_SLUG[slug];
      if (found) {
        return {
          title: found.title,
          description: found.description,
          order: idx + 1,
          estTopicsCount: Math.max(6, found.topicsCount),
        };
      }
      // Subject doesn't exist in mock data — fall back to a synthesized stub.
      const niceName = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      return {
        title: niceName,
        description: `Core concepts for ${niceName} in the ${roadmap.title} track.`,
        order: idx + 1,
        estTopicsCount: 8,
      };
    });

  if (subjectInputs.length === 0) {
    throw new Error(`Roadmap ${roadmap.slug} has no subject slugs to process.`);
  }

  // Stage A: Topic Deep-diver per subject, in parallel.
  depths["topic-deepdiver"] += subjectInputs.length;
  emitDepths(runId, depths);

  const topicResults = await Promise.all(
    subjectInputs.map(async (subject) => {
      const r = await timed(
        runId,
        "topic-deepdiver",
        `${roadmap.title} → ${subject.title}`,
        () => runTopicDeepdiver({ career, subject }),
      );
      recordUsage(summary, "topic-deepdiver", r.usage, r.durationMs);
      depths["topic-deepdiver"] = Math.max(0, depths["topic-deepdiver"] - 1);
      return { subject, topics: r.value.topics.slice(0, caps.maxTopics) };
    }),
  );
  emitDepths(runId, depths);

  summary.totals.subjects += topicResults.length;
  for (const tr of topicResults) {
    summary.totals.topics += tr.topics.length;
  }

  // Stage B: Hinglish Writer + Quality, per (subject, topic, subtopic), parallel.
  const writerJobs: Array<{
    subject: GeneratedSubject;
    topic: GeneratedTopic;
    subtopic: GeneratedSubtopic;
  }> = [];
  for (const tr of topicResults) {
    for (const t of tr.topics) {
      for (const sub of t.subtopics.slice(0, caps.maxSubtopics)) {
        writerJobs.push({ subject: tr.subject, topic: t, subtopic: sub });
      }
    }
  }

  summary.totals.subtopics += writerJobs.length;
  depths["hinglish-writer"] += writerJobs.length;
  emitDepths(runId, depths);

  const writtenSubtopics = await Promise.all(
    writerJobs.map(async ({ subject, topic, subtopic }) => {
      const r = await timed(
        runId,
        "hinglish-writer",
        `${roadmap.title} · ${subject.title} → ${subtopic.title}`,
        () =>
          runHinglishWriter({
            career,
            subject,
            topicTitle: topic.title,
            subtopicTitle: subtopic.title,
          }),
      );
      recordUsage(summary, "hinglish-writer", r.usage, r.durationMs);
      depths["hinglish-writer"] = Math.max(0, depths["hinglish-writer"] - 1);

      // Quality check (local, no LLM)
      depths["quality-orchestrator"] += 1;
      const qStart = Date.now();
      emit(runId, {
        type: "agent.started",
        runId,
        agent: "quality-orchestrator",
        target: `${roadmap.title} · ${subtopic.title}`,
        timestamp: qStart,
      });
      const verdict = runQualityOrchestrator(r.value.blocks);
      const qEnd = Date.now();
      emit(runId, {
        type: "agent.completed",
        runId,
        agent: "quality-orchestrator",
        target: `${roadmap.title} · ${subtopic.title}`,
        durationMs: qEnd - qStart,
        usage: ZERO_USAGE,
        model: "local",
        mode: "stub",
        timestamp: qEnd,
      });
      recordUsage(summary, "quality-orchestrator", ZERO_USAGE, qEnd - qStart);
      depths["quality-orchestrator"] = Math.max(0, depths["quality-orchestrator"] - 1);

      if (verdict.status === "published") summary.totals.publishedSubtopics += 1;
      else summary.totals.needsReviewSubtopics += 1;

      return {
        topicTitle: topic.title,
        subtopicTitle: subtopic.title,
        blocks: r.value.blocks,
        quality: verdict,
      };
    }),
  );
  emitDepths(runId, depths);

  // Group written subtopics back under their parent subjects for the
  // generated tree shape.
  const generated: GeneratedRoadmap = {
    career,
    subjects: topicResults.map((tr) => ({
      subject: tr.subject,
      topics: tr.topics,
      subtopics: writtenSubtopics.filter((ws) =>
        tr.topics.some((t) => t.title === ws.topicTitle),
      ),
    })),
  };

  // Stash on the run...
  await runStore.attachGenerated(runId, generated);
  // ...AND auto-publish to the library so /roadmaps shows it live.
  // sourceRoadmap = the original mock — preserves rich metadata (long
  // description with salary numbers, why-this, companies, skills, accent).
  // The agent-generated subjects + their Hinglish content attach to it.
  await library.publish(runId, generated, {
    canonicalSlug: roadmap.slug,
    sourceRoadmap: roadmap,
  });
}
