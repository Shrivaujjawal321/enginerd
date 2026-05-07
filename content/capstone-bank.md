# 20-Project Capstone Bank

Yaar, sun le. Tu 600 LeetCode problems solve kar chuka hai, Striver sheet 80% done, OS-DBMS notes ekdum tight — but jab recruiter tera GitHub kholta hai aur dekhta hai *"todo-app", "calculator-react", "tic-tac-toe", "weather-app"* — bhai, scroll karke chala jata hai. 6 second mein decision: this kid built tutorials, not products. **Reject.**

Ye subject Layer 4 hai — "Build". Layer 1-3 (DSA, CS fundamentals, system design) tujhe interview tak le ja sakte hain, but **portfolio** decide karta hai ki tu shortlist hua ya nahi. Recruiter ke saamne 200 resumes hain — tujhe stand out ek **deployed link**, ek **clean README**, aur ek **non-trivial feature** se hi karna padega. Iss doc mein 20 portfolio-grade project ideas hain across MERN, backend, mobile, ML, DevOps, systems, AI — har ek ka stack, time estimate, build outline, resume bullet, aur common gotcha.

Read end-to-end. Phir 3 projects choose kar (alag-alag tracks se if you're confused about your specialisation, same track se if you're sure). 90 din ka plan section 10 mein hai. Ek baar 3 projects ship kar diye — deployed, README polished, resume bullets quantified — tera profile top 10% mein aa jata hai automatically. Promise.

---

## 1. Why capstone projects beat coding contests

Pehli baat clear kar de: LeetCode rating, Codeforces specialist, GFG 200-problems badge — **inka resume pe utna weight nahi hai jitna tujhe lagta hai**. Specifically for product companies (Razorpay, Swiggy, Atlassian, Microsoft, Amazon), recruiters ka ranking roughly aisa hota hai:

1. Internship at a real company (FAANG, Indian unicorn, well-funded startup)
2. **Deployed portfolio projects with quantified impact**
3. Hackathon wins (with deployed product, not just slides)
4. Open-source contributions (merged PRs in known repos)
5. Coding contest ratings (Expert+ on CF, 4-star+ on CodeChef)
6. CGPA / college brand
7. Certifications (lowest weight unless industry-specific like AWS Solutions Architect)

Notice projects are #2 — only an actual job beats them. Aur tu has-been internship nahi hai college 2nd-3rd year mein, to projects hi tera #1 lever hain.

### The GitHub heatmap reality

Recruiter teri GitHub profile khol ke 3 cheezen dekhta hai:

- **Heatmap** — green squares last 6 months mein. Agar empty hai, tu coder nahi, syllabus-rattu hai. Daily-ish commits chahiye, even if small.
- **Pinned repos** — top 6. Ye tera resume hai before resume. Pinned mein "HelloWorld", "First-React-App", "DSA-Solutions" rakha hai? Recruiter ne profile band kar di. Pinned mein 3 portfolio projects with deployed links + clean READMEs hone chahiye.
- **README quality** — kisi project ke andar ghusta hai, README mein paragraph hi nahi, sirf default `create-next-app` ka boilerplate? Mental note: "doesn't write docs, will be a pain to onboard." Skip.

Ek brutal stat: Naukri/LinkedIn pe sourcer ne tera resume khola, GitHub link click kiya, profile khulne mein 10 sec, scan mein 20 sec, decision in **30 seconds total**. Yaani teri pehli impression GitHub profile page hai, fir pinned READMEs. Code andar dekhne ki nobat hi nahi aati.

### LeetCode rating vs deployed project — actual recruiter quote

Ek senior recruiter (Razorpay, ex-Flipkart) ne literally interview mein kaha hai: *"Knight on LeetCode is fine. But if I see a kid who built a working URL shortener with click analytics and Redis caching, deployed on Render, README has a GIF, that's the call I'll make first. Because I know on day 1 he can ship."* Ship — wahi keyword hai. Companies hire shippers, not solvers.

Coding contest rating tab matter karta hai jab tu Google / Microsoft / DE Shaw / quant-finance type roles target kar raha hai. SDE-1 at 99% Indian product companies — recruiter ko CF rating ka pata hi nahi hota.

### The 3-project rule

Tera resume mein 2-3 projects honi chahiye, **not 10**. Ye counter-intuitive hai but seedha hai: 10 abandoned half-built projects > 0 trust. 3 deployed polished projects > 10x more trust than 10 "in-progress" repos.

Recruiter ko depth chahiye — "isne ek cheez ko end-to-end le ke gaya, deployed kiya, edge cases handle kiye, README likha." Ye signal sirf 2-3 polished projects se aata hai. 10 projects mein har ek 30% baked rahega — recruiter ke liye worse than 3 projects.

GitHub pe extra 20 toy projects rakhna allowed hai (pin nahi karna). Resume pe **only the 3 capstone-quality ones**.

### What recruiters actually look for in a project

Decode the JD. Recruiter ko ye points dikhne chahiye in priority order:

1. **Live deployed link** — clickable, works on first try, mobile responsive. No `npm run dev` instructions on resume.
2. **Tech stack matches the role** — frontend role pe applying? At least 2 React/Next.js projects. Backend role? At least 1 backend-heavy project with DB, caching, queues. ML role? Notebook + deployed model.
3. **Non-trivial feature** — auth, payments, real-time, ML, caching, search — kuch jo CRUD se aage ho. Recruiter ko *"oh, this is harder than a tutorial"* feel aana chahiye.
4. **Quantified result** — "Built X" boring. "Built X reducing latency from 800ms to 120ms" — interview-worthy.
5. **Code quality on a quick scroll** — folder structure clean, env vars in `.env.example`, no committed secrets, tests at least for one module, commits look like real work (not "final final v2 update").

### The "Tech stack alignment with the role" rule

Ek galti most students karte hain: random tech stack pick karte hain. "Java sikhna chahiye, to Java mein backend banaunga." Theek hai — but agar tu Razorpay (Go), Atlassian (Java), Swiggy (Node.js), Stripe (Ruby), Hotstar (Java/Scala) target kar raha hai, **role JD padh aur stack align kar**.

Strategy:
- Pick **1 stack as your main** (e.g., MERN). 2 projects in that stack — depth dikhao.
- Pick **1 supporting skill** (e.g., DevOps, ML, mobile). 1 project — breadth dikhao.
- Don't have 5 stacks across 5 projects. Recruiter dekhega aur sochega "jack of all, master of none." Wo specialist hire karta hai SDE-1 ke liye, polymath nahi.

If you genuinely want full-stack, fine — but make sure your 3 capstones include **the same database** (e.g., Postgres in all 3) and **the same auth pattern** (e.g., JWT or NextAuth) so depth dikhe. Recruiter sees consistency = real engineer.

---

## 2. The 5 quality bars every capstone must meet

Before you build anything, internalize these 5 rules. Agar koi project in 5 mein se 3+ fail karta hai, woh resume pe nahi jaayega — chahe tune 200 ghante laga diye ho. Brutal but necessary.

### Bar 1: Hosted live URL (Vercel / Render / Fly.io)

`localhost:3000` is not a project — it's a homework. Live URL chahiye. Free tiers se shuru kar:

- **Frontend (React/Next/Vue)** — Vercel (best DX), Netlify, Cloudflare Pages
- **Backend (Node/Python/Go)** — Render (free tier), Fly.io (free with credit), Railway, Koyeb
- **Database** — Supabase (Postgres free), Neon (Postgres free with branching), MongoDB Atlas (free 512MB), Upstash (Redis serverless free tier)
- **Mobile apps** — Expo Go for React Native (instant share), Play Store internal testing track for Android

Free tier pe deploy karne ke liye cold-start handle karna padega — README mein likh "First request takes ~10s due to free tier cold start." Honesty better than broken-feeling demo.

Custom domain optional but +20% recruiter trust. `splitsum.in` >> `splitsum-final-v2.vercel.app`. Namecheap pe `.in` domain Rs 200/year hai — ek pizza skip kar de saal mein.

### Bar 2: 1-paragraph README + screenshot/GIF + setup steps

README is the resume of the repo. Minimum structure:

- 1-line tagline ("Real-time collaborative whiteboard with WebSocket sync")
- Live URL (clickable)
- Screenshot or GIF (animated GIFs of key flow are gold — use ScreenToGif on Windows, Kap on Mac)
- Tech stack badges
- Local setup (3-5 commands max — `git clone`, `npm install`, `cp .env.example .env`, `npm run dev`)
- Architecture diagram (Excalidraw export, even rough one)
- 1-paragraph "Key engineering decisions" section

Section 11 mein full template hai. Copy-paste, fill blanks, ship.

### Bar 3: Real auth + persistence (not just localStorage)

Tutorial-tier projects localStorage se "save" karte hain. Capstone-tier: actual DB, actual auth.

- **Auth** — NextAuth, Clerk, Supabase Auth, or roll-your-own JWT. Email/password + Google OAuth at minimum. Bonus: forgot-password flow.
- **DB** — Postgres (Supabase, Neon, Railway), MongoDB (Atlas), or Firestore. Persistence mein constraints check karo (foreign keys, unique indexes), na ki bas insert-rows.
- **Sessions / Tokens** — secure HTTP-only cookies, no JWT-in-localStorage (XSS risk). Show recruiter you know basic security.

LocalStorage-only project = recruiter sees "doesn't understand backend boundaries". Skip it.

### Bar 4: At least 1 non-trivial feature beyond CRUD

CRUD = Create / Read / Update / Delete. Tutorial level. Capstone needs **ek dhamakedaar feature** beyond CRUD:

- Real-time (WebSocket / Server-Sent Events)
- Payment integration (Razorpay / Stripe test mode)
- Search (Postgres full-text or Algolia/Meilisearch)
- File upload + processing (S3/Cloudinary + image resize / PDF parse)
- ML integration (sentence embedding for similarity, OpenAI for summarisation)
- Caching layer (Redis with cache invalidation strategy)
- Background jobs (BullMQ / Celery for async work)
- Geo / maps (Mapbox / Google Maps with location-based queries)

Pick at least one. Resume bullet pe yahi hi feature highlight hoga.

### Bar 5: Quantified result for resume bullet (X by Y → Z)

Read `resume-behavioural.md` section on X-by-Y-Z framework. Every project needs a metric. Examples:

- "Reduced page load time **from 4.2s to 800ms** by implementing lazy-loading and Redis caching"
- "Handled **5K concurrent WebSocket connections** on a single 2-core VPS via connection pooling"
- "Achieved **92% accuracy** on IPL outcome prediction over 800 historical matches"
- "Cut deployment time **from 18 min to 4 min** with multi-stage Docker builds"

Numbers de — even if it's a benchmark you ran on your laptop. "I tested with k6 running 100 concurrent users for 60 seconds, p95 latency was 240ms." That's interview-grade.

If you have **no metric**, recruiter sees "vague hand-wavy project". Add at least one — even a load test you ran with `wrk` or `k6`.

---

## 3. MERN / Web track — 5 projects

Sabse popular track. Demand maximum, supply maximum. Differentiation depends on **non-trivial feature** + deployment polish.

### Project 1: Real-time collaborative whiteboard

**What it tests:** WebSocket sync state, optimistic UI, conflict resolution, canvas API, room-based architecture.

**Why recruiter cares:** Real-time apps are hard. Sync-state ka deep understanding signals senior thinking. Excalidraw / Figma / Miro have made this a hot space.

**Stack:**
- Frontend: Next.js 14 + Konva.js (canvas) + Tailwind
- Backend: Node.js + Socket.IO + Express
- DB: Postgres (Neon) for board metadata, Redis (Upstash) for active room state
- Auth: NextAuth with Google OAuth
- Deploy: Vercel (frontend) + Render (Socket.IO server) + Neon + Upstash

**Time estimate:** 35-50 hours.

**Build outline:**
1. **Single-user canvas first (8h)** — Konva setup, draw freehand + rectangle + text + arrow tools, undo/redo via stack. Persist to Postgres.
2. **Add WebSocket layer (12h)** — Socket.IO room-per-board, broadcast `shape-added` / `shape-moved` / `cursor-moved` events. Show other users' cursors with their names.
3. **Conflict resolution (10h)** — last-write-wins for shape updates, but use shape-IDs to avoid duplicates. Client-side optimistic apply, server reconciles. Throttle cursor events to 30fps.
4. **Polish (10h)** — share-link flow, view-only vs edit permissions, export to PNG, README with GIF showing 2 browsers syncing live.

**Resume bullet:**
> Built **CanvasFlow**, a real-time collaborative whiteboard supporting **20+ concurrent users per room** with sub-100ms cursor sync via Socket.IO, deployed on Render + Vercel. Implemented optimistic UI updates and last-write-wins conflict resolution.

**Common gotcha:** Socket.IO on Render free tier sleeps after 15 min idle. Add a cron-job.org ping every 10 min OR mention "cold start ~10s" in README. Bigger gotcha — broadcasting every cursor event without throttling = 1000+ events/sec per user, server dies. Always throttle.

---

### Project 2: Splitwise clone with balance simplification

**What it tests:** Graph algorithm (debt simplification), auth, group permissions, edge cases in money math.

**Why recruiter cares:** Real-world money app. Splitwise is genuinely useful Indian-friendly product. Graph algo (debt minimisation) ek strong technical hook hai — interview mein discuss kar sakta hai.

**Stack:**
- Frontend: Next.js + shadcn/ui + Zustand
- Backend: Next.js API routes + Drizzle ORM
- DB: Postgres (Neon)
- Auth: Clerk (saves you 8h vs NextAuth)
- Deploy: Vercel + Neon

**Time estimate:** 30-40 hours.

**Build outline:**
1. **Auth + groups (6h)** — Clerk setup, create/join groups via invite link, list group members.
2. **Add expense flow (10h)** — split equally / by exact amounts / by percentage / by shares (4 strategies — Strategy pattern). Validate sum = total. Store as `paid_by`, `splits[user_id, amount]`.
3. **Balance calculation (10h)** — for each group, compute net balance per user. Then run **debt simplification**: greedy algo that minimises number of transactions (max-debtor pays max-creditor, repeat). Bring it from O(n^2) edges to O(n-1) edges.
4. **Polish (10h)** — settlement marking, expense edit/delete (recompute balances), CSV export, dark mode, mobile responsive, README explaining the simplification algorithm with example.

**Resume bullet:**
> Built **PaisaSplit**, a group expense tracker with a **debt simplification algorithm reducing settlement transactions by 60%** (n^2 to n-1 edges) on real test groups. Supports 4 split strategies, deployed on Vercel + Neon Postgres serving 200+ test users.

**Common gotcha:** Floating-point money math = bugs. Store amounts in **paise (integer)**, not rupees (float). 100.10 + 100.20 + 100.30 in JS floats = 300.5999... — splitwise will show wrong balance forever and you won't catch it in dev. Use integer paise everywhere, format to rupees only in UI.

---

### Project 3: Indian college mess menu + reviews

**What it tests:** Real-world UX, role-based access (admin/user), image uploads, geo-based queries, search.

**Why recruiter cares:** Hyper-relatable problem (every Indian college student has complained about mess food). Multi-role auth + image handling shows breadth. Niche product = founder-mindset signal.

**Stack:**
- Frontend: Next.js + Tailwind + react-hook-form
- Backend: Next.js API routes
- DB: Postgres + PostGIS extension (for geo-queries) — Neon supports it
- Storage: Cloudinary free tier (image uploads + CDN)
- Auth: NextAuth (Google) with role field on user (`STUDENT` / `MESS_ADMIN` / `SUPER_ADMIN`)
- Deploy: Vercel + Neon + Cloudinary

**Time estimate:** 40-55 hours.

**Build outline:**
1. **Schema + auth (8h)** — `colleges`, `messes` (with lat/lng), `menus` (date, meal, items[]), `reviews` (rating 1-5, comment, photos[]). Role-based middleware: only `MESS_ADMIN` can edit own mess menu.
2. **Student flow (12h)** — geo-search: "messes within 2km of my college" using PostGIS `ST_DWithin`. View today's menu, write review with up to 3 photos (Cloudinary upload widget). Aggregate rating per mess.
3. **Admin flow (10h)** — mess admin dashboard: weekly menu editor (Mon-Sun grid), reply to reviews, see weekly rating trend.
4. **Polish (15h)** — fuzzy search by college name, "recently reviewed" feed, leaderboard of top messes per city, README with screenshots from 2-3 actual colleges (seed data).

**Resume bullet:**
> Built **MessMate**, a geo-based mess menu and review platform for Indian colleges using PostGIS for **sub-50ms 2km-radius queries** across 200+ seeded messes. Implemented role-based access control across 3 user types and Cloudinary CDN for photo uploads.

**Common gotcha:** PostGIS not enabled by default on free Postgres providers — Neon hai Supabase pe, par check pehle. Image uploads se cost spike — restrict to 3 photos, max 1MB each, server-side validation, not just frontend file picker.

---

### Project 4: AI-powered note-taking app

**What it tests:** External API integration (OpenAI / Anthropic / Groq), caching strategy, markdown editor, rate limiting.

**Why recruiter cares:** GenAI is the hottest space in 2026. LLM-integrated app shows tu modern stack samajhta hai. Caching saves money — recruiter sees cost-conscious thinking.

**Stack:**
- Frontend: Next.js + TipTap (or Milkdown) markdown editor
- Backend: Next.js API routes
- DB: Postgres (Neon) + pgvector for semantic search
- LLM: Groq API (Llama 3.1 70B — fast, cheap) or OpenAI GPT-4o-mini
- Cache: Upstash Redis
- Auth: Clerk
- Deploy: Vercel + Neon + Upstash

**Time estimate:** 30-40 hours.

**Build outline:**
1. **Note CRUD with markdown editor (8h)** — TipTap setup, save markdown to Postgres, folder/tag organisation, autosave every 3s.
2. **LLM summarisation (10h)** — `POST /api/summarise/:noteId` — call Groq `llama-3.1-70b` with prompt "Summarise this note in 3 bullet points." Cache result by hash of note content (Redis, 7 day TTL). Show summary in side panel.
3. **Semantic search (10h)** — on note save, generate embedding (OpenAI `text-embedding-3-small`), store in pgvector column. Search bar runs cosine similarity, returns top 5 matching notes. Save embedding cost via debounce (compute only after 5s no-edit).
4. **Polish (8h)** — usage limit per user (10 summaries/day free), graceful errors when LLM down, README with cost estimate ("Average user costs $0.02/month"), GIF of summarisation flow.

**Resume bullet:**
> Built **BrainDump**, an AI-augmented markdown note app using Groq Llama 3.1 70B for note summarisation and pgvector for semantic search across 1000+ test notes. Implemented Redis-backed response caching cutting LLM API costs by **78%** (cache hit rate 80%+).

**Common gotcha:** Don't expose your LLM API key on the client. All LLM calls go through your API route. Also: Groq has free tier rate limits (30 req/min) — implement client-side throttle + server-side queue, or your demo dies in front of recruiter.

---

### Project 5: Razorpay-style fake payment gateway

**What it tests:** Cryptography (HMAC), webhook design, idempotency, money state machines, fintech-grade thinking.

**Why recruiter cares:** Most students never touch payment flows. Showing you understand HMAC verification, webhook retries, idempotency keys = instant credibility. Razorpay/Stripe interviews specifically test this.

**Stack:**
- Frontend (merchant demo + pay page): Next.js
- Backend (the "gateway"): Node.js + Express + BullMQ for webhook delivery
- DB: Postgres (orders, payments, refunds, webhook_events)
- Cache: Redis (for idempotency keys)
- Deploy: Render (backend) + Vercel (frontends) + Neon + Upstash

**Time estimate:** 50-65 hours. Most ambitious in this track.

**Build outline:**
1. **Order + payment APIs (12h)** — `POST /orders` returns `order_id` + amount. `POST /payments/verify` accepts `order_id`, `payment_id`, `signature`. Verify HMAC: `hmac_sha256(order_id + "|" + payment_id, key_secret) === signature`. Mark order as `PAID`. Use idempotency-key header to dedupe.
2. **Hosted pay page (10h)** — at `/pay/:order_id` show amount + dummy card form. On submit, generate `payment_id`, sign payload, redirect to merchant's `success_url` with signature. Simulate failure with "Card 4111 1111 1111 1111 → success", "4111 1111 1111 0000 → failure".
3. **Webhook delivery system (15h)** — BullMQ queue: on `payment.captured`, queue webhook to merchant's URL. Sign webhook body with HMAC. **Retry with exponential backoff: 1s, 5s, 30s, 5min, 30min, 6h.** Store delivery attempts. Merchant must respond 2xx within 5s.
4. **Refunds + dashboard (15h)** — `POST /refunds` creates partial/full refund, fires `refund.processed` webhook. Admin dashboard with payments table, refund button, webhook delivery logs. Status state machine: `CREATED → ATTEMPTED → PAID/FAILED → REFUNDED`. Document state machine in README diagram.

**Resume bullet:**
> Built **PaytmLite**, a payment gateway clone with HMAC-SHA256 signed webhooks, exponential-backoff retry (6 attempts over 6 hours), and idempotency keys. Handled **10K simulated payment events/min** with BullMQ + Redis without duplicate webhook delivery.

**Common gotcha:** Idempotency is the trap. Same `idempotency-key` with same payload = return cached response. Same key with **different payload** = HTTP 422 (clients sometimes retry with different body, indicates bug). Most students miss the second case. Also — never sign webhook body with the request body **after** JSON.stringify; minor whitespace differences break verification on the receiver side. Use raw bytes.

---

## 4. Backend-heavy track — 4 projects

Frontend skip karna hai? Backend roles target karne hain (Razorpay, PhonePe, Atlassian, Postman)? Ye track tujhe stand out karega — most CS undergrads MERN-only banate hain, backend depth show karna instant differentiator hai.

### Project 6: URL shortener with click analytics

**What it tests:** Caching strategy, DB indexes, time-series rollups, rate limiting, geo-IP.

**Why recruiter cares:** Bitly/TinyURL is the OG backend interview problem. Showing you understand cache hit ratios, index design, and time-series aggregation = senior signal.

**Stack:**
- Backend: Node.js + Fastify (Express is fine but Fastify is faster, recruiter notices)
- DB: Postgres (Neon) for URLs + analytics
- Cache: Redis (Upstash) for hot URL lookups
- Geo-IP: MaxMind GeoLite2 (free, downloadable DB)
- Deploy: Render or Fly.io (Fly's edge regions are a flex)
- Frontend (admin): minimal Next.js dashboard

**Time estimate:** 25-35 hours.

**Build outline:**
1. **Core shortener (6h)** — `POST /shorten {url}` returns `https://yourdom.in/aB3xY9`. Use base62 encoding of an auto-incremented ID. `GET /:slug` does 302 redirect. Index on `slug` column.
2. **Caching layer (8h)** — On `GET /:slug`, check Redis first (`SET slug url EX 86400`). Cache miss → DB lookup → set cache. Show cache hit ratio in admin dashboard. Benchmark: with `wrk -c100 -t4 -d30s`, hot URL should hit 5K+ rps from Redis cache.
3. **Analytics ingestion (10h)** — On every redirect, fire-and-forget enqueue an event `{slug, timestamp, ip, ua}`. Background worker (BullMQ) processes events: parse UA, look up geo from IP, insert into `clicks` table. Use a partitioned table by month for clicks (Postgres declarative partitioning).
4. **Time-series dashboard (8h)** — `/dashboard/:slug` shows hourly/daily click counts (use SQL `date_trunc`), top countries, top referrers. Cache dashboard query in Redis 5 min. README with architecture diagram + load test results.

**Resume bullet:**
> Built **TinyShort**, a URL shortener serving redirects with **p99 latency of 12ms** via Redis caching (87% hit ratio). Implemented async analytics ingestion with BullMQ + monthly Postgres partitioning, scaling to **50K clicks/day** on a single Render dyno.

**Common gotcha:** Don't index `(created_at)` alone on clicks table — useless for `WHERE slug = ? AND created_at BETWEEN ?`. Composite index `(slug, created_at)` matters. Also: don't do synchronous geo-IP lookup in the hot path — adds 5-20ms to every redirect. Async via queue.

---

### Project 7: Distributed rate limiter (token bucket via Redis Lua)

**What it tests:** Distributed systems thinking, atomic operations, Lua scripting in Redis, race conditions.

**Why recruiter cares:** Rate limiting is asked in 30%+ of system design interviews. Building one from scratch = you don't just memorise patterns, you've fought race conditions.

**Stack:**
- Backend: Go (Go is a flex here — Node also works but Go shows backend chops) + Gin
- Redis: Upstash (note: Upstash supports Lua via REST? Use a real Redis like Redis Cloud free 30MB or local Docker for dev)
- Deploy: Fly.io with Go binary (super lightweight)
- Demo frontend: simple HTML page that fires N requests in parallel and shows allowed/denied count

**Time estimate:** 30-40 hours.

**Build outline:**
1. **Naive in-memory token bucket (4h)** — single-process Go service. Each user has bucket: `{tokens, lastRefill}`. On request: refill based on elapsed time, decrement if tokens>=1, else 429. Run with `vegeta` and verify limits hold.
2. **Redis-backed (10h)** — store bucket as a hash. Problem: read-modify-write is racy. Two requests at same instant both read 1 token, both decrement to 0, both pass — limit broken.
3. **Lua script for atomicity (10h)** — write `token_bucket.lua` that does refill + check + decrement atomically (Redis runs Lua single-threaded). Pass `key`, `capacity`, `refill_rate`, `now`, return `{allowed, remaining}`. Now race-free across N service replicas.
4. **Multi-strategy support (8h)** — also implement sliding-window-counter and fixed-window. Library API: `limiter.allow(userId, "free-tier")`. Tier configs in YAML. README: benchmark all 3 strategies under 10K rps with k6, plot accuracy vs throughput.

**Resume bullet:**
> Built a **distributed rate limiter** in Go using Redis + Lua scripts achieving **atomic check-and-decrement under 10K rps** across 4 replicas with zero race-condition leaks. Supports token-bucket, sliding-window, and fixed-window strategies.

**Common gotcha:** `time.Now()` in Go vs `redis.TIME` — clock skew between app servers will cause inconsistent refills. Always pass `now` from one source (the Lua script can use `redis.call('TIME')`). Also: Lua scripts have a **5-second execution limit** in Redis — don't loop unbounded.

---

### Project 8: Real-time leaderboard for IPL fantasy

**What it tests:** Pub/Sub design, Redis sorted sets, scale planning, fan-out architecture.

**Why recruiter cares:** Hotstar / Dream11 / MPL ka day-1 problem. ZSET-based leaderboards are a classic — implementing one well shows depth.

**Stack:**
- Backend: Node.js + Fastify + Socket.IO
- Redis: with sorted sets (ZADD, ZRANGE, ZINCRBY)
- DB: Postgres for user/team/match metadata
- Frontend: Next.js with live-updating top-100 leaderboard
- Deploy: Render + Upstash + Neon + Vercel

**Time estimate:** 30-40 hours.

**Build outline:**
1. **Match + scoring engine (10h)** — IPL scoring rules (4 = 4 pts, 6 = 6 pts, wicket = 25 pts, etc). Build `POST /events` that ingests `{match_id, player_id, event_type}`. Compute fantasy points delta. Use real IPL data from cricsheet.org JSON for seed.
2. **User teams + scoring (8h)** — user picks 11 players + captain (2x) + vice-captain (1.5x). On every event, find users whose teams have this player, ZINCRBY their score in `leaderboard:match_id` ZSET.
3. **Live leaderboard via WebSocket (10h)** — `GET /leaderboard/:match_id?limit=100` reads top-100 from ZSET (`ZREVRANGE WITHSCORES`). On any score change, publish to Redis pub/sub channel `leaderboard:match_id`. Socket.IO gateway subscribes, broadcasts diffs to connected clients in that match's room.
4. **Polish + load test (10h)** — k6 simulating 5000 events/match (real IPL has ~250 ball events × 3-4 outcomes each), 1000 concurrent viewers. Measure p95 broadcast latency. Redis ZSET size bounded by ~50K teams per match — totally fine. README with architecture + k6 results.

**Resume bullet:**
> Built a **real-time IPL fantasy leaderboard** using Redis sorted sets and pub/sub, propagating score updates to **1000+ concurrent WebSocket clients in <100ms p95**. Ingested 5K events/match with zero leaderboard inconsistency under load tests.

**Common gotcha:** Don't broadcast the full top-100 on every single event — at 5K events/match × 100 viewers × 100-row payload, you'll DDoS yourself. Broadcast diffs only ("user X moved to rank 47, score 412"), client patches local list. Also: ZSETs store scores as IEEE 754 floats — fine for integer points, but if you ever do partial-point math, watch precision.

---

### Project 9: OAuth2 server from scratch

**What it tests:** Deep security understanding, authorization code flow + PKCE, JWT signing, refresh token rotation.

**Why recruiter cares:** "I use NextAuth" tells nothing. "I implemented OAuth2 with PKCE and refresh token rotation" tells you understand auth at the spec level — RFC 6749, 7636. Senior teams (Atlassian, Auth0, Okta) hire on this.

**Stack:**
- Backend: Node.js + Fastify (or Spring Boot if you're Java-leaning — bigger flex)
- DB: Postgres for clients, users, auth codes, refresh tokens
- Cache: Redis for short-lived auth codes (5 min TTL)
- Crypto: `jose` library for JWT (RS256 with rotating keys)
- Frontend: 2 demo apps — "Google" replacement (your auth server) and a "client" app that logs in via your server
- Deploy: Render + Vercel + Neon

**Time estimate:** 50-65 hours. Most ambitious in this track.

**Build outline:**
1. **Client registration + auth code flow (15h)** — `POST /register-client` returns `client_id`, `client_secret`. Implement `GET /authorize?client_id&redirect_uri&code_challenge&code_challenge_method=S256` → login page → redirects with `?code=xyz`. Store code in Redis with `client_id`, `code_challenge`, 5-min TTL.
2. **Token endpoint + PKCE verify (12h)** — `POST /token` with `code` + `code_verifier`. Verify `S256(code_verifier) === code_challenge`. Return `access_token` (JWT, 15-min, signed with RSA private key) + `refresh_token` (opaque, stored hashed in DB, 30-day).
3. **Refresh token rotation (10h)** — on `/token` with `grant_type=refresh_token`: issue new access + new refresh, **revoke old refresh**. Detect reuse: if revoked refresh used again, revoke entire token family (RFC 6749 best practice). Show this defends against stolen refresh tokens.
4. **JWKS endpoint + key rotation (15h)** — `GET /.well-known/jwks.json` exposes public keys. Sign new tokens with current key, but verify with any key in JWKS. Rotate keys monthly. Demo client app validates signature using JWKS. README explains attack model + defenses.

**Resume bullet:**
> Implemented an **RFC 6749/7636 compliant OAuth2 server** in Node.js with PKCE, refresh-token rotation with reuse detection, and JWKS-based RSA key rotation. Defended against authorization code interception, token replay, and stolen refresh tokens.

**Common gotcha:** Storing refresh tokens in plaintext = catastrophic if DB leaks. Always hash with SHA-256 before storage (since they're high-entropy, no need for bcrypt). Also: **never** sign with HS256 (symmetric) for OAuth — must be RS256 so client apps verify without your secret. Most "OAuth from scratch" tutorials get this wrong.

---

## 5. Mobile track — 3 projects

Mobile dev specialist roles less competitive than web — supply choti hai. Agar tujhe Android pasand hai, ek polished Compose app teri profile mein recruiter ko explicitly stand out karega.

### Project 10: Offline-first Indian recipe app

**What it tests:** Architecture (MVVM/MVI), Room DB, sync logic, Compose UX, offline UX patterns.

**Why recruiter cares:** Offline-first = real product thinking. "Works on patchy 3G" is a genuine Indian UX requirement. Compose adoption is also fresh — show you've moved beyond XML.

**Stack:**
- Kotlin + Jetpack Compose
- Room for local DB
- Retrofit + OkHttp for network
- WorkManager for background sync
- Hilt for DI
- Backend: Supabase (free) for the API + image storage
- Distribution: Play Store internal track + APK link in README

**Time estimate:** 40-55 hours.

**Build outline:**
1. **Local-first browse (10h)** — Recipe entity in Room: name, ingredients (TypeConverter for List<String>), steps, image_url, region. Seed with 50 Indian recipes (paneer butter masala, biryani, etc — pull from any free recipe API or curate). UI: LazyColumn grid, search, filter by region.
2. **Networking + sync (15h)** — Retrofit API to Supabase. WorkManager periodic job (every 6h, only on Wi-Fi + charging) fetches new/updated recipes and upserts into Room. Last-sync timestamp shown in settings. Use a `SyncStatus` enum (IDLE / SYNCING / ERROR) shown subtly in top bar.
3. **Add favourites + cooking timer (8h)** — local-only flag `is_favourite`, separate Favourites tab. Cooking step timer that runs in foreground service with notification.
4. **Polish (10h)** — Compose animations on recipe card press, dark mode, offline indicator banner when no network, screenshot test for key screens. README with screen recordings + APK download link.

**Resume bullet:**
> Built **DesiCook**, an offline-first Android recipe app in **Jetpack Compose + Hilt + Room** with WorkManager-based background sync. Achieved **100% read functionality without network** on 50+ recipes and **<300ms cold start** via lazy module loading.

**Common gotcha:** Room migrations on schema change — most students just `fallbackToDestructiveMigration()` and lose user data. Implement at least one proper `Migration(1, 2)` to show you know production patterns. Also: TypeConverter for List<String> — use kotlinx.serialization, not manual comma-split (breaks on ingredients with commas).

---

### Project 11: Local food-delivery clone for college campus

**What it tests:** Multi-screen app, state management (StateFlow), payment integration, real-world UX flows.

**Why recruiter cares:** Razorpay integration on Android = useful skill, asked for at Swiggy/Zomato. Multi-role app (customer + restaurant owner + delivery agent) tests architecture choices.

**Stack:**
- Kotlin + Jetpack Compose + Navigation
- Hilt + StateFlow + Coroutines
- Razorpay Android SDK (test mode)
- Backend: Node.js API on Render OR Supabase
- DB: Postgres
- Maps: Google Maps Compose

**Time estimate:** 50-65 hours.

**Build outline:**
1. **Customer flow (15h)** — login (OTP via Firebase Auth), browse restaurants (filtered by your campus geofence), add to cart, checkout. Cart state via StateFlow in CartViewModel, shared across screens.
2. **Razorpay test integration (10h)** — `Razorpay Checkout` activity result API, generate order on backend (with your `key_id`+`key_secret`), open Razorpay sheet, on success verify signature on backend. Use test cards. Order status state machine: PENDING → PAID → ACCEPTED → OUT_FOR_DELIVERY → DELIVERED.
3. **Restaurant + delivery views (15h)** — same app, different role-based start screen. Restaurant marks order ACCEPTED, delivery agent sees pickup list with map directions. Use Google Maps Compose with markers.
4. **Polish (15h)** — push notifications via FCM on status change, order history, ratings. README with 3 screen-recordings (1 per role) and full flow demo.

**Resume bullet:**
> Built **CampusBites**, a 3-role food-delivery Android app (customer/restaurant/delivery) in Kotlin Compose with **Razorpay test-mode integration including HMAC signature verification**. Implemented Google Maps live tracking and FCM push for order status — handled **200+ test orders** in QA cycle.

**Common gotcha:** Don't put Razorpay `key_secret` in Android code — anyone can decompile APK. Order generation + signature verification **must** be on your backend. Most beginners leak the secret. Also: FCM on Android 13+ requires runtime POST_NOTIFICATIONS permission — handle gracefully.

---

### Project 12: Period-tracker app (privacy-first)

**What it tests:** Sensitive data handling, encrypted storage, privacy-by-design, no-analytics architecture.

**Why recruiter cares:** Post-Roe / global data sensitivity, privacy-aware engineering is increasingly valued. Showing you can build sensitive apps responsibly = mature signal. Different from "another todo app" — makes recruiter pause.

**Stack:**
- Kotlin + Compose
- EncryptedSharedPreferences + Room with SQLCipher
- DataStore for non-sensitive prefs
- No backend (intentional). All data on-device.
- Optional: encrypted Google Drive backup using user-controlled passphrase
- Deploy: Play Store / APK

**Time estimate:** 30-40 hours.

**Build outline:**
1. **Encrypted local DB (10h)** — Room + SQLCipher. App-launch passphrase (or biometric unlock via BiometricPrompt). Cycle entries: start_date, end_date, flow_intensity, symptoms[], mood. Calendar UI in Compose.
2. **Predictions (8h)** — average cycle length over last 6 cycles → predict next period + ovulation window. Show on calendar with disclaimer "predictions are estimates only".
3. **Privacy controls (8h)** — explicit "no analytics, no network" badge in settings. App lock timeout. Optional incognito mode (hides app name in launcher to "Calendar"). Export data as encrypted JSON to user's chosen location.
4. **Polish (8h)** — minimal beautiful UI (warm colours, no ads — never), accessibility (TalkBack labels), README with **threat model section** explaining what attacks you defend against (lost phone, malicious app on device, network MITM — N/A since no network).

**Resume bullet:**
> Built **Cyclo**, a **privacy-first Android period tracker** with SQLCipher-encrypted Room DB, biometric unlock, and zero network calls. Authored a public threat model documenting defenses against lost-device, malware, and forensic-extraction attacks.

**Common gotcha:** EncryptedSharedPreferences uses a key stored in Android Keystore — fine until user does factory-reset and restores backup; keystore key gone, prefs unreadable. Handle this gracefully (re-prompt for passphrase, not crash). Also: Don't forget to disable screenshots (`FLAG_SECURE`) on sensitive screens.

---

## 6. Data / ML track — 3 projects

ML role specifically? Or hedge-bet "I'm full-stack but can do ML"? Ye 3 projects worth ~6 months of "Coursera Andrew Ng course" on resume.

### Project 13: IPL outcome predictor

**What it tests:** EDA, feature engineering, model selection (XGBoost), serving via Streamlit, deploying ML.

**Why recruiter cares:** End-to-end ML pipeline (data → feature → model → deploy) = rare among CS students. IPL hook makes it memorable. Streamlit deploy makes it interactive.

**Stack:**
- Python + pandas + XGBoost + scikit-learn
- Data: cricsheet.org (free IPL JSONs) + Kaggle IPL datasets
- Streamlit for UI
- Deploy: Streamlit Community Cloud (free)

**Time estimate:** 30-40 hours.

**Build outline:**
1. **Data ingestion + EDA (8h)** — load 800+ matches from cricsheet, parse into pandas DataFrame. EDA notebook: home/away advantage, toss correlation, venue effects, head-to-head. Plot with matplotlib/seaborn.
2. **Feature engineering (10h)** — for each match: team A recent form (last-5 win%), team B recent form, venue stats, toss winner, batting first/second, captain win%. One-hot teams. Train/val/test split by season (no leakage from future seasons).
3. **Model + tuning (8h)** — XGBoost classifier. Grid-search via Optuna over `max_depth`, `learning_rate`, `n_estimators`, `subsample`. Compare against logistic regression baseline. Aim for accuracy >70% on test set (random = 50%, last-form heuristic = ~58%).
4. **Streamlit app (8h)** — dropdowns for team A, team B, venue, toss winner. Show predicted winner + confidence + top 3 features that drove decision (SHAP values). Deploy to Streamlit Cloud. README with notebook link, deployed link, model card.

**Resume bullet:**
> Built **IPLPredict**, an XGBoost-based match-outcome predictor achieving **74% accuracy** on a held-out 2023-24 season (random baseline 50%). Engineered 22 features including recent-form, venue effects, and toss-impact; deployed interactive Streamlit app with SHAP-based explainability.

**Common gotcha:** Data leakage — calculating "team form" using current season matches that include the target match. Always compute features using **only past data** as of the match date. Most beginners get 90% accuracy, then realize they leaked future info. Real accuracy on this problem is genuinely 70-75%.

---

### Project 14: Resume-to-JD matcher

**What it tests:** NLP (sentence embeddings), FastAPI serving, semantic similarity, basic RAG.

**Why recruiter cares:** Practical NLP, deployed model. Recruiters relate to it personally — they've literally built this internally. Talk track gold.

**Stack:**
- Python + sentence-transformers (`all-MiniLM-L6-v2`, fast + free)
- FastAPI for serving
- Redis for caching embeddings
- Frontend: simple HTML/Streamlit
- Deploy: HuggingFace Spaces (free GPU for inference) or Render

**Time estimate:** 25-35 hours.

**Build outline:**
1. **Embedding service (8h)** — FastAPI endpoint `POST /embed` taking text, returning 384-dim vector. Cache by SHA-256(text) in Redis. Model loaded once at startup (lifespan event).
2. **Match endpoint (10h)** — `POST /match {resume_text, jd_text}` returns: overall score (cosine sim), section-wise score (chunk resume into Experience/Skills/Projects, chunk JD into Required/Nice-to-have, compute pairwise sim), top 5 matched skills, top 5 missing skills (extracted via spaCy NER + a simple skills list).
3. **Frontend (8h)** — paste resume + JD, show match % with visual bar, missing-skills tags in red, suggestions to add. Bonus: "rewrite suggestion" via Groq LLM.
4. **Polish (8h)** — handle PDF resume upload (PyMuPDF). Rate limit per IP (10 matches/min). README with example JDs and computed scores.

**Resume bullet:**
> Built **JDFit**, a resume-to-JD matcher using sentence-transformers (`all-MiniLM-L6-v2`) with **section-wise cosine similarity** and Redis-cached embeddings. Identified missing skills via spaCy NER, deployed on HuggingFace Spaces — processed **500+ resumes in beta** at 200ms median latency.

**Common gotcha:** sentence-transformers model is 100MB — Render free tier RAM (512MB) gets tight. Load on lazy-init or use HuggingFace Spaces (better for ML). Also: don't naively compare full resume vs full JD — long-text mean-pooled embeddings are mushy. Chunk and compare section-wise for meaningful scores.

---

### Project 15: Indian stock-news summariser

**What it tests:** Web scraping ethics, scheduling, LLM summarisation pipeline, data engineering.

**Why recruiter cares:** End-to-end data pipeline (scrape → store → summarise → serve). NSE/BSE niche makes it Indian-specific = memorable. Quant funds (Squarepoint, Tower) like this kind of project for analyst hires.

**Stack:**
- Python + httpx + BeautifulSoup (or feedparser for RSS — preferred, ToS-safe)
- Postgres for raw + summarised articles
- Groq Llama 3.1 for summarisation (free + fast)
- APScheduler or cron for hourly fetch
- FastAPI for read API
- Frontend: minimal Next.js
- Deploy: Render (worker + API) + Neon

**Time estimate:** 30-40 hours.

**Build outline:**
1. **Ingestion (10h)** — fetch RSS feeds from MoneyControl, Economic Times Markets, LiveMint, Business Standard. Parse, dedupe by URL hash, insert into `articles` table with `published_at`, `source`, `headline`, `body`, `tickers[]` (extract via regex: NSE patterns like RELIANCE, TCS, etc).
2. **Summariser worker (10h)** — every 15 min, pick 50 unsummarised articles, batch-call Groq with prompt "Summarise in 2 sentences focusing on financial impact." Store summary + sentiment label (BULLISH/BEARISH/NEUTRAL) extracted via structured JSON output. Rate-limit-aware retry.
3. **API + UI (10h)** — `GET /news?ticker=RELIANCE&since=2024-12-01` returns recent summarised news. UI: ticker search, sentiment-coloured cards, sparkline showing news volume over 7 days.
4. **Polish (5h)** — README with data lineage diagram, ToS compliance note (RSS only, attribution preserved), cost analysis ("$0.04/day for 5K summaries on Groq free tier").

**Resume bullet:**
> Built **StockBrief**, an Indian-markets news pipeline ingesting **5K articles/day** from 4 sources via RSS, summarising via Groq Llama 3.1 with structured-output sentiment tags. Served via FastAPI with ticker-level filtering — 92% summarisation accuracy on a manual 100-article sample.

**Common gotcha:** Don't scrape behind paywalls (legally and ethically risky). RSS feeds are explicitly publishable — stick to those. Also: LLM summarisation occasionally hallucinates numbers ("stock up 5%" when article said 0.5%). Ground summaries by passing only the article text + an explicit "do not invent numbers" rule.

---

## 7. DevOps / Infra track — 2 projects

DevOps roles are hot but supply low — most CS undergrads avoid them. 1 polished DevOps project = significant differentiator for SRE / Platform / Infra roles.

### Project 16: Kubernetes deployment of a 3-tier app

**What it tests:** Kubernetes fundamentals, Helm, ingress, observability (Prometheus + Grafana).

**Why recruiter cares:** "I deployed to k8s" = `kubectl apply -f`. "I wrote a Helm chart, configured ingress with TLS, and set up Prometheus scraping" = actual DevOps work.

**Stack:**
- App: any 3-tier (frontend Next + backend Node + Postgres) — reuse one of your earlier projects, e.g., URL shortener
- Container: Docker
- Orchestration: minikube locally, then DigitalOcean Kubernetes (DOKS — $12/mo cluster, run for a week and tear down)
- Helm for templating
- ingress-nginx for routing, cert-manager for Let's Encrypt
- kube-prometheus-stack for monitoring
- Deploy: DOKS or Civo (cheaper)

**Time estimate:** 40-55 hours. Steep learning curve.

**Build outline:**
1. **Containerise + local k8s (10h)** — Dockerfile for frontend (multi-stage: builder + nginx) and backend. `docker compose up` works locally. Then minikube: write Deployment + Service + ConfigMap + Secret YAMLs. App accessible via port-forward.
2. **Helm chart (12h)** — convert YAMLs to a chart with `values.yaml`. Templated image tags, env vars, replica counts. Test `helm install` and `helm upgrade`. Separate `values-prod.yaml` and `values-dev.yaml`.
3. **Cloud cluster + ingress + TLS (15h)** — provision DOKS, install ingress-nginx + cert-manager via Helm. Configure Ingress resource with hostname (`api.yourdom.in`), Let's Encrypt cluster-issuer. Deploy your chart. App live on https.
4. **Monitoring (10h)** — install kube-prometheus-stack. Add Prometheus annotations to your Deployments (`prometheus.io/scrape: "true"`, `path: /metrics`). Expose `/metrics` from your Node backend via `prom-client`. Build Grafana dashboard: request rate, p95 latency, error rate, pod CPU/memory. Screenshot for README.

**Resume bullet:**
> Deployed a 3-tier application (Next.js + Node.js + Postgres) to **DigitalOcean Kubernetes via custom Helm chart**, with ingress-nginx + cert-manager TLS automation. Configured Prometheus scraping and Grafana dashboards monitoring **request rate, p95 latency, and pod resource usage** across 4 replicas.

**Common gotcha:** Postgres in k8s is hard — use DigitalOcean managed DB (cheaper, simpler) or a single Postgres pod with PVC for the demo. Don't try a full HA Postgres operator for capstone scope. Also: tear down the cluster when done — DOKS is $12/month, easy to forget and burn ₹3K/month.

---

### Project 17: CI/CD pipeline from scratch

**What it tests:** Automation, GitHub Actions, deployment hygiene, artifact builds, Slack integration.

**Why recruiter cares:** Every team needs CI/CD. Showing you can write a real pipeline (lint → test → build → deploy → notify) = day-1-productive hire.

**Stack:**
- A target app: any of your earlier projects
- GitHub Actions
- Optional: GitHub Container Registry (ghcr.io) for Docker image artifacts
- Deployment target: Render / Fly.io / Vercel (use Vercel's deploy hooks)
- Slack webhook for notifications

**Time estimate:** 20-30 hours.

**Build outline:**
1. **Multi-job workflow (8h)** — `.github/workflows/ci.yml`. Jobs: `lint` (ESLint / ruff), `test` (Jest / pytest with coverage), `build` (compile TS / build Next, upload artifact). Run on PR + push to main. Use `actions/cache` for `node_modules`. Status checks required on PRs.
2. **Docker build + push (6h)** — separate `docker.yml` workflow on tag push (`v*.*.*`). Multi-platform build (linux/amd64 + linux/arm64) via buildx. Push to ghcr.io with version tag + `latest`. Cache layers via `actions/cache` or registry cache.
3. **Auto-deploy (6h)** — on push to `main`: deploy to staging via Render API. On tag: deploy to prod via Render API. Use environment secrets, `environment: production` (with required reviewers) for prod.
4. **Notifications + protection (6h)** — Slack webhook posts deploy success/failure. Branch protection on `main`: require PR, require status checks. README with badge for build status, screenshots of pipeline runs, Mermaid diagram of the flow.

**Resume bullet:**
> Authored a **GitHub Actions CI/CD pipeline** with parallel lint/test/build jobs, multi-platform Docker builds (amd64 + arm64) pushed to GHCR, gated production deploys with required reviewers, and Slack notifications. Cut deploy-to-staging time **from 18 min manual to 4 min automated**.

**Common gotcha:** Don't put `GITHUB_TOKEN` permissions as `write-all` for everything (default is permissive in older repos). Set explicit `permissions:` block per job — read-only by default, write only for the deploy job. Recruiters reading your YAML will notice this, security-conscious teams care a lot.

---

## 8. Systems / Low-level track — 2 projects

Niche. Strong fit for systems-leaning roles (DBs, kernel, infra teams at Microsoft, Oracle, NVIDIA, Confluent). Almost no Indian undergrads attempt these — built one, you're a unicorn.

### Project 18: Mini-Redis in C++ or Rust

**What it tests:** Network programming, protocol parsing, concurrency, systems thinking.

**Why recruiter cares:** Implementing a real protocol (RESP — REdis Serialization Protocol) shows you understand byte-level wire formats. C++/Rust skill = automatic 30% salary bump in some teams.

**Stack:**
- Rust (preferred — async with Tokio is clean and modern flex) OR C++17 with Asio
- Just `std` for protocol parsing — write it yourself
- Tests with `redis-cli` (yes, your server should respond to actual redis-cli commands)
- Deploy: GitHub release with binary + Docker image

**Time estimate:** 35-50 hours.

**Build outline:**
1. **TCP server skeleton (8h)** — Tokio TCP listener accepting concurrent clients, each in its own task. Echo server first to verify framework. Handle connection close gracefully.
2. **RESP parser (12h)** — RESP3 spec: simple strings (`+OK\r\n`), errors (`-ERR\r\n`), integers (`:1000\r\n`), bulk strings (`$5\r\nhello\r\n`), arrays. State machine parser (handle partial reads — TCP doesn't guarantee full message in one read). Unit tests with crafted byte buffers.
3. **5 commands (10h)** — `PING`, `SET key value [EX seconds]`, `GET key`, `DEL key`, `EXPIRE key seconds`. In-memory `HashMap<String, (Bytes, Option<Instant>)>` behind `Arc<Mutex>` (or `DashMap` for concurrent). Background task removes expired keys lazily on read + scans.
4. **Polish + benchmark (10h)** — `INCR`, `INFO`, `KEYS pattern` as bonus. Benchmark with `redis-benchmark -t set,get -n 100000 -c 50`. Compare ops/sec to real Redis on same machine. README explains design decisions, RESP parser approach, why you picked Mutex vs RwLock vs DashMap.

**Resume bullet:**
> Built **MiniRedis**, a Redis-compatible server in **Rust + Tokio** with hand-rolled RESP3 parser, supporting SET/GET/DEL/EXPIRE/INCR. Achieved **45K SET ops/sec on a 4-core laptop** (vs 80K for real Redis), validated against `redis-cli` and `redis-benchmark`.

**Common gotcha:** Forgetting partial reads — `socket.read()` may return half a RESP message. State machine must handle "not enough bytes yet, wait for more." Most C++/Rust beginners write a "read full message in one call" parser and silently miss this. Bench with `redis-benchmark -P 100` (pipelining) to expose it.

---

### Project 19: Build your own Git

**What it tests:** Hash-based content addressing, tree/blob/commit objects, fundamentals of version control.

**Why recruiter cares:** Git is everywhere; almost no one understands it internally. Reimplementing init/add/commit/log = "this person debugs deeply, learns first principles". Universal interview talking point.

**Stack:**
- Python 3 (clean, readable — Rust if you really want a flex)
- Just stdlib (hashlib, zlib, os) — no git library
- CLI via argparse
- Deploy: PyPI package + GitHub README with full demo

**Time estimate:** 25-35 hours.

**Build outline:**
1. **`init` + object store (6h)** — `mygit init` creates `.mygit/` with `objects/` and `refs/heads/`. Implement `hash_object`: read file, prepend `blob <size>\0`, sha1 it, zlib-compress, write to `.mygit/objects/<sha1[:2]>/<sha1[2:]>`. Match git's exact format so real `git cat-file` can read your blobs.
2. **`add` + index (8h)** — `mygit add file.txt` hashes the file, stores blob, updates index file (`.mygit/index` — keep it simple JSON for capstone, real git uses binary format). Multi-file support.
3. **`commit` + tree object (10h)** — write tree object from index (recursive: subdirs become sub-trees). Write commit object (`tree <sha> \n parent <sha> \n author <name> <email> <time> \n\n message`). Update `HEAD` ref.
4. **`log` + verify (6h)** — walk parent chain from HEAD, print each commit. Verify entire flow with: `mygit init`, add, commit, then `git cat-file -p <commit-sha>` (real git!) — should print your commit. README walkthrough with screenshots of bytes.

**Resume bullet:**
> Implemented **MyGit**, a Git clone in 600 lines of Python supporting `init`, `add`, `commit`, `log` with byte-compatible object format — verified by reading my objects via real `git cat-file`. Documented internals (blob/tree/commit, content-addressing, hash chain) in a tutorial README.

**Common gotcha:** Tree object format is **not** simple text — it's `<mode> <name>\0<binary 20-byte sha1>` concatenated, then prefixed with `tree <size>\0`. Most blog tutorials get this wrong; real git is strict. Read the actual git source format-pack-protocol docs. Verifying with `git cat-file` forces you to be exact.

---

## 9. AI / GenAI track — 1 project

GenAI track ka entire content `genai-rag.md` aur friends mein detailed hai. Yahan one capstone-level project that proves you can ship a RAG app end-to-end.

### Project 20: RAG-based chatbot for your college FAQ

**What it tests:** Embeddings, vector DB, retrieval, prompt engineering, hallucination mitigation.

**Why recruiter cares:** Every company is building "ChatGPT for our docs." Showing you can do RAG end-to-end = literally the most demanded skill in 2026.

**Stack:**
- Python + LangChain (or LlamaIndex — both fine)
- ChromaDB (local) or Pinecone free tier (cloud)
- Groq Llama 3.1 70B for chat
- Embeddings: OpenAI `text-embedding-3-small` or local BGE
- Frontend: Streamlit or simple Next.js chat
- Deploy: HuggingFace Spaces

**Time estimate:** 25-40 hours.

**Build outline:**
1. **Document ingestion (8h)** — gather 20+ PDFs from your college: academic regulations, hostel rules, scholarship info, exam guidelines, alumni FAQ. Use PyMuPDF to extract text. Chunk by ~500 tokens with 50-token overlap. Embed each chunk, store in ChromaDB with metadata (source PDF, page number).
2. **Retrieval pipeline (8h)** — on user query: embed, top-k=5 from Chroma, **re-rank** with `cross-encoder/ms-marco-MiniLM-L-6-v2` (re-ranking adds 10%+ precision). Build context = concatenated chunks with source citations.
3. **Generation with grounding (8h)** — prompt template: "Answer using ONLY the context below. If not found, say 'Not in my docs'. Cite sources as [source.pdf p.X]." Call Groq. Show answer + cited sources in UI. Avoid hallucination via the explicit "say not found" instruction.
4. **Polish (10h)** — chat history with context window management (last 4 turns), feedback button (thumbs up/down logged). Eval set: 30 hand-written Q&A pairs, measure answer-relevance (LLM-as-judge) and citation-correctness. README with eval results table.

**Resume bullet:**
> Built **CollegeQA**, a RAG-based chatbot indexing **2K+ chunks from 20+ college PDFs** in ChromaDB. Implemented cross-encoder re-ranking and source-citation grounding, achieving **88% citation correctness** on a 30-question eval set against Groq Llama 3.1 70B.

**Common gotcha:** Naive top-k retrieval looks fine in dev but fails on adversarial queries (paraphrases, multi-hop). Always re-rank. Also: LLMs **will** hallucinate even with "say not found" instruction — measure citation correctness (does the cited chunk actually contain the claim?), not just answer relevance.

---

## 10. Build cadence — how to ship 3 in 90 days

Theory done. Now execution.

### Week 1: Plan and pick

- Read all 20 projects above. Mark 5-6 that excite you. From those, pick **3 across difficulty levels**:
  - **Easy (25-35h)** — momentum builder. Examples: URL shortener, Resume-JD matcher, MyGit.
  - **Medium (35-50h)** — main showcase. Examples: Splitwise, Mess menu, Real-time leaderboard, Recipe app.
  - **Ambitious (50-65h)** — depth proof. Examples: OAuth2 server, Razorpay clone, k8s deployment, food delivery 3-role app.
- For each, write a 1-page spec: what features in scope, what cut. Stick the specs on your wall — Friday evening commitment device.
- Set up: GitHub org/profile cleanup, buy a `.in` domain (₹200/year) for the main project, sign up for free tiers (Vercel, Render, Neon, Upstash, Cloudinary, Clerk).

### Weeks 2-4: Project 1 (small, deployed)

3 weeks for a 25-35h project = ~12h/week = 2 hours daily or 6 hours on Sat/Sun. Realistic for a college student even during exams.

- **Week 2:** core flow working locally (no styling, no auth — just the meat).
- **Week 3:** auth + DB + the "non-trivial feature".
- **Week 4:** polish + deploy + README + GIF + resume bullet.

End of Week 4: project shipped, README polished, bullet drafted. Don't move to project 2 with project 1 in "90% done" state — Pareto your way to 100% before context-switching.

### Weeks 5-9: Project 2 (medium, deployed)

5 weeks for 35-50h = ~9h/week. Plan iteratively:

- **Week 5:** spec finalisation, schema design, scaffolding.
- **Weeks 6-7:** core features.
- **Week 8:** the differentiating feature (real-time, ML, payment, geo — whatever you picked).
- **Week 9:** polish + deploy + README + bullet.

### Weeks 10-12: Project 3 (ambitious)

3 weeks for a 50-65h project is **tight**. Either:
- Reuse infra from earlier projects (auth, DB schema, deployment scripts), OR
- Pick the 50h end of "ambitious" not the 65h end, OR
- Extend into Week 13-14 — that's fine. Better polished+late than rushed+broken.

### Discipline rules

- **Daily commit** during build weeks. Even 30-min `fix typo` keeps heatmap green.
- **Weekly demo to a friend** — explain in 5 min what you built. If they don't get it, your README also won't get it.
- **Don't tutorial-hop** — pick one stack per project, finish it. "Let me try Drizzle instead of Prisma midway" = guaranteed delay.
- **Deploy after Week 1 even if ugly** — get the deployment loop working early. CI/CD set up by Week 2 of project 1.

End of 90 days: 3 deployed projects, polished READMEs, 3 resume bullets, GitHub heatmap green, pinned repos curated. Tu top 5% in the application pool by sheer execution.

---

## 11. README template

Copy-paste, fill blanks. Markdown.

```markdown
# ProjectName — One-line tagline

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://yourdomain.in)
[![Build Status](https://github.com/USER/REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/USER/REPO/actions)
![License](https://img.shields.io/badge/license-MIT-blue)

> 2-3 sentence problem statement: what real-world pain does this solve, who is it for, what's the differentiator.

**Live:** https://yourdomain.in
**Demo video:** [link or embedded GIF]

![App demo GIF](docs/demo.gif)

## Features

- Feature 1 (the non-trivial one — call it out)
- Feature 2
- Feature 3
- Feature 4

## Tech stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind, shadcn/ui
- **Backend:** Node.js + Fastify
- **DB:** Postgres (Neon) with Drizzle ORM
- **Cache:** Redis (Upstash)
- **Auth:** Clerk
- **Deploy:** Vercel (frontend) + Render (backend)

## Architecture

![Architecture diagram](docs/architecture.png)

Brief paragraph on key engineering decisions: why this DB, why this caching strategy, what trade-offs you made.

## Local setup

```bash
git clone https://github.com/USER/REPO.git
cd REPO
cp .env.example .env  # fill in your keys
npm install
npm run db:migrate
npm run dev
```

App runs at http://localhost:3000.

## Testing

```bash
npm run test       # unit
npm run test:e2e   # Playwright
```

## Performance benchmarks

- p95 read latency: 42ms (10K rps, k6)
- Cache hit ratio: 87% on hot endpoints
- Cold start (Render free tier): ~8s

## Roadmap

- [ ] Multi-region deploy
- [ ] Mobile app (React Native)
- [ ] Webhook delivery system

## License

MIT — see LICENSE file.
```

---

## 12. What goes on resume — bad vs good capstone bullets

Read `resume-behavioural.md` chapter on X-by-Y-Z. Here, 5 capstone-specific rewrites.

### Example 1: Splitwise clone

**Bad:**
> Built a Splitwise clone using MERN stack with login and group features.

What's wrong: no metric, no specific feature, "MERN" is vague, no live link mention.

**Good:**
> **PaisaSplit** ([live](https://paisasplit.in) | [code](https://github.com/u/paisasplit)) — Group expense tracker with **debt-simplification graph algo reducing N^2 settlement transactions to N-1** (60% fewer payments on test groups of 10). Next.js + Postgres + Clerk; tested with 200+ users in beta.

### Example 2: URL shortener

**Bad:**
> Made a URL shortener in Node.js.

**Good:**
> **TinyShort** ([live](https://tnsh.in)) — High-throughput URL shortener with **Redis caching achieving 87% hit ratio and p99 latency of 12ms** under k6 load test (5K rps). Built async analytics pipeline with BullMQ + monthly Postgres partitioning, scaling to 50K clicks/day on a single Render dyno.

### Example 3: AI note-taking

**Bad:**
> An AI note app where you can summarise notes using GPT.

**Good:**
> **BrainDump** ([live](https://braindump.app)) — Markdown note-taking app with **Groq Llama 3.1 70B-powered summarisation** and pgvector semantic search. Implemented Redis-backed response caching cutting LLM costs by **78%** (cache hit 80%+) on 1000+ test notes.

### Example 4: Mobile food delivery

**Bad:**
> Android food delivery app similar to Swiggy.

**Good:**
> **CampusBites** ([apk](https://campusbites.app/apk) | [demo video](https://youtu.be/x)) — 3-role food-delivery Android app (customer/restaurant/delivery) in **Kotlin Compose + Hilt + StateFlow** with Razorpay test-mode integration including HMAC signature verification on backend. Handled 200+ test orders end-to-end with FCM push notifications.

### Example 5: RAG chatbot

**Bad:**
> Built a chatbot using LangChain and ChatGPT.

**Good:**
> **CollegeQA** ([live](https://collegeqa.streamlit.app)) — RAG chatbot indexing **2K+ chunks from 20 PDFs** in ChromaDB with cross-encoder re-ranking and source-citation grounding. Achieved **88% citation correctness** on a 30-question hand-labeled eval against Groq Llama 3.1 70B.

### The pattern

Every good bullet has:
1. Project name + clickable live link or GitHub
2. One concrete differentiator (the non-trivial feature)
3. A hard number (latency, throughput, accuracy, cost reduction, user count)
4. Tech stack mentioned naturally (not as a separate "Technologies: ..." line)

---

## 13. Pre-deployment checklist

Before you put a project on resume, run through this list. 30 min of polish = 10x more recruiter trust.

**Security:**
- [ ] No secrets in repo (run `git log -p | grep -i 'api_key\|secret'`)
- [ ] `.env.example` committed, `.env` gitignored
- [ ] CORS configured (not `*` in production)
- [ ] Auth tokens in HTTP-only cookies, not localStorage
- [ ] Rate limit on public endpoints (per IP, simple in-memory or Redis)
- [ ] Input validation on every API (zod / pydantic / class-validator)
- [ ] HTTPS enforced (most platforms do automatically; verify)

**Performance:**
- [ ] Lighthouse score >= 80 on home page
- [ ] Images optimised (Next/Image, Cloudinary, or AVIF/WebP)
- [ ] Bundle size checked (`npm run build` output, code-split heavy libs)
- [ ] DB queries indexed (run `EXPLAIN ANALYZE` on top-3 queries)
- [ ] At least one cached endpoint with documented hit ratio

**Accessibility:**
- [ ] All buttons/links keyboard-accessible
- [ ] Form fields have `<label>` (not just placeholder)
- [ ] Colour contrast WCAG AA (use Chrome DevTools)
- [ ] Alt text on all images
- [ ] Focus visible on interactive elements

**Mobile:**
- [ ] Tested on actual phone, not just Chrome DevTools
- [ ] Touch targets >= 44px
- [ ] No horizontal scroll on 360px width
- [ ] Forms work with mobile keyboard (correct `inputmode` for numbers, emails)

**Polish:**
- [ ] Custom favicon (not Vercel/Next default)
- [ ] OG image set (so LinkedIn share looks good — recruiters do share)
- [ ] 404 page exists and is themed
- [ ] Loading states on every async action
- [ ] Empty states (no data) handled gracefully

Tick all 25 boxes. Then put the link on your resume.

---

Ek aakhri baat. Building 3 capstones is a grind — Week 6 mein motivation gir jayega, Week 9 mein laga doubt aayega "ye sab worth hai kya?" Yes. **Worth hai.** Recruiter screen mein ab 3 deployed links hain, README polished hain, GitHub heatmap green hai — tu uss 5% mein aa gaya jisko shortlist guarantee hai. Baaki LeetCode + system design + behavioural prep — sab tu interview mein dikhayega. Lekin interview tak pahuchne ka ticket — ye 3 projects hain.

Ab khol VS Code, ek project pick kar, day 1 ka commit aaj raat ko hi push kar de. 90 days ka counter shuru.

Chal, bana.
