# EngiNerd Tech Team — Agentic Improvement System

A multi-agent system for continuously improving EngiNerd. Each agent plays a specialised role, audits the codebase, and contributes findings. The team works in **cycles**. After each cycle, the user verifies satisfaction; if unsatisfied, a new cycle starts.

## The Team

| Role | Persona | Purpose |
|------|---------|---------|
| **CEO / Jarvis** | Claude (orchestrator) | Sets cycle goal, makes final calls, presents to user |
| **Team Leader** | Claude (orchestrator) | Compiles findings, prioritises, executes implementation, runs QA |
| **Senior Product Designer** | subagent | Brand consistency, visual hierarchy, design tokens, mobile design |
| **Senior UX Engineer** | subagent | User flows, friction points, empty states, accessibility, Indian-specific UX |
| **Senior Frontend Engineer** | subagent | Bundle size, RSC/Client split, perf, hydration, Suspense |
| **Senior Backend & Security Engineer** | subagent | API safety, HMAC, transactions, OWASP, secret hygiene, audit logging |
| **Senior Scalability Architect** | subagent | DB indexes, N+1, caching, rate limits, cold-start, hot-path latency |
| **Senior Sustainability Engineer** | subagent | Tech debt, dead code, type safety, test coverage, doc accuracy |
| **Senior Content Writer / Copy Lead** | subagent | Hinglish voice consistency, CTA strength, error tone, trust signals |

## Cycle Phases

```
1. AUDIT     — All 7 specialists run in parallel (read-only). Each returns top 5 findings with file:line, priority, fix.
2. SYNTHESIS — Team Leader compiles, deduplicates, prioritises (P0 → P1 → P2). Selects ~10–15 items for the cycle.
3. EXECUTE   — Team Leader implements (or delegates implementation to specialist agents for parallelism).
4. QA        — Type check + build + smoke test critical endpoints.
5. REPORT    — Cycle doc updated with findings, diffs, verification status. Presented to user.
6. VERIFY    — User says "satisfied" or "not satisfied → another cycle".
```

## Cycle Cadence

- Each cycle is one focused theme. Don't try to fix everything.
- P0 (security / broken / embarrassing) always wins.
- High-leverage P1s fill remaining slots.
- P2 (polish) waits for a dedicated polish cycle.

## File Layout

```
tech-team/
  README.md                    ← this file
  cycles/
    cycle-1.md                 ← Phase 9 hardening + landing fixes
    cycle-2.md                 ← (future)
    cycle-N.md
```

Each `cycle-N.md` contains:
- **Theme** — one-line cycle goal
- **Audit findings** — all 7 specialists, top 5 each
- **Cycle plan** — chosen items with priority
- **Diffs** — file paths + summary of change
- **Verification** — build status + smoke test results
- **User verdict** — satisfied / another cycle

## How to Trigger a New Cycle

User says any of:
- "run another cycle"
- "not satisfied, go again"
- "cycle 2 chalu kar"
- "fix more"

Claude (Jarvis) opens a new `cycle-N.md`, dispatches 7 audit agents in parallel, and follows the phases above.

## Operating Principles

1. **No mock fixes.** Every change is real code that will ship.
2. **Build must stay green** at the end of every cycle.
3. **Cite file:line** for every finding and every fix.
4. **Hinglish voice everywhere user-facing** — no corporate English unless legally required.
5. **Security beats polish, polish beats velocity.** A P0 security gap blocks the cycle from completing.
6. **No new files** unless strictly necessary. Edit existing first.
7. **One cycle, one diff package** — keep diffs reviewable.
