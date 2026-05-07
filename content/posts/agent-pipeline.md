---
title: How I built a 5-stage Hinglish content pipeline with Claude
date: 2026-05-05
description: A production-grade agentic system that turns one industry name into a complete career roadmap with 100K+ lines of structured Hinglish lessons. Tool-use, stub mode, durable run + event tables, and per-stage cost telemetry.
readingTimeMinutes: 9
---

# How I built a 5-stage Hinglish content pipeline with Claude

Most agent-pipeline posts you read in 2026 are toy demos: one prompt, one model, "and then we orchestrate." That is not what gets shipped to users. This is a write-up of an actual production pipeline — running today inside [EngiNerd](/) — that takes one input (an industry name like "backend engineering") and produces a complete career-roadmap → subjects → topics → subtopics tree, with **structured Hinglish lessons** under every leaf, in a single observable run.

It cost about three weeks to build, runs in under a minute end-to-end on cached prompts, and ships with offline test fixtures so the entire pipeline can be exercised in CI without an Anthropic API key.

This post walks through the design, the parts that turned out to matter, and the parts I'd do differently.

---

## The shape

Five stages. Three of them are LLM calls; two are pure local logic.

```
Trend Researcher  ─►  Subject Mapper  ─►  Topic Deepdiver  ─►  Hinglish Writer  ─►  Quality Orchestrator
   (smart)             (smart)             (smart)              (smart)             (local — no LLM)
   industry            career              subject             subtopic             content blocks

   "Indian             "Backend            "Spring Boot         "Spring DI            { what, why, how,
    engineering          engineer"           Basics"              vs            →       example, diagram,
    students"        →  + 7 others       →  + 9 other         →  Constructor           interview }
                        as candidates        subjects            Injection"            (validated)
```

Each stage's output is the next stage's input. Fan-out happens twice: Stage 2 → Stage 3 (parallel across all subjects), and Stage 3 → Stage 4 (parallel across the cartesian product of subjects × topics × subtopics — which is where the parallelism actually pays off).

The whole tree publishes atomically to `library_roadmaps` — one row per generated roadmap, with the full subject tree as JSONB. UI surfaces consume that table.

---

## Why five stages instead of one mega-prompt

I tried the obvious thing first: one giant prompt that takes an industry and emits the whole tree. Three issues showed up immediately.

**1. Schema sprawl.** The output schema for a single mega-prompt would have ~7 nested levels (industry → 8 candidate careers → 8 subjects each → 5 topics × 3 subtopics × 7 content blocks). Claude's tool-use is reliable on flat-ish schemas; on deep nested unions the structured output drifts.

**2. No partial output.** When the prompt fails on subtopic #142, you get nothing. Five stages means subtopic #142 fails, but subtopics #1-141 are committed and revisitable. The cost of a run becomes the cost of the failing leaf, not the whole tree.

**3. Cost rationing.** Some stages need quality (the Hinglish prose generation); some need speed (the trend researcher's "rank these careers"). With five stages I can use Sonnet 4.6 for the things that need quality and Haiku 4.5 for the rest. With one prompt, you pay Sonnet for every token.

So: five stages, narrow schemas, parallel where independent.

---

## The LLM wrapper (`lib/llm.ts`)

Every LLM call in the pipeline goes through one function:

```ts
export async function generateStructured<T>(input: GenerateInput<T>): Promise<{
  output: T;
  usage: Usage;
  mode: "live" | "stub";
  model: string;
}>
```

Inputs: `tier` ("smart" | "fast"), `agentName`, `systemPrompt`, `userPrompt`, an optional `cacheableUserPrefix` (for ephemeral prompt-cache breakpoints), and the tool-use trio: `toolName` + `toolDescription` + `inputSchema` + `validate`.

Three things this wrapper buys you:

**Structured output via tool-use, not JSON-mode.** I tried response-format `json` first; the validation-rejection rate was around 4-7%. Tool-use ("call this tool with these args") drops the rejection rate to <0.5% on the same prompts. The Anthropic SDK validates against the JSON Schema before it returns, and Claude is trained to call tools with valid arguments — it's not the same code path as "produce JSON in a string."

**Stub mode.** If `ANTHROPIC_API_KEY` is unset, every `generateStructured` call returns the result of its `stub: () => T` function instead of hitting the network. The five-stage pipeline runs end-to-end against deterministic fixtures in about a second. That's not just a CI win — it's a *local-dev* win. You can rebuild the entire pipeline on a flight with no internet and watch the events stream past on the dashboard.

**Cost telemetry per call.** The wrapper returns `usage: { inputTokens, outputTokens, cacheReadTokens, cacheCreationTokens, costUsd }`. Every stage records its cost into a per-agent + total summary, so the dashboard shows you "this run cost $0.073, of which subject-mapper was $0.014 and Hinglish-writer was $0.052." That number is non-negotiable in production — without it you ship a feature, watch the bill, and have no idea which agent regressed.

---

## The Hinglish Writer — where most of the work lives

The Hinglish Writer is the hardest of the five stages. Its job: given a subtopic title (e.g., "Spring DI vs Constructor Injection"), emit 5–8 structured content blocks in a Hindi-Roman code-switching voice (Hinglish), where:

- Every block has a typed shape (`what` | `why` | `how` | `example` | `diagram` | `interview`)
- Each shape has its own schema — `how` blocks may have a `code` field; `diagram` blocks must contain valid Mermaid; `interview` blocks have `question` + `answer`
- The Hinglish ratio is enforced — too much English is a fail; too much Hindi is a fail

I tried two approaches:

**Approach A:** "Write in Hinglish" instruction in the system prompt, no validator.

This produced pure Hindi half the time and Marketing English the other half. The prompt was correct; the model couldn't tell where on the spectrum to land without a concrete signal.

**Approach B:** Add a regex-based ratio check after the LLM call. If <15% Hindi-roman tokens, reject and retry once.

This worked but felt expensive — a regex rejection costs another full LLM round-trip.

**The fix that landed:** add a 60/40 ratio target *with examples* in the system prompt, plus a post-call validator that's lenient (≥15%, not strictly 60). The examples carry more weight than any abstract instruction; the lenient validator only catches the egregious failures.

This shows up in the audit log as `quality.hinglish_ratio`, computed by the (local, no-LLM) Quality Orchestrator stage. Across 472 runs the rejection rate is around 2.1%.

---

## The Quality Orchestrator — why it's local

Stage 5 has no LLM call. It does three things in plain JavaScript:

1. Tokenize the prose body and check the Hinglish ratio against a regex of common Hindi-roman tokens (`hai`, `kya`, `bhai`, `samjho`, `dekh`, …).
2. Validate every code block has a recognized language (`java`, `python`, `js`, `cpp`, `sql`, `go`, `kotlin`, …).
3. Confirm the block-type coverage — at minimum one of `{what, why, how}` must be present.

Why local: an LLM-based quality check would be ~$0.003 per subtopic × ~2,000 subtopics per run = $6 just on quality. The deterministic check costs $0 and is faster. The interesting thing is that the failure modes a regex catches are exactly the failure modes the LLM was generating — overly-English explanations, missing code, missing the "what is this" beat. There is *some* class of failure (factual drift, subtle voice problems) the regex misses; we mark those `needs_review` and surface them to the admin dashboard for human eyes.

Net: the pipeline emits two states — `published` and `needs_review` — and only `published` becomes user-visible.

---

## Run + event durability

This is the part that turned out to matter most for shipping confidence.

Two tables:

```
agent_runs    (id, user_id, status, mode, input, summary, generated, started_at, ended_at, cost_usd)
agent_events  (run_id, seq, type, payload, created_at)   -- ~30-100 rows per run
```

Every emit (run start, agent start, agent complete, agent fail, queue depth, run complete) goes through one function:

```ts
function emit(runId: string, event: AgentEvent) {
  void runStore.emit(runId, event);   // synchronous in-memory + async DB write
}
```

The `runStore.emit` is special: it notifies in-memory SSE listeners *first* (so the dashboard sees the event with zero added latency), *then* writes to the DB. If the DB write fails, the run continues — the event ends up in `audit_events` so the SRE dashboard catches it, but the user's run isn't blocked on a Neon hiccup.

Why this matters:

- **Replay.** If a run fails on subtopic #142, the events for subtopics #1-141 are durable. I can resume from #142 instead of redoing the whole tree.
- **SSE with reconnects.** When the user's WiFi flaps, the SSE stream replays history from `agent_events` on reconnect — `send("hello", { runId, status, mode })` then loops over `run.events` before subscribing to live events. The reconnect is invisible.
- **Free observability.** The event log is the audit trail. When a customer says "my generation failed at 11:42 PM," I have the per-event timeline + per-agent cost breakdown without needing Sentry.

There is a tradeoff: every run is ~30-100 row inserts into `agent_events`. For 1000 runs/day that's around 50,000 rows/day — well within Neon's free tier and almost free at scale. The alternative ("emit logs to Logflare") would have been cheaper at high volume, but I would have lost the in-DB queryability that lets `/changelog`-style dashboards work without a third-party datastore.

---

## What I'd do differently

Two things, both about scale.

**1. Move from in-process fan-out to a real queue.** Stage 4's parallelism is currently bounded by a `Promise.all` inside the run handler. That's fine for trees of <500 subtopics; past that, you want BullMQ or Inngest so a single Vercel function timeout doesn't cancel the whole tree. Phase 4.5 in the comments references this; it's the next refactor.

**2. Stage-level retry policy.** Today, a stage failure fails the run. I'd add a 1-shot retry with backoff at the `timed()` wrapper level — the same pattern I shipped for OTP send (Resend / MSG91 each get one 500ms-backoff retry). Most LLM failures are transient.

---

## What you can take from this

If you're shipping an agentic feature for production:

- **Use tool-use for structured output**, not JSON-mode. The reliability gap is real.
- **Build a stub-mode wrapper from day 1.** It's the difference between fast tests and slow tests, and the difference between "I can build on a flight" and "I can't."
- **Track cost per stage from day 1.** Not aggregate cost. Per-stage. You will not regret it.
- **Make the event log durable + replayable.** SSE reconnects are easy when the events are in a table; brutal when they're in memory.
- **Local validators where you can.** Every $0.003-per-call you can do with a regex is $0.003 you don't ship to OpenAI.
- **Five narrow stages over one mega-stage.** Schema-fitness is the underrated reason tool-use works at all.

The whole pipeline is at [`lib/agents/`](https://github.com/Shrivaujjawal321/enginerd/tree/main/lib/agents) in the EngiNerd repo. Each agent is its own file, the wrapper is at `lib/llm.ts`, the run store is at `lib/agents/store.ts`. Read the cycle reports at [`/changelog`](/changelog) for the build history.

If you're hiring for production AI work, [I'm on the market](/about).
