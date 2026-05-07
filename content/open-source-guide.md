# Open Source Contribution Guide

Yaar, sun le. Tu 6 months se LeetCode grind kar raha hai, 500 problems solve kar liye, har array trick yaad hai — aur tera resume abhi bhi "Built a To-Do app" pe ruk gaya hai. Recruiter ko kya dikhayega? Solved-counter ka screenshot? Bhai, **woh nahi chalega**.

Open source contribution is the **single most underused hireability lever** Indian students have. Ek merged PR to a real, alive repo (50+ stars, active maintainers) **beats 100 LeetCode problems** on your resume. Reason simple hai: LeetCode proves you can solve toy puzzles. A merged PR proves **tu real codebase mein, real maintainers ke saath, real review cycle mein ship kar sakta hai**. Ye exactly woh skill hai jo recruiters dhundh rahe hain.

Aur OSS pe career ki direct on-ramps hain — GSoC, MLH Fellowship, LFX Mentorship, Hacktoberfest. Yahan se log Google, Linux Foundation, CNCF projects mein ghuste hain — **without ever giving a DSA round**. Read karega, samjhega, then pick a repo today. End of week ek issue claim karna hai. End of month ek PR merge karna hai. Chalo shuru karte hain.

---

## 1. Why OSS beats LeetCode-only

Let's break the most painful myth pehle: "DSA hi sab kuch hai, baaki sab time-waste hai." Bullshit. DSA gate hai — entry ke liye chahiye, but it's not the differentiator. Lakhs of students DSA grind karte hain. Differentiator wahi hai jo **dusra nahi kar raha**. Aur dusra OSS nahi kar raha.

### 1.1 The hiring story: merged PR > 100 LeetCode

Imagine tu Razorpay ke recruiter ho. Tere paas 500 resumes hain SDE-1 role ke liye. 480 mein "DSA: 500 LeetCode solved, Codeforces 1500" likha hai. **Sab same dikh rahe hain.** Tu kya karega? Filter on something else.

Ab 20 mein tujhe ek bullet dikhta hai:

> Merged 4 PRs to `vercel/next.js` (130k+ stars), including a fix for App Router prefetching that shipped in v15.2 — [PR #71234](https://github.com/vercel/next.js/pull/71234).

**Yeh resume top of pile pe jata hai.** Why?

- **Proof of execution.** Real codebase, not a 200-line side project. You read 50k-line code, found the bug, fixed it, defended it in review.
- **Proof of communication.** PR description likhi, review feedback handle kiya, maintainers ke saath English-mein engage hua.
- **Proof of patience.** Maintainer 2 weeks baad reply karte hain — tu ghabra ke close nahi kiya, follow-up kiya politely.
- **Proof of taste.** Tune choose kiya `next.js` (tier-1 framework), not `random-todo-app` (tier-15 mela).

Recruiter ko ye sab signal ek bullet mein mil gaya. **LeetCode 500 vs Merged PR: not even close.** Ek 6-second triage mein tu instantly differentiated ho gaya.

### 1.2 The GitHub heatmap as a recruiter signal

Tera GitHub profile ka contribution graph (the green-square heatmap) — log kehte hain "wo just shows commits, fake bhi ho sakta hai." Theek hai, fake ho sakta hai. But experienced recruiters ko fake vs real instantly dikh jata hai:

- **Fake heatmap:** ek hi repo mein roz `update README.md` commits. Square green hai, but content shallow. Recruiter ne click kiya, dekha, laughed, closed.
- **Real heatmap:** different repos mein commits, PRs to other people's repos (those show on your profile under "Pull Requests" tab), issues opened, code reviews. **Diversity of activity is the signal.**

Aur agar tera heatmap **180+ days a year green** hai — across multiple repos, with real PRs — then recruiter ek instant decision le leta hai: "this person codes daily, not just before placements." That's a hireability signal worth lakhs.

**Action item:** apna GitHub profile abhi kholo (`https://github.com/yourusername`). Last 6 months kitne days green hain? Niche Pull Requests tab mein kitne PRs to OTHER people's repos hain? Agar dono zero ke aas-paas hain, **ye guide tere liye life-changing hai**. Padh aur shuru kar.

### 1.3 The "I can ship in a real codebase" proof

A side-project to-do app proves tu can write code. Lekin maintaining-a-codebase-with-other-humans is a different beast — and that's what hiring you means for the company.

Real codebases mein tujhe deal karna padta hai:

- **Existing patterns.** Repo ke pre-existing conventions, lint rules, test structure follow karna padta hai. Apni marzi ka code nahi likh sakta.
- **Backwards compatibility.** Tera fix kisi aur ka feature nahi todna chahiye. Regression tests likhne padte hain.
- **Code review.** Maintainer kahega "split this into 2 PRs" — tu argue nahi karega, kar dega.
- **Documentation.** Code change kiya to docs bhi update karne padte hain.
- **CI/CD.** Tests CI mein pass hone chahiye. Flaky tests debug karna seekhega.

Ye sab skills tu **akele apne to-do app mein kabhi nahi seekhega**. OSS tujhe forced exposure deta hai. Aur ye exact skills hain jo tujhe Day-1 productive employee banaate hain — **isliye recruiters OSS contributors ko prioritize karte hain**.

### 1.4 Indian product companies that hire OSS-friendly

Bhai, ye list yaad rakh. Ye companies actively OSS contributors ko prefer karti hain (some explicitly mention it in JDs, some have OSS-heavy engineering culture):

- **Postman** — Their entire collection format is open. They hire heavily from people who've contributed to OpenAPI, Swagger, Newman. Engineering blog mein OSS celebrate karte hain.
- **Razorpay** — Multiple internal tools open-sourced (`razorpay/blade`, `razorpay/shield`). Their engineers are active on GitHub. Mentioning a contribution to a payment-tech repo lands interview calls.
- **Chargebee** — Use OSS heavily, contribute back. Their engineering culture rewards engineers who go upstream to fix bugs in OSS dependencies.
- **Atlan** — Built on OSS data infrastructure (Apache Atlas, dbt). Hire data engineers who've contributed to dbt, Airflow, Spark.
- **Zerodha** — `kite-connect` and several internal tools open. Knaack KiteHQ hires engineers who ship publicly.
- **Hasura** — Their core (`hasura/graphql-engine`) is OSS. Contributing to Hasura is essentially an extended interview.
- **Freshworks, Browserstack, Swiggy** — All have OSS programs, hackathons, and OSS-friendly hiring funnels.

Aur global side: Vercel, Supabase, Cloudflare, MongoDB, HashiCorp, Elastic, Grafana — sab OSS-first companies hain. Direct hiring from contributors common hai.

**The strategic insight:** if you contribute to a repo run by Company X, the maintainers **are Company X engineers**. They're literally reviewing your code. A good contribution = 60% of the interview already done. Many companies hire repeat contributors **without a formal DSA round**. This is the highest-ROI move you're not making.

---

## 2. The 4 biggest programs Indian students should target

Open source random nahi karna. **Programs use kar** — these are structured tracks where you get a mentor, paid stipend, and a credential that goes straight on resume. Top 4, in order of leverage:

### 2.1 GSoC — Google Summer of Code

The OG. **12-week paid open-source program** sponsored by Google, run since 2005. You pick an organization (CNCF, Apache, GNOME, Postman, etc.) from the accepted list, propose a project, get matched with a mentor, ship code over the summer.

**Stipend (2024-25 rates):**

- Tier 1 (US/EU students): $6,600 (~Rs 5.5 lakh) for large project (350 hours)
- Tier 2 (India falls here): $3,000 (~Rs 2.5 lakh) for medium project, ~Rs 3.6 lakh for large
- Updated yearly, check google-summer-of-code.gitlab.io for current

**Timeline (every year, mark this):**

- **January end:** Organizations announced (~150-200 orgs accepted)
- **February:** Pick org, lurk on their Discord/Slack/Mailing list, submit small PRs to get noticed
- **March-April:** Proposal submission (this is the application — 2-4 page document explaining what you'll build)
- **May:** Acceptance announced
- **June-August:** Coding period
- **September:** Final evaluation, certificate, payment

**Eligibility:**

- 18+ years old
- Enrolled in any educational program (full-time, part-time, online, even high school in some cases) OR self-employed/career break with reasoning
- Available to work 175 or 350 hours over 12 weeks (~15-30 hrs/week)
- Not previously a GSoC student more than once (limit relaxed in recent years)

**Application checklist:**

- [ ] **Pick org by November-December** of previous year. Not January when announcements drop — too late then.
- [ ] **Lurk on their channels.** Read past 6 months of mailing list. Understand their priorities.
- [ ] **Submit 2-3 small PRs** before proposal time. Maintainers ko **already** pata hona chahiye tu kaun hai.
- [ ] **Talk to past students.** GSoC alumni list public hai. DM kar, "what worked for you?"
- [ ] **Proposal draft 2 weeks early.** Get mentor feedback before final submission.
- [ ] **Proposal structure:** Problem → Approach → Weekly timeline → Risks → About-me. 2500-4000 words.

**Success patterns:**

- **Pre-existing PRs to that org** — single biggest signal. 80% of selected students had prior commits.
- **Specific, scoped proposal** — "I'll build X feature" beats "I'll improve performance" (vague).
- **Mentor relationship.** Email the mentor pehle, ask if proposal direction is right. Org-mein-aalu-ka-paratha banane wala approach kaam karta hai.

**Common rejection reasons:**

- Generic proposal copy-pasted to multiple orgs (mentors detect this in 5 seconds)
- No prior contribution to org (signals you'll ghost mid-summer)
- Unrealistic scope ("I'll rewrite the entire compiler in 12 weeks" — bhai chal hat)
- Bad English / unclear writing — mentor cannot judge competence

**Indian success rate:** ~30-40% of all GSoC students globally are Indian (India has the most accepted students YoY). Ye program **literally tujhe target karta hai**. Ignore mat kar.

### 2.2 MLH Fellowship — Major League Hacking

GSoC ka chhota bhai, but more frequent and **less competitive**. Run by MLH (the same folks who do hackathons), sponsored by GitHub, Meta, Microsoft, etc.

**Stipend:** ~$5,000 USD (~Rs 4.2 lakh) for 12 weeks.

**Tracks:**

- **Open Source** — assigned to a real OSS project, contribute alongside maintainers
- **Production Engineering** (with Meta) — DevOps, SRE, infra work
- **Externship** (with sponsor companies) — work directly on company's projects

**Timeline (3 batches per year, every ~3 months):**

- **Spring batch:** Apply Dec-Jan, run Feb-April
- **Summer batch:** Apply Mar-Apr, run June-Aug
- **Fall batch:** Apply Jul-Aug, run Sep-Nov

So if you miss one, agla 3 months mein open ho jata hai. **Less stress than GSoC.**

**Eligibility:**

- 18+
- Currently enrolled OR within 12 months of graduation
- Available 40 hrs/week for 12 weeks (full-time, so internship-equivalent)

**Application checklist:**

- [ ] Online application: name, school, resume upload, GitHub URL, **2 essays** (~250 words each)
- [ ] Essays usually: "Why open source?" + "Tell us about a project you built"
- [ ] **Live coding interview** (~30-45 min, beginner-level — fizz-buzz to LeetCode-easy)
- [ ] **Behavioral interview** with MLH staff
- [ ] Total process: 3-4 weeks

**Success patterns:**

- **Honest essays.** Generic AI-written essays detected aur rejected.
- **GitHub profile with real activity.** Even small projects matter, but consistent commits matter more.
- **Apply early in the cycle** — they admit on rolling basis, slots fill up.

**Common rejection reasons:**

- Last-minute application (no time for thoughtful essay)
- Empty GitHub profile
- Bombing the live coding (it's not hard, but if you can't reverse a string, you're out)

**Why it beats GSoC for some:** rolling intake, full-time during fellowship (so it counts as internship on resume), and less proposal-writing overhead. Trade-off: less prestige than "GSoC at LLVM" type lines.

### 2.3 LFX Mentorship — Linux Foundation

The **cloud-native track**. LFX = Linux Foundation eXperience. Focus on CNCF projects (Kubernetes, Prometheus, Envoy, etcd, Argo, OpenTelemetry, Cilium, etc.).

**Stipend (varies by region):**

- India tier: ~$3,000 USD (~Rs 2.5 lakh) for 12 weeks
- ~10-15 hrs/week commitment

**Timeline (3 cohorts per year):**

- **Spring:** Mar-May
- **Summer:** Jun-Aug
- **Fall:** Sep-Nov
- Applications open ~6 weeks before each cohort starts

**Eligibility:** Open to anyone 18+, any education level, anywhere globally. **No college requirement** — career-changers welcome.

**Application checklist:**

- [ ] Browse open mentorships at `mentorship.lfx.linuxfoundation.org`
- [ ] Each project has its own application form + selection criteria
- [ ] **Cover letter** mandatory — why this project, what's your background, what'll you do
- [ ] **Pre-existing involvement** with the project massively boosts chances (file an issue, fix a typo, comment on a PR)
- [ ] Mentors review applications, pick mentees — usually 1-3 per project

**Success patterns:**

- **Cloud-native curiosity.** Read the CNCF landscape (`landscape.cncf.io`). Pick one project that genuinely excites you. Not "Kubernetes because resume."
- **Show pre-investment.** Comment on issues, attend the SIG meeting (open Zoom calls — anyone can join), ask questions.
- **Realistic project pitch.** "Add metrics for X subsystem" is achievable in 12 weeks. "Rewrite the scheduler" is not.

**Common rejection reasons:**

- Generic cover letter
- No prior project engagement
- Mismatch with project priorities (proposal addresses something maintainers don't care about)

**Why it's strategic:** CNCF projects pe contribute karne ka matlab hai **direct exposure to companies like Google, Red Hat, IBM, AWS, HashiCorp, DataDog** — they all sponsor CNCF heavily and hire from contributor pools. Ek LFX completion = job interviews at these companies.

### 2.4 Hacktoberfest — DigitalOcean + GitHub

The **entry-level habit-builder**. Every October, contribute 4 PRs to participating repos, get a free t-shirt + a tree planted (since 2022 the swag rotates between t-shirt/tree depending on year). Low bar, low prestige, but **highest accessibility**.

**Stipend:** None. Just swag + bragging rights + a habit.

**Timeline:** Every October 1-31. Registration opens September.

**Eligibility:**

- Anyone 13+
- Just sign up at `hacktoberfest.com`
- Contribute 4 valid PRs to participating repos (repos that have the `hacktoberfest` topic tag)

**Application checklist:**

- [ ] Sign up before Oct 1 (registration is free, just OAuth GitHub)
- [ ] Find repos with `hacktoberfest` topic and `good first issue` labels
- [ ] Open 4 PRs in October, get them merged or accepted (label `hacktoberfest-accepted`)
- [ ] Avoid spam PRs (random typo PRs, README emoji adds — these are flagged as `invalid` and don't count)

**Success patterns:**

- **Use it as a forcing function.** "I'll contribute 4 PRs to real repos this October" — this gets you over the inertia hump.
- **Pick one good repo, 4 PRs there** > 4 PRs to 4 random repos. Builds real reputation.
- **Document each PR with a LinkedIn post.** "Today I shipped X to repo Y" — recruiters notice.

**Common rejection reasons:**

- Spam PRs (auto-detected and marked invalid)
- Contributing to non-participating repos (must have `hacktoberfest` topic on the repo)
- Missing the October window (it only counts within the 31 days)

**Strategic role:** Hacktoberfest tera **first PR forcing function** hai. Use it October mein, build the habit, then graduate to GSoC / LFX / MLH for the paid programs.

### 2.5 Other programs worth knowing

Quick mentions:

- **Outreachy** — Diversity-focused (women, non-binary, underrepresented groups). $7,000 stipend for 12 weeks. May and December rounds. Open to non-students too.
- **Season of Docs (Google)** — For technical writers contributing to OSS docs. Smaller stipend ($500-$15,000). Less competitive.
- **GitHub Maintainer Month / Octernship** — GitHub's own internship/mentorship batches. Paid, 12 weeks.
- **Kubernetes Contributor Awards / Apprentice Program** — Niche but high-prestige.
- **FOSSEE Summer Fellowship (IIT Bombay)** — India-specific, summer, scientific Python ecosystem. ₹15-20k stipend.

---

## 3. Finding good first issues

Tu program apply karega tab tab hoga. Pehle tujhe ek skill chahiye: **find a good first issue and ship it**. Ye section ratta-maar.

### 3.1 GitHub label hunting

GitHub mein labels filter karne ka power tool hai. Yeh URL pattern memorize kar le:

```
https://github.com/issues?q=is:issue+is:open+label:%22good+first+issue%22+language:typescript+sort:updated-desc
```

Iska breakdown:

- `is:issue is:open` — only open issues
- `label:"good first issue"` — the standard label
- `language:typescript` — replace with your stack (`python`, `go`, `rust`, etc.)
- `sort:updated-desc` — recent first (avoid 3-year-old stale issues)

Standard labels jo dhundhne hain:

- `good first issue` / `good-first-issue` / `gfi`
- `help wanted` / `help-wanted`
- `beginner` / `beginner-friendly`
- `up for grabs`
- `first-timers-only` (super rare, super welcoming)
- `documentation` (often easiest first PR)

Aur ye **negative filter** important hai:

```
-label:"in progress" -label:"assigned"
```

To avoid issues kisi aur ne already pakad rakha hai.

### 3.2 The "is this repo alive" checklist

Kachra repos pe contribute mat kar — wahi reviewer 6 mahine baad reply karega aur tab tak teri PR rotting hogi. Before claiming any issue:

- [ ] **Stars > 100.** Less than that, repo is too small to be a hireability signal.
- [ ] **Last commit on default branch < 30 days ago.** Open `https://github.com/<org>/<repo>/commits/main`. Top commit ki date dekho.
- [ ] **Recent PR merge < 2 weeks ago.** Check `Pull Requests` tab → `Closed` → see merged dates. Fresh merges = active maintainer.
- [ ] **Open issues responded-to within 7 days.** Random issue kholo, dekho first maintainer reply ki gap.
- [ ] **Contributing guide exists.** `CONTRIBUTING.md` in root. Without it, PR process undefined hai aur frustrating hoga.
- [ ] **Contributor count > 20.** Solo-maintained repos (1 contributor) are bus-factor risks. Maintainer disappear ho gaya to teri PR void.
- [ ] **CI runs on every PR.** Check Actions tab — CI badges green hone chahiye on recent PRs.

Agar 6/7 boxes tick nahi hote, **dusra repo dhundh**. Time invest karne wala hai, choose carefully.

### 3.3 Avoiding stale issues

Sabse common rookie mistake: ek issue dekh ke "haan ye main solve karunga" — but issue 4 months pehle kisi aur ne claim kar liya hai aur abandon kar diya. Tu PR kholega, maintainer kahega "X already working on it" — bekaar effort.

**Process before claiming:**

1. Issue ke comments scroll karke neeche jao. Recent activity dekho.
2. Agar koi commenter ne kaha "I'll work on this" within last 3 weeks, **skip it** unless they say "I'm dropping it".
3. Agar 3+ weeks ho gaye since their claim, politely comment: *"Hi @username, are you still working on this? If not, I'd like to take it up."* Wait 3-5 days for response.
4. No response → comment to maintainer: *"I'd like to work on this issue. Is anyone currently assigned?"*
5. Maintainer green-lights → start coding.

**Pro tip:** check maintainer ka recent activity bhi. Agar maintainer 2 weeks se quiet hai (vacation/burnout), even a green-lit PR will sit. Pick another repo.

### 3.4 Setting up the dev environment without breaking things

Ye step pe 50% beginners hare ho jaate hain. Repo clone kiya, `npm install` chala, errors ki barish ho gayi, frustrated ho ke chod diya. **Don't.** Process:

```bash
# Step 1: Fork on GitHub UI, then clone YOUR fork
git clone https://github.com/yourusername/<repo>.git
cd <repo>

# Step 2: Add upstream remote (the original repo)
git remote add upstream https://github.com/<org>/<repo>.git
git remote -v  # verify both 'origin' (your fork) and 'upstream' (original)

# Step 3: Read CONTRIBUTING.md FIRST
cat CONTRIBUTING.md  # or just open it in browser

# Step 4: Read README.md setup section
# Yaar, README padh ke uske bina mat suru kar — 90% setup answers wahin hain.

# Step 5: Install exact versions
node --version  # match the one in package.json "engines" or .nvmrc
nvm use         # if .nvmrc exists
npm install     # or yarn / pnpm whatever's specified

# Step 6: Run tests on a clean main BEFORE making any changes
npm test        # tests should pass on default branch
```

**Critical:** if tests fail on a clean clone of `main`, **the repo is broken or your environment is wrong**. Open an issue or check existing issues — don't proceed assuming it's normal. Saving yourself 4 hours.

**Step 7: Create a branch for your work:**

```bash
git checkout -b fix/<short-issue-description>
# OR
git checkout -b feat/<feature-name>
# Branch naming convention: check CONTRIBUTING.md
```

### 3.5 Discovery sites (besides GitHub directly)

Bhai, ye sites tujhe hand-curated good-first-issues feed karte hain. Bookmark all:

- **`goodfirstissue.dev`** — by Mungell, filter by language, sees all repos with the label.
- **`up-for-grabs.net`** — manually curated list of OSS projects that welcome new contributors.
- **`codetribute.mozilla.org`** — Mozilla projects, beginner-tagged.
- **`firsttimersonly.com`** — list of repos that explicitly use `first-timers-only` label.
- **`code.likeagirl.io/finding-good-first-issues`** — community blog roundups.
- **`24pullrequests.com`** — annual challenge: 24 PRs in December. Repo discovery.
- **`opensauced.pizza`** — discover repos by activity, contributor patterns.

Filter, pick 3 candidate repos, run the "is this alive" checklist, then commit to one for 30 days.

---

## 4. The PR-writing workflow

Ab tune issue claim kar liya, code likh liya. PR raise karne ka time. Ye section sabse important hai — **bad PR = wasted code = no merge = no resume bullet**. Process steel-bound hai.

### 4.1 The standard fork-clone-branch-commit flow

```bash
# (You've already forked + cloned + remoted upstream from §3.4)

# 1. Sync your fork with upstream main BEFORE starting
git checkout main
git fetch upstream
git rebase upstream/main          # bring local main up to date
git push origin main              # update your fork's main

# 2. Create a feature branch
git checkout -b fix/login-redirect-loop

# 3. Make your changes. Code. Test locally.
# ... edit files ...
npm test                          # tests pass locally
npm run lint                      # linter clean

# 4. Stage and commit (conventional commit format — see §4.2)
git add src/auth/login.ts src/auth/login.test.ts
git commit -m "fix(auth): prevent infinite redirect when session is stale

The login handler was checking session validity AFTER the redirect,
causing a loop when the session token had expired between the
auth check and the page render. Moved the check earlier and added
a regression test.

Fixes #4521"

# 5. Push to YOUR fork's branch
git push origin fix/login-redirect-loop

# 6. Open the PR on GitHub
gh pr create --base main --head yourusername:fix/login-redirect-loop \
   --title "fix(auth): prevent infinite redirect when session is stale" \
   --body-file pr-description.md
```

**Pro tip:** install `gh` (GitHub CLI). Saves 10 clicks per PR. `gh pr create`, `gh pr status`, `gh pr checkout 1234` — all faster than browser.

### 4.2 Conventional commit format

Most active OSS repos use **Conventional Commits**. Don't deviate. Format:

```
<type>(<scope>): <short description>

<longer body — what and why, not how>

<footer — fixes #issue, breaking changes>
```

**Types:**

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation only
- `style:` — formatting, no code change
- `refactor:` — code restructure, no behavior change
- `perf:` — performance improvement
- `test:` — adding tests
- `chore:` — tooling, dependencies
- `ci:` — CI/CD changes

**Examples:**

```
feat(auth): add OAuth GitHub provider
fix(api): handle null user-agent header in middleware
docs(readme): correct npm install command
refactor(db): extract connection pool into separate module
perf(render): memoize expensive component re-renders
test(auth): add edge cases for expired-token flow
chore(deps): bump react from 18.2.0 to 18.3.1
```

**Subject line:** under 72 characters, imperative mood ("add" not "added"), no period at end.

**Body:** explain *why*, not *what*. Code already shows the *what*. Reviewer wants context.

**Footer:** `Fixes #1234` or `Closes #1234` auto-links and auto-closes the issue when PR is merged. Use it.

### 4.3 The PR description: the Maintainer Test

When drafting your PR description, ask: *"If I were the maintainer reading this for the first time, would I merge it without asking any questions?"* If you'd ask 3+ questions, your description is incomplete.

**Standard PR template (most repos provide one — check `.github/PULL_REQUEST_TEMPLATE.md`):**

```markdown
## What

Brief description of the change. 1-2 sentences.

## Why

Link to issue: Fixes #4521

Context: Users were getting stuck in an infinite redirect loop
when their session expired between the auth-check middleware
and the actual page render. This affected ~5% of returning users
based on Sentry data (see issue for traces).

## How

- Moved the session validity check from `renderPage` to the middleware.
- Added a 200ms grace period for clock skew across distributed sessions.
- Added regression test in `src/auth/login.test.ts:47`.

## Screenshots / GIFs

(For UI changes — Loom or Cleanshot recordings)

Before: [GIF showing redirect loop]
After: [GIF showing clean redirect]

## Testing

- [x] Existing tests pass (`npm test`)
- [x] Added new test for the regression
- [x] Tested manually on Chrome 120, Firefox 121, Safari 17
- [x] Tested with expired session, fresh session, no session

## Breaking changes

None. Backwards compatible — existing flows unchanged.

## Checklist

- [x] Read CONTRIBUTING.md
- [x] Conventional commit format used
- [x] Tests added/updated
- [x] Docs updated (no doc changes needed)
- [x] Linter clean
```

**The maintainer reads this in 30 seconds and can say "approve" without context-switching.** That's the goal.

### 4.4 Linking issues, screenshots, GIFs

- **Always link the issue.** "Fixes #1234" in PR body. Without it, maintainer has to manually correlate PR ↔ issue.
- **Screenshots for ANY UI change.** No exceptions. Maintainers will not run your branch locally just to see what changed.
- **GIFs for interactions** — animations, hover states, transitions. Use Cleanshot, ScreenToGif, Kap (Mac), or Peek (Linux).
- **Loom for complex flows** — multi-step user journeys benefit from a 30-second video.
- **Code blocks for terminal output** — paste actual command output, not screenshots of terminals.

### 4.5 The "small focused PR" rule

**One concern per PR.** Maintainers reject big bundled PRs because they're impossible to review.

Bad: ek PR mein "fixed bug + added feature + reformatted 200 files + updated docs."

Good: 4 separate PRs, each focused, each linked to its own issue.

**Test:** describe your PR in one sentence without using "and." If you need "and", split.

- *"Fix login redirect loop"* — ek PR.
- *"Fix login redirect loop AND add OAuth GitHub provider"* — do PRs.

**Sweet spot:** 50-300 lines changed per PR. Above 500 lines, maintainers visibly groan. Below 10 lines, looks too trivial (unless it's a typo fix).

### 4.6 Pre-PR self-review

Before clicking "Create PR", do this self-review:

```bash
# View your full diff
git diff main...HEAD

# Check files changed
git diff --name-only main...HEAD
```

Read every line as if you're the reviewer. Ask:

- Are there `console.log` / `print` debugging statements left? Remove.
- Is there commented-out code? Remove.
- Are there irrelevant whitespace/format changes? Revert.
- Are imports sorted (per project convention)?
- Are all new functions/exports documented (if project requires)?

**Self-review catches 80% of round-1 review comments.** Save yourself a review cycle.

---

## 5. Handling code review

Tera PR open ho gaya, mubarak ho. Ab **review aayega**. Aur review aayega tougher than tu expect kar raha hai. Section ratta maar — ye saaf bachayega tujhe maintainer-frustration-and-PR-rotting waale fate se.

### 5.1 The first review comment is rarely about the code

Important truth: **first round of review is usually about clarity, not correctness**. Maintainer asks:

- "Why did you choose this approach?"
- "Can you split this PR?"
- "Add a test for X edge case?"
- "Update the docs to mention this?"

Ye **personal attack nahi hai**. Ye standard process hai. Tu apne ego ko side mein rakh, professionally engage kar.

### 5.2 Responding to feedback: thank → fix or explain

**Always:**

1. Thank the reviewer (1-line, sincere not sycophantic).
2. Either push the fix OR explain your reasoning.
3. Mark the comment resolved AFTER addressing.

Examples:

> Reviewer: "Can you extract this into a helper function? It's repeated 3 times."

**Bad response:** "Done." (too terse, no thank)

**Good response:**
> Thanks for catching this — agreed, I extracted it to `utils/normalize.ts`. Pushed in commit `a3f4d2`. Let me know if the placement is right.

> Reviewer: "Why are you using `useEffect` here instead of `useMemo`?"

**Bad response:** "I think `useEffect` is better." (no reasoning)

**Good response:**
> Good question — I went with `useEffect` because the side-effect needs to happen post-render (we're updating an external store), and `useMemo` runs during render which would cause a flush warning. But happy to discuss if you have a different angle.

### 5.3 When to push back vs accept

**Accept changes when:**

- The reviewer is right (most of the time).
- The change is stylistic and matches project conventions.
- The reviewer is the maintainer (they have final say).

**Push back when:**

- You have specific reasoning the reviewer might not have considered.
- The suggestion would introduce a new bug or regression.
- The suggestion contradicts another part of the codebase.

**How to push back:** never adversarially. Always with data/reasoning.

> *Pushing back politely:* "I tested this approach earlier and ran into [specific issue]. The current implementation handles that case in [file:line]. Happy to refactor if you have a different way to handle that — what would you suggest?"

If the reviewer maintains their position, **defer to them**. Their repo, their rules. Don't burn the bridge over a one-line preference.

### 5.4 The "follow-up PR" tactic

Sometimes a reviewer asks for additional scope:

> "While you're here, can you also fix the X issue and refactor Y module?"

**Don't say yes immediately.** That bloats your PR and delays the merge.

**Say:**
> Great suggestion — I'd love to address that, but I'd prefer to keep this PR focused on the original fix to make review easier. I'll open a follow-up PR for [X] right after this merges. Filed as #[issue-number] for tracking.

This:
1. Keeps your current PR small.
2. Shows you're a serious contributor (you understand "small focused PRs").
3. Builds your contribution count (one feature → multiple PRs).
4. Maintainer almost always agrees.

### 5.5 Time-zone realities

Bhai, ye sun: most major OSS maintainers are in EU/US time zones. Tu Mumbai mein 11pm pe PR open kiya — maintainer abhi 1pm pe lunch kha raha hai. Reply 12 hours mein aayega, then your reply 12 hours later.

**One review cycle = 24-48 hours**.

A typical PR takes **1-3 weeks** from open to merge. Don't panic. Don't @mention the maintainer multiple times. Don't email them on LinkedIn. **Patience.**

**If 7 days no response:** one polite bump comment. *"Hey @maintainer, just bumping this — happy to address any feedback when you have time. No rush!"*

**If 3 weeks no response:** you can ping in their Slack/Discord politely. Or ping a different maintainer if multiple are listed in CODEOWNERS.

**If 2 months no response:** the repo is dying. Move on. Don't tie ego to a stale PR.

### 5.6 What if the PR gets rejected?

Sometimes you'll get: *"Thanks for the contribution, but we've decided not to go this direction."*

**Don't:**
- Argue.
- Get defensive.
- Take it personally.

**Do:**
- Reply: *"Totally understood, thanks for the time reviewing. I'll keep an eye out for other issues to contribute to."*
- Move on to the next issue.
- The work is **not wasted** — you can still mention "Contributed to repo X" on resume even for unmerged PRs (be honest about status if asked).

Sometimes rejected PRs are about timing, scope, or strategic direction. Not about your code. Don't internalize.

---

## 6. Building maintainer reputation over 6 months

One PR is good. Ten PRs to one repo over 6 months is **career-defining**. Strategy here:

### 6.1 Pick 1 repo, contribute consistently

Spreading thin: 1 PR each to 10 repos = forgettable.

Going deep: 10 PRs to 1 repo = "this person is part of the community."

Pick a repo where:

- You'd use the tool yourself (genuine interest sustains motivation).
- It's actively maintained (per §3.2 checklist).
- Maintainers are on Slack/Discord (community-driven).
- The tech stack matches your career direction.

Commit to **6 months minimum**.

### 6.2 The 4-stage trajectory

**Stage 1: Good first issues (Months 1-2)**
- Pick `good first issue` labeled tickets.
- Get 2-4 PRs merged.
- Goal: maintainer recognizes your username.

**Stage 2: Non-trivial features (Months 2-4)**
- Move to `help wanted` or unlabeled issues.
- Take on something requiring design discussion.
- Goal: 2-3 features merged, you've earned trust.

**Stage 3: Reviewing others' PRs (Months 3-5)**
- Subscribe to repo notifications (Watch → All Activity).
- When new PRs open, review them. Drop helpful (not nitpicky) comments.
- Maintainers love when contributors share review load.
- Goal: maintainers cite your reviews in decisions.

**Stage 4: Triage + maintainer invite (Month 5-6+)**
- Triage incoming issues: label them, ask clarifying questions, close duplicates.
- This is THE highest-leverage activity — saves maintainers hours per week.
- Eventually: invite to maintainer team / commit access / triage role.

**Real example:** a fresher contributing to `nextauthjs/next-auth` in 2022 went from "first issue" to "maintainer" in 7 months. Today they work at Vercel. Pattern repeats.

### 6.3 The "I'll fix the test/CI" gateway tactic

The fastest way to get maintainer love: fix their broken tests / flaky CI / slow build.

- Open the Actions tab. See which jobs are red or slow.
- Open recent PRs. See where reviewers complain about flaky tests.
- Open an issue: *"I noticed the `e2e:firefox` job is flaky. Here are 5 recent runs where it failed intermittently. Happy to investigate."*
- Maintainers will hand you the keys instantly. Flaky tests are a maintainer's nightmare.

This is **invisible-but-loved** work. Most contributors avoid it (boring). Doing it puts you on a fast track.

### 6.4 Documentation contributions

**Underrated.** Documentation PRs:

- Are usually faster to review and merge.
- Help you deeply understand the codebase (you have to read everything to write about it).
- Are often the #1 friction point users hit — fixing docs = directly improving project adoption.

**Doc PR ideas:**

- Add missing examples to API reference.
- Fix outdated code in tutorials.
- Translate docs to your language (Hindi, Tamil, Bengali contributions are valued).
- Add a "common gotchas" section based on Stack Overflow questions.
- Create a getting-started video walkthrough (often welcomed).

A solid docs PR is a *gateway* — once you've shipped one, maintainers see your username, and your next code PR gets reviewed faster.

### 6.5 What "consistent" means

- 1-2 PRs per month minimum.
- 1 issue triage per week (5 minutes — label, ask question, close duplicate).
- 1 PR review per week (read someone else's code, drop comments).
- Show up in Slack/Discord weekly. Help newer contributors with their setup issues.

**Three months of this and you're known. Six months and you're trusted. Twelve months and you're a maintainer.**

---

## 7. What goes on your resume + LinkedIn

OSS work to dikhana hai. Ye placement section hai. Ratta maar.

### 7.1 GitHub URL in resume header

Every resume **must have**:

```
Aarav Sharma | aarav@example.com | +91-98XXXXXX | github.com/aaravsharma | linkedin.com/in/aaravsharma
```

GitHub URL **not optional**. Recruiter clicks it within 30 seconds of opening your resume. Make sure your profile:

- Has a README profile (the special `username/username` repo) introducing yourself.
- Pinned 6 best repos at the top.
- Real activity on heatmap.
- Bio mentions your tech focus.
- Email visible (so recruiters can reach you off-platform).

### 7.2 Pinned repos: the 6-best mix

You can pin exactly 6 repos. Mix:

- **3 personal capstone projects** (your strongest builds — see `capstone-bank.md` for ideas).
- **3 OSS contributions** (forks of repos you contributed to, OR if you're a maintainer, the actual repo).

For OSS forks — **rename the fork** if it has unclear naming. Add a README clarifying your specific contributions.

Example pinned repo description:

> *Forked from `vercel/next.js` (130k stars). My contributions include: fix #71234 (App Router prefetching bug), feat #69821 (TypeScript inference for `metadata` API), 4 other PRs merged. See [my PRs filtered to this repo](https://github.com/vercel/next.js/pulls/aaravsharma).*

This makes contributions **scannable** for the recruiter.

### 7.3 Resume bullet structure for OSS

Use the X-by-Y-Z framework (see `resume-behavioural.md` for context):

**Bad:**

> *"Contributed to open source projects."*

(Vague, no signal, no metrics.)

**Good:**

> *"Merged 4 PRs to **vercel/next.js** (130k+ stars), including a fix for App Router prefetch race condition that shipped in v15.2. Reduced p99 navigation latency by 14% per maintainer benchmarks."*

Notice:
- Specific repo, specific star count (anchors prestige).
- Specific PR(s) — quotable on the resume itself.
- Specific impact metric — recruiters love numbers.
- Verifiable — they can click and see.

### 7.4 5 bad-vs-good OSS resume bullets

**1.**

Bad: *"Familiar with open source contribution."*

Good: *"Authored 6 merged PRs to **fastapi/fastapi** (75k stars) over 4 months, including issue #9821 fix that resolved a regression affecting WebSocket disconnects in production deployments."*

**2.**

Bad: *"Worked on Hacktoberfest and submitted PRs."*

Good: *"Completed Hacktoberfest 2024 with 4 merged PRs to **chakra-ui/chakra-ui**, **tailwindlabs/headlessui**, and **shadcn/ui** — all reviewed and merged by maintainers within 7 days each."*

**3.**

Bad: *"Selected for Google Summer of Code."*

Good: *"Selected as **GSoC 2024 contributor** with **CNCF / Helm**. Built a 12-week project to add OCI artifact support to Helm CLI (PR #12482, 2k+ lines). Stipend: $3,000. Mentored by [Maintainer Name]. Final report at [URL]."*

**4.**

Bad: *"Open source contributor."*

Good: *"Top-50 contributor to **microsoft/playwright** by commit count. Reviewed and triaged 30+ community issues monthly. Authored the `expect.poll` API extension (PR #28145), now used in 800+ downstream projects per GitHub usage data."*

**5.**

Bad: *"Made open source contributions to several projects in 2024."*

Good: *"Maintainer status on **wagmi-dev/viem** (Ethereum TypeScript library, 8k stars). Merged 23 contributor PRs, shipped v2.1 release, authored documentation rewrite that reduced new-user time-to-first-call from 45 min to 10 min."*

Each "good" version is **specific, quantified, verifiable**. Recruiter ko 6 seconds mein full picture mil gayi.

### 7.5 LinkedIn About paragraph

Ek paragraph mein OSS callout. Example:

> *I'm a final-year CS student at [College] focused on full-stack TypeScript and cloud-native infrastructure. Active **open-source contributor to vercel/next.js, fastapi/fastapi, and shadcn/ui** with 14 merged PRs in the last year. Selected for **GSoC 2024 with CNCF**. Looking for SDE-1 roles where I can ship real code from day one.*

Three things doing work here:
- Specificity (named repos)
- Recency (last year)
- Credential (GSoC)
- Signal (looking for SDE-1)

### 7.6 The LinkedIn "Featured" section trick

LinkedIn ka **Featured** section underused hai. It pins items at the top of your profile. Use it for:

- A link to your most-merged PR with a screenshot ("My contribution to Next.js 15.2").
- Your GSoC certificate (image + Google Drive link).
- A blog post you wrote about your OSS journey.
- A LinkedIn post that went viral about your contribution.

Recruiters scan the Featured section before scrolling further. **3-4 high-quality items here = instant credibility.**

### 7.7 LinkedIn posts: the OSS announcement formula

Every merged PR = one LinkedIn post. Formula:

```
🎉 Just got my first PR merged to [project name]!

Quick story: [2-3 lines on the bug/feature you fixed]

What I learned:
1. [Technical learning]
2. [Process learning — code review, communication, etc.]
3. [Meta learning — patience, asking for help, etc.]

Big thanks to [maintainer name] for the thoughtful review.

If you're a student wondering whether to start with OSS — start today.
The first PR is the hardest. After that, it gets easier.

Link to PR: [URL]

#opensource #softwareengineering #studentdeveloper
```

**Don't:**
- Use 30 hashtags.
- Beg for likes.
- Tag everyone you know.
- Use AI-written generic posts.

**Do:**
- Be specific (the more specific, the more shares).
- Tell a small story.
- Credit the maintainer.

These posts compound. After 6 posts, recruiters who follow you start associating you with shipping. **That's the brand you want**.

---

## 8. Repo recommendations by track

Pick by your career direction. For each: a one-line "why this repo" and a **contribution-type-that-pays-off-most**.

### 8.1 Web / JavaScript / TypeScript

- **`vercel/next.js`** (130k+ stars) — The framework. Massive surface area, hundreds of `good first issue`s. Best ROI: reproducing bug reports and writing minimal repros (maintainers love).
- **`shadcn-ui/ui`** (75k+ stars) — Modern UI components. Best ROI: fixing accessibility issues, adding new primitive components.
- **`withastro/astro`** (50k+ stars) — Static site framework. Smaller team, very welcoming. Best ROI: integration plugins (`@astrojs/*`).
- **`mantinedev/mantine`** (27k+ stars) — React components library. Best ROI: TypeScript type improvements, accessibility fixes.
- **`drizzle-team/drizzle-orm`** (28k+ stars) — TypeScript ORM, fast-growing. Best ROI: dialect support (Postgres edge cases, MySQL features), test coverage.
- **`tanstack/query`** (44k+ stars) — Data-fetching library. Best ROI: docs/examples, edge-case bug repros.

### 8.2 Python

- **`fastapi/fastapi`** (78k+ stars) — Async web framework. Most welcoming Python OSS community. Best ROI: docs, tutorial improvements, bug fixes around dependency injection.
- **`pydantic/pydantic`** (22k+ stars) — Data validation library. Best ROI: type system improvements, error message clarity.
- **`pola-rs/polars`** (32k+ stars) — Rust+Python dataframe library. High prestige. Best ROI: Python API ergonomics, tutorial notebooks.
- **`langchain-ai/langchain`** (95k+ stars) — LLM orchestration. Best ROI: integration adapters, chain examples, deprecation cleanup.
- **`huggingface/transformers`** (135k+ stars) — ML library. Best ROI: model integrations, tokenizer fixes, documentation.

### 8.3 Mobile

- **`flutter/flutter`** (165k+ stars) — Google-maintained, super-active. Best ROI: platform-specific bugs (Android/iOS edge cases), widget improvements, documentation.
- **`react-native-community/*`** (umbrella org) — RN packages. Best ROI: native module bugs (Android/iOS native code), TypeScript types.
- **`tachiyomiorg/tachiyomi`** (29k+ stars) — Manga reader for Android (Kotlin). Best ROI: source extensions (each manga site has its own).
- **`software-mansion/react-native-reanimated`** (9k+ stars) — Animation library. Best ROI: gesture handler improvements, example apps.

### 8.4 AI / ML

- **`ggerganov/llama.cpp`** (70k+ stars) — Run LLMs locally on CPU. Cutting-edge. Best ROI: Quantization formats, hardware-specific optimizations, API server improvements.
- **`huggingface/transformers`** (135k+ stars) — Already mentioned. Best ROI also includes adding new model support.
- **`ollama/ollama`** (95k+ stars) — Local LLM runner. Best ROI: integration adapters, modelfiles, CLI improvements.
- **`vllm-project/vllm`** (30k+ stars) — High-throughput LLM serving. Best ROI: kernel optimizations, scheduler improvements (advanced).
- **`comfyanonymous/ComfyUI`** (55k+ stars) — Stable Diffusion UI. Best ROI: custom nodes, workflow examples.
- **`langchain-ai/langgraph`** (8k+ stars) — Agent framework, growing fast. Best ROI: examples, integration with new LLM providers.

### 8.5 DevOps / Infrastructure / Cloud-Native

- **`kubernetes/kubernetes`** (110k+ stars) — The big one. Hard but highest prestige. Best ROI: starting with `kubernetes/website` (docs) before going to core.
- **`helm/helm`** (27k+ stars) — Kubernetes package manager. Best ROI: helper functions, chart linting improvements.
- **`prometheus/prometheus`** (56k+ stars) — Monitoring. Best ROI: exporter ecosystem, query language enhancements.
- **`open-telemetry/opentelemetry-collector`** (4k+ stars) — Observability. Best ROI: receiver/exporter plugins.
- **`hashicorp/terraform`** (43k+ stars) — IaC tool. Best ROI: provider improvements (each cloud has its own).
- **`grafana/grafana`** (64k+ stars) — Monitoring dashboards. Best ROI: panel plugins, data source integrations.

### 8.6 Pick by your career match

- Frontend role → §8.1 + maybe §8.3.
- Backend role → §8.2 + §8.5.
- ML/AI role → §8.4 + Python in §8.2.
- DevOps/SRE role → §8.5.
- Mobile role → §8.3.

**Rule:** pick the smallest repo from the list that still has 5k+ stars. Smaller = more attention from maintainers, faster reviews, easier to become a known contributor.

---

## 9. The 30-day "first PR" plan

Theory bahut padh li. Ab execution. Ye 30-day plan hai — print kar, fridge pe chipka, roz tick kar.

### Day 1-3: Pick repo, setup environment, run tests

- [ ] Day 1: Pick **3 candidate repos** from §8 matching your track.
- [ ] Day 1: Run §3.2 "is this alive" checklist on all 3. Eliminate weak ones.
- [ ] Day 2: Pick the winner. Fork + clone (§3.4 commands).
- [ ] Day 2: Read CONTRIBUTING.md end-to-end. Read README.md setup section.
- [ ] Day 3: Run setup. Run tests. Make sure everything green on `main`.
- [ ] Day 3: Star the repo. Watch the repo (notifications: Participating + Mentions).

**End of Day 3:** clean dev environment, tests passing locally.

### Day 4-7: Pick issue, comment to claim

- [ ] Day 4: Filter issues by `good first issue` label. Read 10 issues.
- [ ] Day 4: Pick 3 candidates. Skim comments to see if anyone's already working on each.
- [ ] Day 5: Pick THE one. Read related code in the repo for 1-2 hours to understand context.
- [ ] Day 5: Comment on the issue: *"Hi! I'd like to work on this. I've been reading the related code in `src/X.ts`. Plan: [your approach]. Does this direction sound right?"*
- [ ] Day 6-7: Wait for maintainer green-light. (Use this time to read more of the codebase.)

**End of Day 7:** Issue claimed, plan validated.

### Day 8-14: Write code + tests

- [ ] Day 8-10: Write the fix/feature. Keep changes small (§4.5).
- [ ] Day 11: Write tests (most repos require this for non-doc PRs).
- [ ] Day 12: Run full test suite + linter. Fix anything broken.
- [ ] Day 13: Self-review your diff (§4.6 checklist).
- [ ] Day 14: Take a break. Sleep on it. Come back fresh tomorrow.

**End of Day 14:** code complete, tests pass locally.

### Day 15-21: Open PR, address review

- [ ] Day 15: Push to your fork. Open PR (§4.1 commands). Use the PR template (§4.3).
- [ ] Day 15: Add screenshots/GIFs if UI change.
- [ ] Day 16-21: Wait for review. Maintainers EU/US time-zone hain — patience.
- [ ] When review comes: respond per §5.2 framework. Push fixes within 24 hours.
- [ ] Mark resolved comments resolved.

**End of Day 21:** Hopefully reviewed. Possibly already merged.

### Day 22-30: Get merged, write LinkedIn post

- [ ] Day 22-25: Finalize any review changes. Get the merge.
- [ ] Day 26: Once merged — celebrate. Screenshot the merged PR. Save it.
- [ ] Day 27: Write the LinkedIn post (§7.7 formula). Post it.
- [ ] Day 28: Update your resume bullet (§7.4 examples).
- [ ] Day 29: Update GitHub profile README to mention the contribution.
- [ ] Day 30: Pick the **NEXT issue** in the same repo. The momentum is now.

**End of Day 30:** First merge, LinkedIn announcement live, resume updated, next contribution started.

This loop, repeated for 6 months = real reputation, real resume, real interview calls.

---

## 10. Pre-PR checklist + What to learn next

### Final Pre-PR Checklist

Before clicking "Create PR" on **any** PR, verify:

**Code:**
- [ ] `npm test` / `pytest` / equivalent passes locally
- [ ] Linter clean: `npm run lint` / `ruff check .` / etc.
- [ ] No `console.log` / `print` debug statements
- [ ] No commented-out code
- [ ] No `TODO`s in your changes (unless explicitly part of design)
- [ ] No formatting-only changes mixed in (avoid noise)
- [ ] Imports sorted per project convention

**Tests:**
- [ ] Existing tests still pass
- [ ] New test added for new feature
- [ ] New test added for bug fix (regression test)
- [ ] Edge cases covered

**Git hygiene:**
- [ ] Branch up-to-date with `upstream/main` (rebase, don't merge)
- [ ] Commits use conventional format (`feat:`, `fix:`, etc.)
- [ ] Commit messages explain *why*, not just *what*
- [ ] No merge commits in your branch (use rebase)
- [ ] No mega-commits (each commit is logical, atomic)

**PR description:**
- [ ] What/Why/How clearly stated
- [ ] Linked to issue (`Fixes #1234`)
- [ ] Screenshots/GIFs for UI changes
- [ ] Testing steps documented
- [ ] Breaking changes called out (or "None")
- [ ] PR template checklist filled

**Self-review:**
- [ ] Read every line of `git diff` as if you were the reviewer
- [ ] Asked yourself "would I merge this without questions?"
- [ ] Removed anything that doesn't belong

**Communication:**
- [ ] Polite tone in PR description
- [ ] No accusations of past code being "wrong"
- [ ] Crediting prior work where relevant

If all checked, hit Create.

### What to learn next

This guide gives you the tactics. Now reinforce with adjacent skills:

- **`resume-behavioural.md`** — How to translate your OSS work into resume bullets and ace the HR round.
- **`git-version-control.md`** — Deeper Git: rebases, cherry-picks, conflict resolution. OSS PRs require all of these.
- **`capstone-bank.md`** — 3 personal projects to round out your resume (the 3 pinned-repos that aren't OSS forks).

And the meta-truth: **OSS karna ek practice hai, not a project**. Tu yahan se 6 months invest karega, 10 PRs ship karega — placement season mein you'll be the only candidate in your batch with a real public engineering footprint. Recruiter ko convince karne ki need nahi padegi. Tera GitHub khud bolega.

Chal, ab tab band kar, terminal khol, fork karna shuru kar. Pehla PR October tak. Pehla merge November tak. December mein LinkedIn post. Jan-Feb GSoC apply. Summer mein paid OSS internship. Final year mein offer letter.

Ye sab connected hai. Start node ye guide hai. Execute.

