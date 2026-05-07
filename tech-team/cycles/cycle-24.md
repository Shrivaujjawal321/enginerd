# Cycle 24 — Hireable surfaces (`/about`, `/posts/agent-pipeline`, resume artefacts)

**Date:** 2026-05-05
**Theme:** Cycle 23 made the existing work *legible*. Cycle 24 makes it *DM-able to recruiters*. Three new surfaces — a clean `/about` page (the hire-me CTA), a 1500-word technical deep-dive at `/posts/agent-pipeline` (the link to send to senior engineering hiring managers), and a `tech-team/resume-bullets.md` file with copy-paste-ready résumé / LinkedIn / cold-email templates.

---

## 1. Why this cycle

Cycle 23's `/changelog` shows velocity + judgment. `ARCHITECTURE.md` shows depth. Both live on the site, both are scannable in 90 seconds. What was still missing:

1. **A "hire me" landing surface** — recruiters scanning `/changelog` need a one-click path to the candidate's identity, role expectations, contact, and resume.
2. **One technical deep-dive** with senior-engineer-grade detail. The cycle reports are great for velocity-narrative but they're 22 different stories; recruiters want one focused write-up they can DM their team.
3. **Copy-paste artefacts** so the candidate can apply / reach out without re-writing the project description every time.

Cycle 24 ships all three.

---

## 2. Cycle plan — 5 items + QA

| Tag | Subject | Owner |
|-----|---------|-------|
| **C24-1** | `/about` page — name + tagline + role/location/comp expectations + 4 highlight cards + 5 skill-stack cards + final CTA | Jarvis |
| **C24-2** | `content/posts/agent-pipeline.md` — 1500-word deep-dive on the 5-stage Hinglish content pipeline | Jarvis |
| **C24-3** | `lib/posts.ts` + `app/(marketing)/posts/[slug]/page.tsx` — generic posts route, frontmatter parsing, mirrors `lib/changelog.ts` pattern | Jarvis |
| **C24-4** | `tech-team/resume-bullets.md` — 1-line / 3-line / paragraph variants + LinkedIn-post draft + recruiter-email + DM templates | Jarvis |
| **C24-5** | Wire `/about` + `/posts/agent-pipeline` into navbar + footer (footer expanded to 3 columns: Product · Build log · Legal) | Jarvis |
| **CYCLE-24** | `e2e/about-and-posts.spec.ts` (5 cases) + tsc + build + this report | Jarvis |

---

## 3. Diffs

### C24-1 — `/about`

```
app/(marketing)/about/page.tsx                NEW   ~270 lines

  Top: PROFILE + LOOKING_FOR + HIGHLIGHTS + SKILLS constants
       (one-place edits before deploy — name / email / linkedin / github / resume)
  Header: name + tagline + 4 contact CTAs (mailto, LinkedIn, GitHub, Resume)
  "What I'm looking for" — 3-column GlassCard (roles / location / comp)
  "What I've built" — 4 highlight cards (EngiNerd ship · agent pipeline ·
                       polymorphic learning · hardened-the-unsexy-stuff)
                       with explicit links to /changelog, ARCHITECTURE.md,
                       /posts/agent-pipeline
  "Stack I reach for" — 5 skill cards (Frontend · Backend · AI/LLM · Infra · Quality)
  Final CTA: GlassCard with primary mailto button

  Inline GitHub + LinkedIn brand SVGs (lucide-react no longer ships these
  icons — trademark concerns — and we deleted the old brand-icons.tsx in C19).
```

### C24-2 — Technical deep-dive (`content/posts/agent-pipeline.md`)

```
content/posts/agent-pipeline.md               NEW   ~210 lines  (~9-min read)

  Frontmatter: title / date / description / readingTimeMinutes
  Sections:
    The shape (ASCII diagram of the 5 stages)
    Why five stages instead of one mega-prompt (schema sprawl, partial output, cost rationing)
    The LLM wrapper (lib/llm.ts) — tool-use over JSON-mode, stub mode, per-call cost telemetry
    The Hinglish Writer — block-type schema, the 60/40 ratio problem,
                          the post-call validator that lands
    The Quality Orchestrator — why it's local (no LLM, no $6/run cost)
    Run + event durability — agent_runs + agent_events, SSE replay on reconnect,
                              "the event log is the audit trail"
    What I'd do differently — BullMQ migration, stage-level retry policy
    What you can take from this — 6 concrete takeaways for production agentic systems

  Closes with links to lib/agents/, /changelog, /about
```

### C24-3 — Posts infra (`lib/posts.ts` + `[slug]` route)

```
lib/posts.ts                                  NEW   ~115 lines

  parseFrontmatter(raw)        // splits ---\n…\n--- block from body
  stripLeadingH1(source)       // mirrors changelog detail page; drops dup H1
  listPosts() / getPost(slug)  // both unstable_cache wrapped, 1h TTL,
                                  tags ['posts', 'post:<slug>']

app/(marketing)/posts/[slug]/page.tsx         NEW   ~75 lines

  generateStaticParams: pre-renders every post in content/posts/
  Header: title + date + reading-time + description
  Body: MarkdownRenderer over post.body (frontmatter + leading H1 already stripped)
  "Back to about" breadcrumb link
```

### C24-4 — Résumé / outreach artefacts

```
tech-team/resume-bullets.md                   NEW   ~125 lines

  - One-line summary
  - Three-line resume-project-entry
  - Paragraph cover-letter / DM body
  - LinkedIn announcement-post draft
  - Cold-email-to-recruiter template
  - DM-to-founder template
  - Notes on filling them in (what to swap before sending)
```

### C24-5 — Nav + footer wiring

```
components/marketing/navbar.tsx               NAV_LINKS now includes /about
                                              (Careers dropped from nav — keeps width tight;
                                               Careers stays reachable via /careers
                                               from any subject footer + footer Product col)

components/marketing/footer.tsx               grid-template upgraded: 2fr_1fr_1fr → 2fr_1fr_1fr_1fr
                                              + new "Build log" column:
                                                 Changelog · Agent pipeline (deep-dive) · About me
                                              + Product column drops Changelog (it's now in Build log)
```

---

## 4. Verification

### Type check + build
```
npx tsc --noEmit                              ✓ exit 0, clean
                                              (caught Github/Linkedin not exported from
                                               lucide-react; switched to inline SVG marks)
npm run build                                 ✓ Compiled in 34.4s
                                              ✓ Generating static pages (537/537)
                                                (was 535; +2 = /about + /posts/agent-pipeline)
```

### Tests
```
npm test  (vitest)                            ✓ 9 files / 68 tests   (no change)
npx playwright test                           ✓ 52 / 52 passing, ~48s
                                                (was 47/47; +5 about-and-posts cases)
```

### Smoke (manual, dev server live at http://localhost:3000)
- `/about` — name + tagline + 4 contact buttons (mailto / LinkedIn / GitHub / Resume); 3-col looking-for card; 4 highlight cards; 5 skill cards; final CTA. ✓
- `/posts/agent-pipeline` — deep-dive renders, reading-time + date show, code blocks highlighted, prev/back link works. ✓
- Navbar shows About + Changelog. ✓
- Footer has 3 columns: Product · Build log · Legal. ✓
- `/posts/this-doesnt-exist` → 404. ✓

---

## 5. Counters

| Metric | C23 | **C24** | Δ |
|--------|-----|---------|---|
| Vitest tests | 68 | **68** | 0 |
| Playwright e2e files | 19 | **20** | +1 |
| Playwright e2e | 47 | **52** | +5 |
| Static pages built | 535 | **537** | +2 |
| Public marketing pages | 34 | **36** | +2 |
| Hire-me artefacts | 0 (just /changelog + ARCHITECTURE) | **3 surfaces + 6 templates** | unlocked |

---

## 6. The 90-second hiring-manager funnel (now end-to-end)

| Sec | Surface | What they see |
|---|---|---|
| 0–10 | `/` | Hero + tagline + "what is this" |
| 10–30 | `/changelog` (top nav) | 24 cycle cards, dates, themes — velocity is obvious |
| 30–60 | `/about` | Identity + role/location/comp + 4 highlights + skills + contact |
| 60–120 | `/posts/agent-pipeline` (linked from /about + footer) | Senior-engineer-grade deep-dive — depth signal |
| 120–300 | GitHub repo · README.md · ARCHITECTURE.md | Scannable codebase, decisions documented |

Every surface in the funnel exists today. Nothing else needs to ship before the candidate sends the first cold email.

---

## 7. Deferred to cycle 25

### Operational (the candidate does these, not Jarvis)
- **Deploy.** Push the repo to Vercel. Replace `<your-deploy>` placeholders in `tech-team/resume-bullets.md` with the live URL.
- **Edit `PROFILE` constants in `app/(marketing)/about/page.tsx`** to match real LinkedIn / GitHub / resume URLs and email.
- **Drop a real `public/resume.pdf`** so the Resume button on `/about` works.
- **Record a 3-minute Loom demo** (referenced in earlier cycle plans) — embed on `/` or link from `/about`.

### Engineering — `/studio` (the AI flagship)
- User types any topic → 1-call LLM pipeline writes structured Hinglish blocks → `upsertSubjectContent` (cycle 22 surface) → existing reader + cycle-21 format tabs render. Press-headline material once the legibility cycle is in.

### Polish (only if there's time before applying)
- View transitions (Next 16 native) on subject + changelog routes.
- Dynamic OG images per `/posts/[slug]` and `/changelog/[cycle]`.
- Lighthouse 100s sweep on `/`, `/about`, `/changelog`, `/posts/agent-pipeline`.

---

## 8. User verdict

> **Pending — awaiting verification.**

What changed this cycle:
- **`/about`** — the hire-me page exists. Edit 6 constants and it's accurate. Final CTA points at email.
- **`/posts/agent-pipeline`** — 1500-word technical deep-dive on the 5-stage pipeline. The link to DM senior engineering hiring managers.
- **`tech-team/resume-bullets.md`** — six copy-paste templates: one-line, three-line, paragraph, LinkedIn-post draft, recruiter-email, founder-DM. With a "what to swap before sending" note.
- **Nav + footer** — `/about` and `/posts/agent-pipeline` are now reachable from every public page.
- **52/52 playwright** (+5), **537 static pages** (+2), **build green**.

The hiring-manager funnel is now end-to-end. The candidate's next move is operational, not Jarvis's.

Cycle report at `tech-team/cycles/cycle-24.md`. Dev server live at http://localhost:3000 — start at `/about`.
