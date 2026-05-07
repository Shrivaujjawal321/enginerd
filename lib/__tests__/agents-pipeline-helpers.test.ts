import { describe, expect, it } from "vitest";
import {
  AGENT_NAMES,
  ZERO_USAGE,
  emptyDepths,
  initSummary,
  recordUsage,
} from "@/lib/agents/pipeline-helpers";
import type { Usage } from "@/lib/llm";

const usage = (over: Partial<Usage> = {}): Usage => ({
  inputTokens: 0,
  outputTokens: 0,
  cacheReadTokens: 0,
  cacheCreationTokens: 0,
  costUsd: 0,
  ...over,
});

describe("AGENT_NAMES", () => {
  it("enumerates all 5 agent stages in pipeline order", () => {
    expect(AGENT_NAMES).toEqual([
      "trend-researcher",
      "subject-mapper",
      "topic-deepdiver",
      "hinglish-writer",
      "quality-orchestrator",
    ]);
  });
});

describe("ZERO_USAGE", () => {
  it("is an all-zero usage record", () => {
    expect(ZERO_USAGE).toEqual({
      inputTokens: 0,
      outputTokens: 0,
      cacheReadTokens: 0,
      cacheCreationTokens: 0,
      costUsd: 0,
    });
  });
});

describe("emptyDepths", () => {
  it("returns a fresh zero-depth map keyed by every agent name", () => {
    const depths = emptyDepths();
    for (const name of AGENT_NAMES) {
      expect(depths[name]).toBe(0);
    }
  });

  it("returns a new object on every call (no shared mutable state)", () => {
    const a = emptyDepths();
    const b = emptyDepths();
    a["trend-researcher"] = 7;
    expect(b["trend-researcher"]).toBe(0);
  });
});

describe("initSummary", () => {
  it("creates a zeroed summary with one perAgent slot per agent", () => {
    const s = initSummary();
    expect(s.totals.subjects).toBe(0);
    expect(s.totals.costUsd).toBe(0);
    for (const name of AGENT_NAMES) {
      expect(s.perAgent[name]).toBeDefined();
      expect(s.perAgent[name].callCount).toBe(0);
      expect(s.perAgent[name].usage).toEqual(ZERO_USAGE);
    }
  });
});

describe("recordUsage", () => {
  it("aggregates a single call into perAgent + totals", () => {
    const s = initSummary();
    recordUsage(
      s,
      "hinglish-writer",
      usage({
        inputTokens: 100,
        outputTokens: 200,
        cacheReadTokens: 50,
        cacheCreationTokens: 10,
        costUsd: 0.0123,
      }),
      400,
    );
    expect(s.perAgent["hinglish-writer"].callCount).toBe(1);
    expect(s.perAgent["hinglish-writer"].successCount).toBe(1);
    expect(s.perAgent["hinglish-writer"].totalDurationMs).toBe(400);
    expect(s.perAgent["hinglish-writer"].usage.inputTokens).toBe(100);
    expect(s.perAgent["hinglish-writer"].usage.costUsd).toBe(0.0123);
    expect(s.totals.inputTokens).toBe(100);
    expect(s.totals.outputTokens).toBe(200);
    expect(s.totals.costUsd).toBe(0.0123);
  });

  it("sums across multiple calls and rounds costUsd to 6 decimals", () => {
    const s = initSummary();
    recordUsage(s, "trend-researcher", usage({ costUsd: 0.0000005 }), 10);
    recordUsage(s, "trend-researcher", usage({ costUsd: 0.0000005 }), 10);
    expect(s.perAgent["trend-researcher"].callCount).toBe(2);
    // Each call rounds individually, so 0.0000005 → 0.000001, then
    // 0.000001 + 0.0000005 rounds to 0.000002. Documents the running-round
    // behaviour as specified.
    expect(s.perAgent["trend-researcher"].usage.costUsd).toBe(0.000002);
    expect(s.totals.costUsd).toBe(0.000002);
  });

  it("rounds totals.costUsd to 6 decimals on each call", () => {
    const s = initSummary();
    recordUsage(s, "trend-researcher", usage({ costUsd: 0.0000004 }), 1);
    // 0.0000004 → rounds to 0 in 6-decimal precision.
    expect(s.totals.costUsd).toBe(0);
    recordUsage(s, "trend-researcher", usage({ costUsd: 0.0000007 }), 1);
    // 0 + 0.0000007 → 0.000001 (rounded).
    expect(s.totals.costUsd).toBe(0.000001);
  });

  it("keeps perAgent buckets independent (no cross-contamination)", () => {
    const s = initSummary();
    recordUsage(s, "trend-researcher", usage({ inputTokens: 1 }), 1);
    recordUsage(s, "subject-mapper", usage({ inputTokens: 2 }), 2);
    expect(s.perAgent["trend-researcher"].usage.inputTokens).toBe(1);
    expect(s.perAgent["subject-mapper"].usage.inputTokens).toBe(2);
    expect(s.perAgent["topic-deepdiver"].usage.inputTokens).toBe(0);
    // Totals reflect both.
    expect(s.totals.inputTokens).toBe(3);
  });
});
