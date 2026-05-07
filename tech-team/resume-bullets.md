# Resume bullets — EngiNerd

Copy-paste-ready descriptions of EngiNerd at three lengths, plus ready-to-post LinkedIn copy. Edit the comp band / role title / location to match the role you're applying to.

---

## One-line (resume header / summary line)

> Shipped EngiNerd end-to-end (solo) — Next.js 16 + Postgres + Anthropic — a Hinglish-first placement-prep platform for Indian engineers, with a 5-stage LLM content pipeline, polymorphic learning surface, and a public 24-cycle build retrospective.

---

## Three-line (resume project entry)

> **EngiNerd** — Hinglish-first placement-prep platform for Indian engineering students. *Solo full-stack ship.*
>
> - Built the entire stack: Next.js 16 RSC, TypeScript strict, Drizzle + Neon Postgres, Upstash Redis, Razorpay payments, Anthropic Claude. 47 e2e tests, 68 vitest cases, public cycle retrospective at `/changelog`.
> - Designed a 5-stage LLM agent pipeline (trend-research → subject-map → topic-deepdive → Hinglish-writer → quality-orchestrator) with structured tool-use, ephemeral cache, stub mode for offline tests, durable run + event tables, SSE-streamed progress, per-stage cost telemetry.
> - Polymorphic learning surface: same markdown source renders as Read · Slides · Mindmap · Flashcards via pure-function transforms; URL-state for shareable views; tab-clicks feed a per-user learning-style profile.

---

## Paragraph (cover-letter / DM body)

> Over the last three weeks I designed, built, and shipped **EngiNerd**, a Hinglish-first learning platform for Indian engineering students. It's running end-to-end with real auth (phone + email OTP, Google OAuth), real payments (Razorpay subscriptions with HMAC-verified webhooks and idempotent capture), real content (~105K lines of structured Hinglish lessons across 103 subjects, 469 DSA problems with a sandboxed code runner), and a real production LLM pipeline (5 stages, structured tool-use, durable run + event tables, stub mode for offline CI). The build was disciplined — 24 cycles of audit → synthesis → execute → verification, every cycle ending green, with retracted audit claims documented when verification disagreed with a specialist agent. The cycle log is public at `/changelog`; the architecture is at `ARCHITECTURE.md`; one technical deep-dive on the agent pipeline lives at `/posts/agent-pipeline`.
>
> Stack: Next.js 16 (App Router, RSC, Turbopack), TypeScript strict, Drizzle ORM, Neon Postgres, Upstash Redis, Anthropic Claude (Sonnet 4.6 + Haiku 4.5), Razorpay, MSG91, Resend, Sentry, PostHog, Vercel, GitHub Actions, Vitest, Playwright. The whole thing runs in offline / stub mode without an API key.
>
> I'm looking for senior full-stack or founding-engineer roles in Bengaluru (or remote-friendly). Live demo at `<your-deploy>`; code at `https://github.com/Shrivaujjawal321/enginerd`; reach me at ratneshs230@gmail.com.

---

## LinkedIn-post draft (announcing the project)

> I shipped **EngiNerd** — a Hinglish-first learning platform for Indian engineering students. End-to-end, solo, in three weeks of disciplined cycles.
>
> What's inside:
> - Next.js 16, TypeScript, Drizzle + Neon Postgres, Razorpay, Anthropic Claude
> - A 5-stage LLM content pipeline that turns one industry name into a complete career roadmap with structured Hinglish lessons under every leaf
> - A polymorphic learning surface — same markdown renders as Read · Slides · Mindmap · Flashcards (pick the format that fits your brain)
> - A per-user learning-style profile that watches which format you reach for and adapts
> - 469 original DSA problems with a sandboxed code runner
> - Real auth, real payments, real audit trail, real rate-limit tiers, real WCAG-AA discipline
> - 24-cycle build-in-public retrospective at `/changelog`
> - 47 e2e tests + 68 unit tests + green builds
>
> The whole thing is documented end-to-end. Architecture at `ARCHITECTURE.md`. One deep-dive on the agent pipeline at `/posts/agent-pipeline`. Code at `https://github.com/Shrivaujjawal321/enginerd`.
>
> I'm looking for senior full-stack / founding-engineer roles. If your team builds production AI features for the Indian market, let's talk. ratneshs230@gmail.com
>
> #fullstack #nextjs #anthropic #indianstartups #hireme

---

## Email-to-recruiter template (cold outreach)

> **Subject:** Senior full-stack — built EngiNerd end-to-end
>
> Hi <name>,
>
> I've been following <company>'s product for a while; the work on <one-specific-thing> stood out. I'm reaching out because you might be hiring senior full-stack or founding engineers — I just shipped a project that demonstrates the kind of work I'd want to do at <company>.
>
> EngiNerd is a Hinglish-first learning platform for Indian engineering students — Next.js 16, Postgres, Anthropic Claude, Razorpay. I built it solo in three weeks, end-to-end, including a 5-stage LLM content pipeline and a polymorphic learning surface that lets each user consume the same content as slides / mindmap / flashcards / read. The build is documented at `/changelog` (24 retrospectives) and `ARCHITECTURE.md`. Live demo and code below.
>
> If there's a fit, I'd love a 25-minute conversation.
>
> - **Live:** <your-deploy>
> - **Code:** https://github.com/Shrivaujjawal321/enginerd
> - **About me:** <your-deploy>/about
> - **Deep-dive on the agent pipeline:** <your-deploy>/posts/agent-pipeline
>
> Thanks,
> Ujjwal Shrivastava
> ratneshs230@gmail.com

---

## DM-to-founder template (Twitter / LinkedIn cold reach)

> Hi <name> — I built [EngiNerd](<your-deploy>) end-to-end (solo) — Hinglish placement platform with a 5-stage LLM pipeline + polymorphic learning surface (same markdown → slides / mindmap / flashcards). Build log at `/changelog`. If <company> is hiring senior full-stack, I'd love to chat.

---

## Notes on filling these in

- Replace `<your-deploy>` with the production URL once deployed.
- The "three weeks" duration is the actual cycle-1 → cycle-24 calendar window. Adjust if more cycles ship.
- The 469 / 68 / 47 numbers are accurate as of cycle 24 — bump them as the test counts grow.
- The LinkedIn post is intentionally one screen long. Don't add screenshots — the link preview from `/about` carries the visual.
- Keep the comp band off the public LinkedIn post; surface it on `/about` (the `LOOKING_FOR.comp` constant) so recruiters self-select.
