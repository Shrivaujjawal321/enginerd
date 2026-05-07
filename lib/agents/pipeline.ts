/**
 * In-memory pipeline orchestrator.
 *
 * Stages run sequentially per career, with parallel fan-out at the
 * subject and subtopic levels. Each agent boundary emits an event the
 * admin dashboard can stream over SSE.
 *
 * Phase 4.5 swaps this for BullMQ — each stage becomes a queue, agents
 * become workers. The shape (typed events, run state, generated tree)
 * stays the same; only the executor changes.
 */

import { isLive } from "@/lib/llm";
import { runTrendResearcher, type TrendingRoadmap } from "./trend-researcher";
import { runSubjectMapper } from "./subject-mapper";
import { runTopicDeepdiver } from "./topic-deepdiver";
import { runHinglishWriter } from "./hinglish-writer";
import { runQualityOrchestrator } from "./quality-orchestrator";
import type { CareerSeed } from "./types";
import {
  runStore,
  type GeneratedRoadmap,
  type Run,
} from "./store";
import {
  AGENT_NAMES,
  ZERO_USAGE,
  emit,
  emitDepths,
  emptyDepths,
  initSummary,
  recordUsage,
  timed,
} from "./pipeline-helpers";

// Silence unused-import warning while keeping the reference for clarity.
void AGENT_NAMES;

function trendingToCareer(t: TrendingRoadmap): CareerSeed {
  return {
    title: t.title,
    description: t.description,
    category: t.category,
    difficulty: t.difficulty,
    estDurationMonths: t.estDurationMonths,
    salarySignals: t.salarySignals,
    demandScore: t.demandScore,
    reasoning: t.reasoning,
  };
}

export type TriggerInput = {
  industry: string;
  /** How many career roadmaps to generate end-to-end. */
  count: number;
  /** Cap subtopic-level fan-out — full live runs get expensive fast. */
  maxSubjectsPerCareer?: number;
  maxTopicsPerSubject?: number;
  maxSubtopicsPerTopic?: number;
};

export async function triggerRun(
  input: TriggerInput & { userId?: string | null },
): Promise<Run> {
  const mode: "live" | "stub" = isLive() ? "live" : "stub";
  const run = await runStore.createRun(
    { industry: input.industry, count: input.count },
    mode,
    { userId: input.userId ?? null },
  );

  // Run async — caller gets the run id immediately, dashboard streams progress.
  runPipeline(run.id, input).catch(async (err) => {
    const message = err instanceof Error ? err.message : String(err);
    await runStore.setError(run.id, message);
    void runStore.emit(run.id, {
      type: "agent.failed",
      runId: run.id,
      agent: "trend-researcher",
      target: "pipeline",
      error: message,
      timestamp: Date.now(),
    });
  });

  return run;
}

async function runPipeline(runId: string, input: TriggerInput) {
  const startedAt = Date.now();
  const depths = emptyDepths();
  const summary = initSummary();

  emit(runId, {
    type: "run.started",
    runId,
    input: { industry: input.industry, count: input.count },
    mode: isLive() ? "live" : "stub",
    timestamp: startedAt,
  });

  // ---- Stage 1: Trend Researcher — find currently high-paying roadmaps ----
  depths["trend-researcher"] = 1;
  emitDepths(runId, depths);

  const trendResult = await timed(runId, "trend-researcher", input.industry, () =>
    runTrendResearcher({ industry: input.industry, count: input.count }),
  );
  recordUsage(summary, "trend-researcher", trendResult.usage, trendResult.durationMs);

  depths["trend-researcher"] = 0;
  emitDepths(runId, depths);

  // The user's spec: "1 agent search which roadmaps are high-paying.
  // Then 2 agent took the FIRST roadmap and research about it." We process
  // only the top-ranked roadmap deeply. The rest get attached to the run
  // as candidates for the user to inspect on the dashboard.
  const allRoadmaps = trendResult.value.roadmaps;
  if (allRoadmaps.length === 0) {
    throw new Error("Trend Researcher returned zero roadmaps.");
  }
  const topRoadmap = allRoadmaps[0];
  const topCareer = trendingToCareer(topRoadmap);

  summary.totals.careers = 1;
  summary.totals.candidateRoadmaps = allRoadmaps.length;
  const maxSubjects = input.maxSubjectsPerCareer ?? 4;
  const maxTopics = input.maxTopicsPerSubject ?? 2;
  const maxSubtopics = input.maxSubtopicsPerTopic ?? 2;

  // ---- Stages 2–5 — only on the top roadmap ----
  depths["subject-mapper"] = 1;
  emitDepths(runId, depths);

  for (const career of [topCareer]) {
    const generated: GeneratedRoadmap = {
      career,
      subjects: [],
      candidateRoadmaps: allRoadmaps.slice(1).map(trendingToCareer),
    };

    // Stage 2: subject mapper for this career
    const subjectResult = await timed(runId, "subject-mapper", career.title, () =>
      runSubjectMapper(career),
    );
    recordUsage(summary, "subject-mapper", subjectResult.usage, subjectResult.durationMs);
    depths["subject-mapper"] = Math.max(0, depths["subject-mapper"] - 1);

    const cappedSubjects = subjectResult.value.subjects.slice(0, maxSubjects);
    summary.totals.subjects += cappedSubjects.length;
    depths["topic-deepdiver"] += cappedSubjects.length;
    emitDepths(runId, depths);

    // Stage 3: topic deep-diver, in parallel across subjects
    const topicResults = await Promise.all(
      cappedSubjects.map(async (subject) => {
        const r = await timed(
          runId,
          "topic-deepdiver",
          `${career.title} → ${subject.title}`,
          () => runTopicDeepdiver({ career, subject }),
        );
        recordUsage(summary, "topic-deepdiver", r.usage, r.durationMs);
        depths["topic-deepdiver"] = Math.max(0, depths["topic-deepdiver"] - 1);
        return { subject, topics: r.value.topics };
      }),
    );
    emitDepths(runId, depths);

    // Stage 4 + 5: writer + quality, in parallel across all subtopics
    for (const sr of topicResults) {
      const cappedTopics = sr.topics.slice(0, maxTopics);
      const flat = cappedTopics.flatMap((t) =>
        t.subtopics
          .slice(0, maxSubtopics)
          .map((sub) => ({ topic: t, subtopic: sub })),
      );

      summary.totals.topics += cappedTopics.length;
      summary.totals.subtopics += flat.length;
      depths["hinglish-writer"] += flat.length;
      emitDepths(runId, depths);

      const subtopicRecords = await Promise.all(
        flat.map(async ({ topic, subtopic }) => {
          const writerResult = await timed(
            runId,
            "hinglish-writer",
            `${sr.subject.title} → ${subtopic.title}`,
            () =>
              runHinglishWriter({
                career,
                subject: sr.subject,
                topicTitle: topic.title,
                subtopicTitle: subtopic.title,
              }),
          );
          recordUsage(summary, "hinglish-writer", writerResult.usage, writerResult.durationMs);
          depths["hinglish-writer"] = Math.max(0, depths["hinglish-writer"] - 1);

          // Quality orchestrator runs locally — no LLM call, but we still
          // emit start/complete events so the dashboard sees the stage.
          depths["quality-orchestrator"] += 1;
          emitDepths(runId, depths);

          const qStart = Date.now();
          emit(runId, {
            type: "agent.started",
            runId,
            agent: "quality-orchestrator",
            target: `${sr.subject.title} → ${subtopic.title}`,
            timestamp: qStart,
          });
          const verdict = runQualityOrchestrator(writerResult.value.blocks);
          const qEnd = Date.now();
          emit(runId, {
            type: "agent.completed",
            runId,
            agent: "quality-orchestrator",
            target: `${sr.subject.title} → ${subtopic.title}`,
            durationMs: qEnd - qStart,
            usage: ZERO_USAGE,
            model: "local",
            mode: "stub",
            timestamp: qEnd,
          });
          recordUsage(summary, "quality-orchestrator", ZERO_USAGE, qEnd - qStart);
          depths["quality-orchestrator"] = Math.max(0, depths["quality-orchestrator"] - 1);

          if (verdict.status === "published") {
            summary.totals.publishedSubtopics += 1;
          } else {
            summary.totals.needsReviewSubtopics += 1;
          }

          return {
            topicTitle: topic.title,
            subtopicTitle: subtopic.title,
            blocks: writerResult.value.blocks,
            quality: verdict,
          };
        }),
      );

      generated.subjects.push({
        subject: sr.subject,
        topics: cappedTopics,
        subtopics: subtopicRecords,
      });
    }

    await runStore.attachGenerated(runId, generated);
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

// Helpers (timed / emit / emitDepths / initSummary / recordUsage / emptyDepths /
// ZERO_USAGE / AGENT_NAMES) live in pipeline-helpers.ts so the fill-pipeline
// can share them.
