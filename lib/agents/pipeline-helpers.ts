/**
 * Shared helpers used by both the trend pipeline (single roadmap, deep)
 * and the fill pipeline (all 5 known roadmaps, deep, in parallel).
 *
 * Phase 4.5: when we move to BullMQ, this module gets gutted — the queue
 * runtime emits events directly. For now everything is in-process.
 */

import type { Usage } from "@/lib/llm";
import {
  runStore,
  type AgentEvent,
  type AgentName,
  type RunSummary,
} from "./store";

export const ZERO_USAGE: Usage = {
  inputTokens: 0,
  outputTokens: 0,
  cacheReadTokens: 0,
  cacheCreationTokens: 0,
  costUsd: 0,
};

export const AGENT_NAMES: AgentName[] = [
  "trend-researcher",
  "subject-mapper",
  "topic-deepdiver",
  "hinglish-writer",
  "quality-orchestrator",
];

export type QueueDepths = Record<AgentName, number>;

export function emptyDepths(): QueueDepths {
  return {
    "trend-researcher": 0,
    "subject-mapper": 0,
    "topic-deepdiver": 0,
    "hinglish-writer": 0,
    "quality-orchestrator": 0,
  };
}

export function emit(runId: string, event: AgentEvent) {
  // Fire-and-forget — runStore notifies in-memory SSE listeners synchronously
  // before the DB write begins, so consumers see events with zero added
  // latency. DB persistence happens off the hot path.
  void runStore.emit(runId, event);
}

export function emitDepths(runId: string, depths: QueueDepths) {
  emit(runId, {
    type: "stage.queue_depth",
    runId,
    depths: { ...depths },
    timestamp: Date.now(),
  });
}

export async function timed<
  T extends { usage: Usage; mode: "live" | "stub"; model: string },
>(
  runId: string,
  agent: AgentName,
  target: string,
  fn: () => Promise<T>,
): Promise<{ value: T; usage: Usage; durationMs: number }> {
  const startedAt = Date.now();
  emit(runId, {
    type: "agent.started",
    runId,
    agent,
    target,
    timestamp: startedAt,
  });
  try {
    const value = await fn();
    const endedAt = Date.now();
    const durationMs = endedAt - startedAt;
    emit(runId, {
      type: "agent.completed",
      runId,
      agent,
      target,
      durationMs,
      usage: value.usage,
      model: value.model,
      mode: value.mode,
      timestamp: endedAt,
    });
    return { value, usage: value.usage, durationMs };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    emit(runId, {
      type: "agent.failed",
      runId,
      agent,
      target,
      error: message,
      timestamp: Date.now(),
    });
    throw err;
  }
}

export function initSummary(): RunSummary {
  const blank = (): RunSummary["perAgent"][AgentName] => ({
    callCount: 0,
    successCount: 0,
    failureCount: 0,
    totalDurationMs: 0,
    usage: { ...ZERO_USAGE },
  });

  const perAgent = {} as RunSummary["perAgent"];
  for (const a of AGENT_NAMES) {
    perAgent[a] = blank();
  }

  return {
    totals: {
      careers: 0,
      candidateRoadmaps: 0,
      subjects: 0,
      topics: 0,
      subtopics: 0,
      publishedSubtopics: 0,
      needsReviewSubtopics: 0,
      inputTokens: 0,
      outputTokens: 0,
      cacheReadTokens: 0,
      cacheCreationTokens: 0,
      costUsd: 0,
      durationMs: 0,
    },
    perAgent,
  };
}

export function recordUsage(
  summary: RunSummary,
  agent: AgentName,
  usage: Usage,
  durationMs: number,
) {
  summary.perAgent[agent].callCount += 1;
  summary.perAgent[agent].successCount += 1;
  summary.perAgent[agent].totalDurationMs += durationMs;
  summary.perAgent[agent].usage.inputTokens += usage.inputTokens;
  summary.perAgent[agent].usage.outputTokens += usage.outputTokens;
  summary.perAgent[agent].usage.cacheReadTokens += usage.cacheReadTokens;
  summary.perAgent[agent].usage.cacheCreationTokens += usage.cacheCreationTokens;
  summary.perAgent[agent].usage.costUsd =
    Math.round(
      (summary.perAgent[agent].usage.costUsd + usage.costUsd) * 1_000_000,
    ) / 1_000_000;

  summary.totals.inputTokens += usage.inputTokens;
  summary.totals.outputTokens += usage.outputTokens;
  summary.totals.cacheReadTokens += usage.cacheReadTokens;
  summary.totals.cacheCreationTokens += usage.cacheCreationTokens;
  summary.totals.costUsd =
    Math.round((summary.totals.costUsd + usage.costUsd) * 1_000_000) /
    1_000_000;
}
