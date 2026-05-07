# EngiNerd — Production Deploy Guide

> Step-by-step from `git clone` to public URL serving real users.
> Assumes you control a domain (e.g. `enginerd.in`) and have a Vercel + Neon account.

---

## What you're deploying

```
                    ┌─────────────────────┐
   enginerd.in ───► │      Vercel         │
                    │   (Next.js + Edge)  │
                    └──┬──────┬──────┬────┘
                       │      │      │
              ┌────────▼─┐  ┌─▼─────┐ ┌──▼─────────┐
              │  Neon DB  │  │ Resend │ │ Anthropic  │
              │  Postgres │  │ Email  │ │  Agents    │
              └───────────┘  └────────┘ └────────────┘
                       │
              ┌────────▼─────────┐
              │ Piston (Fly.io)  │
              │ multi-lang exec  │
              └──────────────────┘

   + MSG91 (SMS, async DLT)
   + Upstash Redis (rate limit)
   + PostHog (analytics)
   + Sentry (error tracking)
   + Google OAuth
```

---

## Phase 1 — Day 0: Get a basic deploy live (45 min)

### 1.1 Clone + install (3 min)

```bash
git clone <your-fork>
cd enginerd
npm install
```

### 1.2 Provision Neon Postgres (5 min)

```bash
# https://console.neon.tech → New Project
#   Name: enginerd-prod
#   Region: AWS Mumbai (ap-south-1) ← critical for Indian users
#   Postgres version: 17
# Copy the POOLED connection string (looks like: postgresql://...neon.tech/...)
```

### 1.3 Generate secrets (1 min)

```bash
echo "AUTH_SECRET=$(openssl rand -base64 32)"
echo "INTERNAL_ADMIN_TOKEN=$(openssl rand -hex 32)"
# Save both — you'll paste into Vercel env in step 1.5
```

### 1.4 Push schema to Neon (2 min)

```bash
# Locally, create .env.local with just DATABASE_URL set, then:
npm run db:migrate
# Verifies: 16 tables created (users, accounts, sessions, problems, etc.)
```

### 1.5 Deploy to Vercel (10 min)

```bash
npm i -g vercel
vercel login
vercel link

# Required env vars
vercel env add DATABASE_URL production         # paste Neon URL
vercel env add AUTH_SECRET production          # paste generated secret
vercel env add AUTH_URL production             # https://enginerd.in
vercel env add NEXT_PUBLIC_APP_URL production  # https://enginerd.in
vercel env add INTERNAL_ADMIN_TOKEN production # paste generated token

vercel --prod
```

You now have a live URL like `enginerd-xxx.vercel.app`. Auth works (OTP shows in Vercel function logs since MSG91/Resend not yet wired). Reading subjects works. Practice (JS only — Piston not deployed yet) works.

### 1.6 Connect your domain (15 min)

```
Vercel Dashboard → Project → Settings → Domains
  → Add: enginerd.in
  → Add: www.enginerd.in (auto-redirects to apex)

Vercel shows you DNS records to add. At your domain registrar:
  - A    @    76.76.21.21
  - AAAA @    2606:4700:4700::1111
  - CNAME www enginerd.vercel.app

Wait ~5 min for DNS, ~2 min for SSL provisioning.
```

### 1.7 Seed the 459 DSA problems (5 min)

```bash
# Locally with DATABASE_URL pointing at PROD Neon:
npm run problems:seed
# Verifies: "done — total parsed=460 inserted=460"
```

---

## Phase 2 — Day 1: Real auth providers (30 min + 4-7 days for DLT)

### 2.1 Google OAuth (10 min)

```
https://console.cloud.google.com/apis/credentials
  → Create OAuth Client ID → Web Application
  → Authorized redirect URIs:
        https://enginerd.in/api/auth/callback/google
        https://*.vercel.app/api/auth/callback/google  (for previews)
  → Copy Client ID + Client Secret

vercel env add AUTH_GOOGLE_ID production
vercel env add AUTH_GOOGLE_SECRET production
vercel --prod
```

Test: visit `/login` → "Continue with Google" → confirms email → lands on `/home`.

### 2.2 Resend email OTP (15 min hands-on + 1 hour DNS)

```
https://resend.com → Sign up
  → Domains → Add domain: enginerd.in
  → Resend shows 3 TXT records (SPF, DKIM, DMARC) + 1 MX record

At your DNS registrar:
  TXT    @                  v=spf1 include:_spf.resend.com ~all
  TXT    resend._domainkey  <copy from Resend>
  TXT    _dmarc             v=DMARC1; p=none; rua=mailto:dmarc@enginerd.in
  MX     send               feedback-smtp.eu-west-1.amazonses.com (priority 10)

Wait ~1 hour for DNS propagation. Resend dashboard shows "Verified".

vercel env add RESEND_API_KEY production         # paste your re_... key
vercel env add RESEND_FROM_EMAIL production      # EngiNerd <hello@enginerd.in>
vercel --prod
```

Test: `/login` → Email tab → enter your address → check inbox → 6-digit code arrives.

### 2.3 MSG91 phone OTP (start now, 4-7 days for DLT)

```
https://msg91.com → Sign up
  → Verify Indian phone + business
  → Submit DLT registration:
       - Provide PAN, GST/Udyam, business proof
       - Wait 4-7 working days for TRAI approval
  → After approval:
       - Create OTP template (one-time, ~5 min)
       - Get sender ID (6 alphanumeric chars, e.g. "ENGNRD")
       - Copy auth key

vercel env add MSG91_AUTH_KEY production
vercel env add MSG91_TEMPLATE_ID production
vercel env add MSG91_SENDER_ID production
vercel --prod
```

Until DLT approves, phone OTP works in dev-fallback (codes log to Vercel logs).

---

## Phase 3 — Day 2: Production hardening (30 min)

### 3.1 Upstash Redis for rate limiting (5 min)

```
https://upstash.com/redis → Create database (free tier, 10K commands/day)
  → Region: Mumbai or closest to your Vercel region
  → Copy REST URL + REST Token

vercel env add UPSTASH_REDIS_REST_URL production
vercel env add UPSTASH_REDIS_REST_TOKEN production
vercel --prod
```

Without this, the in-memory rate limiter resets on every cold start — unsafe at scale.

### 3.2 Sentry error tracking (10 min)

```
https://sentry.io → New Project → Next.js → Copy DSN

vercel env add SENTRY_DSN production              # server + edge
vercel env add NEXT_PUBLIC_SENTRY_DSN production  # browser
vercel --prod
```

Test: visit a page that throws (e.g. mistyped problem slug forced through `notFound()`).
Sentry inbox should show the event within 30s with redacted secrets.

### 3.3 PostHog analytics (5 min)

```
https://posthog.com → Sign up → Copy project API key

vercel env add NEXT_PUBLIC_POSTHOG_KEY production    # browser pageviews
vercel env add NEXT_PUBLIC_POSTHOG_HOST production   # https://us.i.posthog.com
vercel env add POSTHOG_API_KEY production            # server events
vercel --prod
```

Test: sign in with a fresh number → PostHog dashboard shows `auth.signup` event tagged with the user id within 30s.

### 3.4 Anthropic API (for AI agent runs) (2 min)

```
vercel env add ANTHROPIC_API_KEY production
vercel --prod
```

Without this, the agent pipeline runs in deterministic STUB mode (no API calls, no costs).

---

## Phase 4 — Day 3: Multi-language code execution (Piston) (30 min)

### Option A — Fly.io (recommended, $5-10/mo)

```bash
# 1. Install Fly CLI
curl -L https://fly.io/install.sh | sh

# 2. Spin up Piston
flyctl launch --image ghcr.io/engineer-man/piston \
  --vm-memory 1024 \
  --vm-cpus 1 \
  --region bom \
  --name enginerd-piston \
  --no-deploy
flyctl volumes create piston_data --region bom --size 10
# In fly.toml, mount the volume at /piston:
#   [[mounts]]
#     source = "piston_data"
#     destination = "/piston"
flyctl deploy

# 3. Install language packs (one-time)
PISTON=https://enginerd-piston.fly.dev
for pkg in "python:3.10.0" "node:18.15.0" "java:15.0.2" "gcc:10.2.0" "go:1.16.2"; do
  curl -X POST $PISTON/api/v2/packages \
    -H "Content-Type: application/json" \
    -d "{\"language\":\"${pkg%:*}\",\"version\":\"${pkg#*:}\"}"
done

# 4. Wire to Vercel
vercel env add PISTON_URL production
# (paste: https://enginerd-piston.fly.dev/api/v2)
vercel --prod
```

### Option B — Stay on the public Piston API

Won't work — became whitelist-only on 2026-02-15. Skip.

### Option C — Self-host on a cheap VPS (Hetzner, DigitalOcean)

Same Docker command as local dev:
```bash
docker run -d --name piston \
  --privileged --restart=unless-stopped \
  -p 2000:2000 \
  -v piston-data:/piston \
  ghcr.io/engineer-man/piston

# Open port 2000 in firewall, point Vercel at http://your-vps-ip:2000/api/v2
```

---

## Phase 4.5 — Day 3.5: Razorpay payments (45 min)

EngiNerd uses **Razorpay** (Indian PSP, supports UPI / cards / netbanking / wallets) for the Pro (₹299/mo) and Career (₹2,499/mo) plans. The full flow is server-driven and HMAC-signed end-to-end — card data **never** touches our servers.

### 4.5.1 Sign up + KYC

```
https://razorpay.com → Sign up (use a business email)
  → Dashboard → "Activate Account"
  → Submit: PAN, GST (if registered), bank account, business proof
  → KYC review takes 24–48 hours.
```

While KYC is pending, you can use **Test Mode** (top-right toggle) — test cards `4111 1111 1111 1111`, any future expiry, any CVV.

### 4.5.2 Generate API keys

```
Dashboard → Settings → API Keys → Generate Key
  → Copy `Key ID` (rzp_test_… or rzp_live_…)
  → Copy `Key Secret` ONCE (never shown again — store in 1Password)
```

Add to `.env.local` (and Vercel env vars):

```bash
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx   # same as above, exposed to client
```

> **Test → Live swap:** when KYC clears, regenerate keys in Live Mode and replace all three vars. The `_test_` vs `_live_` prefix in the key tells you which mode is active — don't mix them.

### 4.5.3 Configure webhook

The webhook is our backup activation path: if a user closes the browser before `/api/checkout/verify` fires, the webhook still captures the payment.

```
Dashboard → Settings → Webhooks → Add New Webhook
  → URL:    https://enginerd.in/api/webhooks/razorpay
  → Secret: <generate a 32-char random string, save it>
  → Events:
      ✅ payment.captured
      ✅ payment.failed
      ✅ subscription.charged
      ✅ subscription.cancelled
  → Active: ON
```

Add the secret to env:

```bash
RAZORPAY_WEBHOOK_SECRET=<the 32-char string from above>
```

> The route at `app/api/webhooks/razorpay/route.ts` reads the **raw** request body (no JSON parsing first) and HMAC-SHA256 verifies it against this secret. A mis-set secret = every webhook returns 401 silently.

### 4.5.4 Smoke test (Test Mode)

```bash
# 1. Order endpoint should return 503 with no keys, 200 with keys
curl -X POST https://enginerd.in/api/checkout/create-order \
  -H "Content-Type: application/json" \
  -H "Cookie: <your authjs.session-token cookie>" \
  -d '{"plan":"pro"}'
# Expect (with keys): {"orderId":"order_…","amount":29900,"currency":"INR",…}

# 2. Webhook signature rejection
curl -X POST https://enginerd.in/api/webhooks/razorpay \
  -H "x-razorpay-signature: deadbeef" \
  -d '{"event":"payment.captured"}'
# Expect: 401 invalid_signature

# 3. End-to-end browser flow
# - /  → Pricing → "Get Pro" → Razorpay popup
# - Pay with 4111 1111 1111 1111 / 12/30 / 123
# - Should land on /billing with plan=Pro, payment row in history
```

### 4.5.5 Going live

When KYC is approved and you've smoke-tested in Test Mode:

```
1. Razorpay Dashboard → toggle to Live Mode (top-right)
2. Settings → API Keys → Generate (Live)
3. Settings → Webhooks → Add (Live mode is a separate webhook config)
4. Update Vercel env vars: RAZORPAY_KEY_ID + KEY_SECRET + WEBHOOK_SECRET
   + NEXT_PUBLIC_RAZORPAY_KEY_ID  (all four — the test ones won't work in live)
5. Vercel → Deployments → Redeploy production
6. Make a real ₹299 payment yourself with a real card → verify /billing updates.
```

### 4.5.6 Refund / cancel flow

- **User-initiated cancel:** `/billing` → "Cancel subscription" → marks `cancel_at_period_end = true`. User keeps access until `currentPeriodEnd`. The `subscription.cancelled` webhook flips status to `cancelled` at period end.
- **Refund:** Razorpay Dashboard → Payments → find the payment → Refund. Our webhook will receive `refund.processed` (TODO: handler not wired in v1 — manually flip the user's plan to `free` in the DB if a full refund happens).

---

## Phase 5 — Day 4: Smoke-test end-to-end (15 min)

```bash
# 1. Health
curl https://enginerd.in/api/health
# Expect: {"status":"ok","checks":{"db":{"status":"ok"...

# 2. Auth — phone OTP
curl -X POST https://enginerd.in/api/auth/otp/phone/send \
  -H "Content-Type: application/json" \
  -d '{"phone":"9XXXXXXXXX"}'
# Expect: SMS arrives within 30s on the verified DLT template

# 3. Auth — email OTP
curl -X POST https://enginerd.in/api/auth/otp/email/send \
  -H "Content-Type: application/json" \
  -d '{"email":"you@gmail.com"}'
# Expect: Email arrives within 5s

# 4. Public pages render
curl -sI https://enginerd.in/ | grep "HTTP/"
# Expect: HTTP/2 200

# 5. Security headers present
curl -sI https://enginerd.in/ | grep -iE "strict-transport|content-security|x-frame"
# Expect: all 3 headers

# 6. Browser smoke
# - Open https://enginerd.in
# - "Mujhe ___ banna hai" hero with 3D logo loads
# - /login → Phone tab → real OTP → /home
# - /practice/razorpay-duplicate-payment-id → Python tab → submit → 6/6 ✅
# - / → Pricing → "Get Pro" → Razorpay popup → test card → /billing shows Pro
```

---

## Phase 6 — Day 5: Public launch (30 min)

### 6.1 Branch protection

```
GitHub → Settings → Branches → Add rule for `main`
  → Require status checks (CI must pass)
  → Require pull request reviews
  → Require linear history
```

### 6.2 Uptime monitoring (free tier)

```
https://betterstack.com → New monitor
  → URL: https://enginerd.in/api/health
  → Check every 1 min
  → Alert via SMS + email when status != "ok"
```

### 6.3 Database backups

Neon has automatic point-in-time restore (last 7 days on free tier; 30 days on Launch). No setup needed — verify in Console → Backups.

### 6.4 Cost monitoring

```
- Vercel: Settings → Usage → set spending limit ($20/mo for hobby tier)
- Neon: Settings → Spend cap → $5/mo
- Anthropic: console.anthropic.com → Limits → daily $5 cap
- MSG91: dashboard → Auto-recharge OFF, monitor balance
- Resend: dashboard → soft limit at 1000 emails/day
```

### 6.5 Launch checklist

- [ ] Domain SSL valid (browser shows lock icon)
- [ ] `/api/health` returns 200 with `db.status: "ok"`
- [ ] Sign-up via phone + email + Google all work
- [ ] At least 1 real user (you) signed up + marked a subject complete
- [ ] At least 1 problem solved across 3 languages (JS, Python, Java)
- [ ] Razorpay test-mode payment succeeds end-to-end (4111 card → /billing)
- [ ] Razorpay webhook returns 401 for bad signatures, 200 for valid events
- [ ] All Layer 0 placement subjects render under `/subjects/<slug>` (aptitude-quant, aptitude-logical, aptitude-verbal, dbms-complete, os-complete, networks-complete, lld-design, resume-behavioural, discrete-math-oop, compiler-toc)
- [ ] All Layer 1 specialisation subjects render (nodejs-backend, python-mastery, cpp-mastery, android-kotlin, cross-platform-mobile, backend-py-go, ml-engineer, data-engineer, qa-sdet, devsecops-appsec, embedded-iot)
- [ ] All Layer 3 exam playbooks render (tcs-nqt-playbook, infosys-sp-playbook, cog-cap-wipro-playbook, amcat-cocubes-elitmus, gate-cse, off-campus-playbook, faang-india-prep)
- [ ] All Layer 4 portfolio subjects render (capstone-bank, open-source-guide, hackathons-bip-freelancing, resume-behavioural)
- [ ] Each placement-prep roadmap loads at `/roadmaps/<slug>` (service-company-cracker, product-company-cracker, tcs-nqt-cracker, infosys-sp-cracker, service-trio-cracker, mern-stack-developer, backend-engineer, android-developer, flutter-rn-developer, ml-engineer, data-engineer, qa-sdet-cracker, devsecops-engineer, embedded-iot-engineer, gate-cse-cracker, off-campus-cracker, portfolio-builder)
- [ ] Public roadmap previews work — `/roadmaps` and `/subjects` reachable without sign-in (cycle 8+)
- [ ] Public practice previews work — `/practice` and `/practice/[slug]` reachable without sign-in (cycle 11+); editor shows "Sign in to run" CTA for unauthed
- [ ] CodeMirror loads lazily — switching language on a problem fetches the language pack on demand (cycle 12+)
- [ ] End-of-roadmap CTA suggests a specific follow-up — finish last subject of Service Cracker, see "Try Product Cracker next" card (cycle 13+)
- [ ] Skip-to-content link works — Tab on landing page → "Skip to content" link visible, Enter focuses `<main>` (cycle 13+)
- [ ] Vitest suite green: `npm test` shows 27+ passing
- [ ] Playwright e2e green: `npm run e2e` shows 22+ passing
- [ ] Public profile `/u/<handle>` resolves a known handle and 404s an unknown one
- [ ] Vitest suite green: `npm test` shows 27+ passing
- [ ] Sentry shows zero unresolved errors in last hour
- [ ] PostHog shows your test events
- [ ] BetterStack monitor reads green
- [ ] CI on main is green
- [ ] README updated with the LIVE domain

---

## Day 7+: Soft launch playbook

### Distribution week 1 (~₹0 spend)

- Post on personal LinkedIn + Twitter with one screen recording of the hero
- 5 messages to coding college groups on WhatsApp
- 3 cold DMs to Indian dev influencers (Anuj Bhaiya tier, not Apna College)

### Track these PostHog metrics daily

- `signups_today`
- `D1_retention` (came back next day)
- `mark_complete_per_user`
- `problem_solved_per_user`
- `auth.signin` by provider (Google vs phone vs email — drives provider investment)

### Bills you should expect at 100 DAU

| Service | Cost |
|---|---|
| Vercel Pro | $20/mo |
| Neon Launch | $19/mo |
| Resend (3K/day) | $0 (free tier) |
| MSG91 (100 OTPs/day × ₹0.18 × 30) | ₹540/mo |
| Upstash | $0 (free tier) |
| Sentry | $0 (5K events/mo free) |
| PostHog | $0 (1M events/mo free) |
| Fly.io Piston (1GB / 1 CPU) | $5/mo |
| Anthropic agent runs | $0-50/mo (depends on content gen) |
| **Total** | **~₹4,500-7,500/mo** |

At 1000 DAU, multiply DB + Vercel by ~3x. Still under ₹25K/mo for a real production app.

---

## Cycle 1-5 highlights — what's already shipped

- **Cycle 1** — Phase 9 Razorpay hardening: webhook subscription-forgery closed, idempotent capture, OTP brute-force closed, jobs-search abuse closed, button h-13 fix, payment.failed listener, ₹499 lie killed, "Phase 4" Jira leak removed, lib/format.ts, billing mobile fix.
- **Cycle 2** — Voice course-correction (UI English, content Hinglish), 0005 migration on Neon (6 indexes + razorpay_webhook_events + users.handle), public profile /u/[handle], LLD subject + product-company-cracker roadmap.
- **Cycle 3** — `unstable_cache` on getUserStats + getActiveSubscription, `waitUntil` deferral on 12 audit/track sites, limiter coverage on /api/me /progress /verify /cancel + LLM endpoints, RSC MarkdownRenderer (Mermaid + Shiki ~580KB lazy), phone +91 prefix, code-run skeleton, brand gradient cleanup, DBMS subject (1090 lines), Aptitude-Quant subject (835), service-company-cracker roadmap, Vitest setup with 17 tests.
- **Cycle 4** — Closed original cycle-2 plan: Aptitude-Logical (1012), Aptitude-Verbal (919), OS Complete (1298), Networks Complete (961), Resume+Behavioural (991) = 5181 new lines. Service Cracker expanded to 10-subject curriculum. SubjectMarkdownReader → RSC shell + interactive islands. users-store tests (10). 27/27 tests green.
- **Cycle 5** — Volume + Tracks: TCS NQT Playbook (1202), Node.js + Backend (1269), Python Mastery (1691), Android Kotlin (1740) = 5902 new lines. 3 new roadmaps (tcs-nqt-cracker, mern-stack-developer, android-developer). /u/[handle] loading skeleton.
- **Cycle 6** — Portfolio + Volume Expansion: C++ Mastery (1675), ML Engineer (1150), Infosys SP Playbook (1225), 20-Project Capstone Bank (974), Open Source Guide (1094) = 6118 new lines. 3 new roadmaps (ml-engineer, infosys-sp-cracker, portfolio-builder). Layer 4 finally moved off zero.
- **Cycle 7** — Layer 1 finish + Layer 4 closure: Data Engineer (1459), QA/SDET (1121), Off-Campus Playbook (1065), FAANG India Prep (870), Hackathons+BiP+Freelancing (1134) = 5649 new lines. 3 new roadmaps (data-engineer, qa-sdet-cracker, off-campus-cracker). Sidebar PLACEMENT_TRACKS section. **Layer 4 = 100%.**
- **Cycle 8** — Layer 1 + Layer 2 + Layer 0 closure + public catalog: Backend Py/Go (1843), Cross-Platform Mobile Flutter+RN (1507), DevSecOps/AppSec (1231), Discrete Math + OOP (1368), Mock Interview + GD + Comm (870) = 6819 new lines. 3 new roadmaps (backend-engineer, flutter-rn-developer, devsecops-engineer). `/roadmaps` + `/subjects` removed from PROTECTED_PREFIXES → public catalog drives signup conversion. Crossed 75% placement-readiness coverage.
- **Cycle 9** — Layer 3 long-tail + niche Layer 1 + final Layer 0: Cog+Cap+Wipro Playbook (1320), GATE CSE (1093), AMCAT+CoCubes+eLitmus (969), Embedded/IoT (1275), Compiler+TOC (872) = 5529 new lines. 3 new roadmaps (service-trio-cracker, gate-cse-cracker, embedded-iot-engineer). Layer 0 now 12/12 (100%).
- **Cycle 10** — 100% PLACEMENT-READINESS COVERAGE. Game Dev (1171), Blockchain/Web3 (1095), Salary Negotiation+Accenture/Deloitte+PSU combined (1017) = 3283 new lines. 2 new roadmaps (game-dev-engineer, blockchain-engineer). Playwright e2e setup (6 tests passing). UX-7: roadmap detail unauthed CTAs.
- **Cycle 11** — Engineering DX pivot. CodeMirror 6 editor replaces textarea (multi-language + theme + line numbers). /practice + /practice/[slug] removed from PROTECTED_PREFIXES (6th public surface). Featured tracks pills row on /roadmaps. 3 new Playwright spec files (auth-redirects + profile + security). Playwright count 6→19.
- **Cycle 12** — Engineering depth + marketing brief. CodeMirror language packs lazy-loaded via Compartment (saves ~80-120KB gz). End-of-roadmap recommendation card. /practice listing sign-in nudge. 2 new Playwright specs (practice-flow + featured-tracks). Playwright 19→22. Marketing launch brief at tech-team/marketing/launch.md (885 lines, 10 channels).
- **Cycle 13** — Launch-readiness. A11Y audit fixes (skip-to-content, aria-current on nav, real `<label>` on hero input, slate-500 → slate-400 for WCAG contrast). PERF audit fixes (avatar `<img>` width/height for CLS). Per-roadmap follow-up chain (Service → Product → MERN → Backend → DevSecOps; Data ladder; Mobile side-grade). end-of-roadmap CTA now suggests specific next roadmap. DEPLOY.md cycles 10-13 highlights.
- **Cycle 14** — Closed cycle-13 deferred audits. Hero RSC split (LCP element now server-rendered, ~250-400ms LCP win). `getUserProgressMaps` cached (30s TTL, per-user tag). Topbar dropdown full keyboard nav (Escape + arrows + Home/End + focus return). Reading-progress bar (rAF-throttled fixed-top gradient). Playwright 26 → 30.
- **Cycle 15** — Engagement polish + final pre-launch. "Continue: <last subject>" pill on /home. Streak-celebration toasts at 7/14/30/50/100/200/365 days. Reading-progress bar fades in/out. 3 new Playwright spec files. Playwright 30 → 33.

Total content on disk after cycle 15: **~101K lines** across 85 subject markdown files + 24 roadmaps + marketing brief + 33 e2e tests + 27 vitest unit tests.

---

## Final pre-launch checklist (post-cycle-15)

Before going live, complete these out-of-code operational items:

### Razorpay (live mode)
- [ ] Razorpay account KYC submitted + approved (24-48h)
- [ ] Live `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` in Vercel env (replace test keys)
- [ ] `NEXT_PUBLIC_RAZORPAY_KEY_ID` updated to live (used by upgrade-button.tsx)
- [ ] Live webhook URL (`https://enginerd.in/api/webhooks/razorpay`) configured in dashboard
- [ ] `RAZORPAY_WEBHOOK_SECRET` rotated to live secret
- [ ] First real ₹299 payment attempted by founder → /billing reflects Pro plan within 5s

### SMS / Email OTP
- [ ] DLT registration with TRAI (4-7 day turnaround) — `MSG91_TEMPLATE_ID` etc. live
- [ ] Resend / SES API key for email OTP in env
- [ ] OTP send + verify smoke-tested at +91-real-number + real-email
- [ ] Rate-limit visibly works: 4th OTP send within 1h returns 429 with `reset` ms

### Monitoring + alerts
- [ ] Sentry project created; `SENTRY_DSN` set; first staged error appears in dashboard
- [ ] PostHog project created; `NEXT_PUBLIC_POSTHOG_KEY` set; first event recorded
- [ ] BetterStack monitor on `https://enginerd.in/api/health` every 1 min; SMS + email alerts on red
- [ ] Sentry `data-loss` PR alerts wired (e.g., webhook idempotency table fail)

### Performance verification (cycle 14 wins)
- [ ] Lighthouse run on `/` (mobile profile, throttled 4G): LCP < 2.5s; CLS < 0.1; INP < 200ms
- [ ] Lighthouse run on `/practice/two-sum`: editor mounts < 500ms post-LCP
- [ ] Bundle audit: confirm Mermaid + Shiki + CodeMirror lang packs absent from initial route chunks

### Accessibility verification (cycle 13-14 wins)
- [ ] Tab from `/` reaches Skip-to-content link as first focusable element
- [ ] Topbar profile menu: Escape closes + returns focus, ArrowDown cycles items
- [ ] axe-core scan on `/`, `/login`, `/billing`, `/u/<handle>` — zero P0 violations
- [ ] Color contrast — slate-400 used as body color across hero/pricing/sidebar

### Content verification
- [ ] All 24 roadmaps load at `/roadmaps/<slug>`
- [ ] All 85 subjects load at `/subjects/<slug>` and render markdown body
- [ ] Public profile `/u/<handle>` for founder's own claimed handle resolves with stats

### Test sweep
- [ ] `npm test` — 27/27 vitest passing
- [ ] `npm run e2e` — 33/33 playwright passing
- [ ] `npm run typecheck` — clean
- [ ] `npm run build` — clean

### Marketing prep (per `tech-team/marketing/launch.md`)
- [ ] LinkedIn founder thread queued (10 posts, scheduled in Buffer / posted manually at 9 AM IST)
- [ ] Twitter/X launch thread queued (15 tweets)
- [ ] ProductHunt page drafted, hunter confirmed
- [ ] r/developersIndia post drafted (anti-self-promo rules followed)
- [ ] YouTube launch video shot (90s)
- [ ] TPO cold-outreach emails ready for first 50 colleges
- [ ] 10 Indian engineering creators identified for outreach

---

## Common deploy issues + fixes

### "Internal Server Error" on `/login` after deploy

You forgot `AUTH_URL`. NextAuth needs it for OAuth callback URL generation.

```bash
vercel env add AUTH_URL production   # https://enginerd.in (no trailing slash)
vercel --prod
```

### CSP blocks PostHog / Google OAuth

Open browser console → look for "Refused to connect" or "Refused to load script" errors. Add the offending domain to `connect-src` / `script-src` in `next.config.ts` `csp` array.

### Phone OTP works for some numbers, fails for others

DLT template has a strict variable allowlist. The OTP code variable must match — check MSG91 dashboard → Templates → your template → variable count = 1.

### Piston returns "Requested package X-Y does not exist"

Listings drift. Get the exact installable list from your instance:
```bash
curl https://your-piston-url/api/v2/packages | jq '.[] | select(.installed==false)'
```

### "function not defined" errors from `/api/execute`

The Piston harness expects a function name match. For Python, my harness tries both camelCase and snake_case. For Java/C++ — function name MUST match `fnName` exactly. If a problem's `fnName` is `hasDuplicatePayment`, the user's Java method must be `hasDuplicatePayment(...)`.

---

That's the deploy playbook. From `git clone` to public URL: **5-6 hours of hands-on time, plus 4-7 days waiting on DLT**.
