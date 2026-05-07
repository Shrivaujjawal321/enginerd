/**
 * Agent run store.
 *
 * Hybrid persistence:
 *   - Run rows + events ALWAYS live in memory (fast SSE, in-process listeners).
 *   - When DATABASE_URL is configured, every mutation is durably persisted to
 *     `agent_runs` + `agent_events`. Reads prefer the DB so a process restart
 *     doesn't lose history.
 *
 * Phase 2: methods are async. Public API surface (createRun, emit,
 * attachGenerated, setError, get, list, subscribe) is preserved so callers
 * just need to add `await`.
 */

import { eq, desc, asc } from "drizzle-orm";

import { db } from "@/lib/db";
import { hasDatabase } from "@/lib/env";
import {
  agentRuns,
  agentEvents,
  type AgentRunRow,
  type AgentEventRow,
} from "@/lib/db/schema";
import type {
  CareerSeed,
  GeneratedContentBlock,
  GeneratedSubject,
  GeneratedTopic,
  QualityVerdict,
} from "./types";
import type { Usage } from "@/lib/llm";

export type AgentName =
  | "trend-researcher"
  | "subject-mapper"
  | "topic-deepdiver"
  | "hinglish-writer"
  | "quality-orchestrator";

export type RunStatus = "queued" | "running" | "succeeded" | "failed";

export type AgentEvent =
  | {
      type: "run.started";
      runId: string;
      input: { industry: string; count: number };
      mode: "live" | "stub";
      timestamp: number;
    }
  | {
      type: "agent.started";
      runId: string;
      agent: AgentName;
      target: string;
      timestamp: number;
    }
  | {
      type: "agent.completed";
      runId: string;
      agent: AgentName;
      target: string;
      durationMs: number;
      usage: Usage;
      model: string;
      mode: "live" | "stub";
      timestamp: number;
    }
  | {
      type: "agent.failed";
      runId: string;
      agent: AgentName;
      target: string;
      error: string;
      timestamp: number;
    }
  | {
      type: "stage.queue_depth";
      runId: string;
      depths: Record<AgentName, number>;
      timestamp: number;
    }
  | {
      type: "run.completed";
      runId: string;
      summary: RunSummary;
      timestamp: number;
    };

export type GeneratedSubtopicRecord = {
  topicTitle: string;
  subtopicTitle: string;
  blocks: GeneratedContentBlock[];
  quality: QualityVerdict;
};

export type GeneratedRoadmap = {
  career: CareerSeed;
  subjects: Array<{
    subject: GeneratedSubject;
    topics: GeneratedTopic[];
    subtopics: GeneratedSubtopicRecord[];
  }>;
  candidateRoadmaps?: CareerSeed[];
};

export type RunSummary = {
  totals: {
    careers: number;
    candidateRoadmaps: number;
    subjects: number;
    topics: number;
    subtopics: number;
    publishedSubtopics: number;
    needsReviewSubtopics: number;
    inputTokens: number;
    outputTokens: number;
    cacheReadTokens: number;
    cacheCreationTokens: number;
    costUsd: number;
    durationMs: number;
  };
  perAgent: Record<
    AgentName,
    {
      callCount: number;
      successCount: number;
      failureCount: number;
      totalDurationMs: number;
      usage: Usage;
    }
  >;
};

export type Run = {
  id: string;
  userId?: string | null;
  status: RunStatus;
  mode: "live" | "stub";
  input: { industry: string; count: number };
  startedAt: number;
  endedAt?: number;
  events: AgentEvent[];
  generated: GeneratedRoadmap[];
  summary?: RunSummary;
  error?: string;
};

type Listener = (event: AgentEvent) => void;

/* ---------- Helpers --------------------------------------------------- */

function rowToRun(row: AgentRunRow, events: AgentEventRow[]): Run {
  return {
    id: row.id,
    userId: row.userId,
    status: row.status as RunStatus,
    mode: row.mode as "live" | "stub",
    input: row.input as Run["input"],
    startedAt: row.startedAt.getTime(),
    endedAt: row.endedAt?.getTime(),
    events: events.map((e) => e.payload as AgentEvent),
    generated: (row.generated as GeneratedRoadmap[] | null) ?? [],
    summary: (row.summary as RunSummary | undefined) ?? undefined,
    error: row.error ?? undefined,
  };
}

/* ---------- Hybrid in-memory + DB store ------------------------------- */

class AgentRunStore {
  private memory = new Map<string, Run>();
  private listeners = new Map<string, Set<Listener>>();
  private seqs = new Map<string, number>();

  async createRun(
    input: { industry: string; count: number },
    mode: "live" | "stub",
    options: { userId?: string | null } = {},
  ): Promise<Run> {
    const id = `run_${Date.now().toString(36)}_${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date();
    const run: Run = {
      id,
      userId: options.userId ?? null,
      status: "queued",
      mode,
      input,
      startedAt: now.getTime(),
      events: [],
      generated: [],
    };
    this.memory.set(id, run);
    this.seqs.set(id, 0);

    if (hasDatabase) {
      try {
        await db.insert(agentRuns).values({
          id,
          userId: options.userId ?? null,
          status: "queued",
          mode,
          input,
          startedAt: now,
        });
      } catch (err) {
        console.error("[runStore] createRun DB write failed", err);
      }
    }

    return run;
  }

  async emit(runId: string, event: AgentEvent): Promise<void> {
    const run = this.memory.get(runId);
    if (run) {
      run.events.push(event);
      if (event.type === "run.started") run.status = "running";
      if (event.type === "run.completed") {
        run.status = "succeeded";
        run.endedAt = event.timestamp;
        run.summary = event.summary;
      }
      if (event.type === "agent.failed") run.status = "failed";
    }

    // Notify listeners synchronously — SSE consumers depend on low latency.
    const subs = this.listeners.get(runId);
    if (subs) {
      for (const fn of subs) {
        try {
          fn(event);
        } catch {
          // never break a run because a listener threw
        }
      }
    }

    if (hasDatabase) {
      const seq = (this.seqs.get(runId) ?? 0) + 1;
      this.seqs.set(runId, seq);
      try {
        await db.insert(agentEvents).values({
          runId,
          seq,
          type: event.type,
          payload: event,
        });
        if (event.type === "run.started") {
          await db
            .update(agentRuns)
            .set({ status: "running" })
            .where(eq(agentRuns.id, runId));
        } else if (event.type === "run.completed") {
          await db
            .update(agentRuns)
            .set({
              status: "succeeded",
              endedAt: new Date(event.timestamp),
              summary: event.summary,
              costUsd: event.summary.totals.costUsd ?? 0,
            })
            .where(eq(agentRuns.id, runId));
        } else if (event.type === "agent.failed") {
          await db
            .update(agentRuns)
            .set({ status: "failed" })
            .where(eq(agentRuns.id, runId));
        }
      } catch (err) {
        console.error("[runStore] emit DB write failed", err);
      }
    }
  }

  async attachGenerated(runId: string, roadmap: GeneratedRoadmap): Promise<void> {
    const run = this.memory.get(runId);
    if (run) run.generated.push(roadmap);

    if (hasDatabase) {
      try {
        await db
          .update(agentRuns)
          .set({ generated: run?.generated ?? [roadmap] })
          .where(eq(agentRuns.id, runId));
      } catch (err) {
        console.error("[runStore] attachGenerated DB write failed", err);
      }
    }
  }

  async setError(runId: string, message: string): Promise<void> {
    const run = this.memory.get(runId);
    if (run) {
      run.error = message;
      run.status = "failed";
      run.endedAt = Date.now();
    }
    if (hasDatabase) {
      try {
        await db
          .update(agentRuns)
          .set({ status: "failed", error: message, endedAt: new Date() })
          .where(eq(agentRuns.id, runId));
      } catch (err) {
        console.error("[runStore] setError DB write failed", err);
      }
    }
  }

  async get(runId: string): Promise<Run | undefined> {
    if (hasDatabase) {
      try {
        const row = await db.query.agentRuns.findFirst({
          where: eq(agentRuns.id, runId),
        });
        if (!row) return this.memory.get(runId);
        const events = await db
          .select()
          .from(agentEvents)
          .where(eq(agentEvents.runId, runId))
          .orderBy(asc(agentEvents.seq));
        return rowToRun(row, events);
      } catch (err) {
        console.error("[runStore] get DB read failed", err);
      }
    }
    return this.memory.get(runId);
  }

  async list(limit = 20, options: { userId?: string } = {}): Promise<Run[]> {
    if (hasDatabase) {
      try {
        const rows = await db.query.agentRuns.findMany({
          where: options.userId
            ? eq(agentRuns.userId, options.userId)
            : undefined,
          orderBy: [desc(agentRuns.startedAt)],
          limit,
        });
        // Skip event rehydration for list view — page only needs metadata.
        return rows.map((row) => rowToRun(row, []));
      } catch (err) {
        console.error("[runStore] list DB read failed", err);
      }
    }
    const all = Array.from(this.memory.values());
    const filtered = options.userId
      ? all.filter((r) => r.userId === options.userId)
      : all;
    return filtered
      .sort((a, b) => b.startedAt - a.startedAt)
      .slice(0, limit);
  }

  /** Synchronous — listeners are in-process closures from the SSE handler. */
  subscribe(runId: string, fn: Listener): () => void {
    let set = this.listeners.get(runId);
    if (!set) {
      set = new Set();
      this.listeners.set(runId, set);
    }
    set.add(fn);
    return () => {
      set?.delete(fn);
      if (set && set.size === 0) this.listeners.delete(runId);
    };
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __ENGINERD_AGENT_STORE__: AgentRunStore | undefined;
}

export const runStore: AgentRunStore =
  globalThis.__ENGINERD_AGENT_STORE__ ?? new AgentRunStore();

if (process.env.NODE_ENV !== "production") {
  globalThis.__ENGINERD_AGENT_STORE__ = runStore;
}
