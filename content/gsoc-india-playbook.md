# GSoC + LFX + Outreachy India Playbook

Yaar, sun le. Tu `open-source-guide.md` padh chuka hai. Tujhe pata hai ki ek merged PR 100 LeetCode problems se zyada strong hai. Tu Hacktoberfest mein ek-do PR daal chuka hai. GitHub heatmap thoda green ho gaya hai. **Now what?**

Ab tu mentorship-program-ka-grade pe pahuch chuka hai. Ye guide tujhe wahi le ja raha hai — **paid mentorship programs** jo Indian student ko **₹1.2 lakh se ₹6 lakh stipend**, structured 12-week project, senior maintainers ka 1:1 mentorship, aur recruiter ke liye ek-line resume bullet deta hai jo FAANG ki shortlist tak khud-ba-khud chala jata hai. GSoC. LFX Mentorship. Outreachy. MLH Fellowship. Season of KDE / Docs / Hyperledger. **5 flagship programs, ek systematic playbook, ek 6-month calendar.**

Ye doc `open-source-guide.md` ka complement hai — wo guide tujhe random PRs karna sikhata hai. Ye guide tujhe **structured paid pathways** sikhata hai jaha selection competition real hai (GSoC ka acceptance ~8% hai), but jeet ka payoff bhi real hai (Indian alumni jo Google, Microsoft, Red Hat, Stripe, Mozilla mein FTE pahuche hain, mostly inhi 5 programs se aaye hain). Padh end-to-end. Phir ek program pick kar. Phir October mein first-PR sequence shuru kar. Aur March mein proposal submit kar. Yahi rasta hai.

---

## 1. Why mentorship programs beat random OSS PRs

`open-source-guide.md` mein humne dekha ki random PR > LeetCode. Theek hai. **Lekin random PR se 10x strong cheez hai — structured paid mentorship program**. Reason simple hai: random PR mein tu ek-do file fix karke chala jata hai. Mentorship program mein tu **3 mahine** ek senior maintainer ke saath ek **real feature ship karta hai**, code review ke 50+ rounds face karta hai, RFCs likhta hai, design decisions defend karta hai. Ye experience random PR-grinding se **categorically different** hai.

### 1.1 The stipend reality — paisa bhi milta hai

Pehli baat — ye programs paise dete hain. Internship ki tarah. 2026 ke rates:

| Program | Stipend (USD) | INR equivalent | Duration |
|---|---|---|---|
| GSoC (medium project, India tier) | $1,500 | ₹1.25 lakh | 12 weeks |
| GSoC (large project, India tier) | $3,000 | ₹2.5 lakh | 12 weeks |
| LFX Mentorship (India tier) | $3,000 | ₹2.5 lakh | 12 weeks |
| Outreachy | $7,000 | ₹5.85 lakh | 13 weeks |
| MLH Fellowship | $5,000+ | ₹4.18 lakh+ | 12 weeks |
| Season of KDE | €1,800 | ₹1.62 lakh | 16 weeks |
| Season of Docs | $5,000-$15,000 | ₹4.18-12.5 lakh | 3-9 months |
| Hyperledger Mentorship | $3,000-$6,000 | ₹2.5-5 lakh | 12-24 weeks |

Mtlb seedha-seedha — ek summer break mein **₹2-6 lakh kama sakta hai** by sitting at home in Lucknow/Indore/Vizag/Coimbatore, working on open source. Comparison: Tier-3 college se wahi summer mein "training internship" mein ₹5-10k/month milta hai, total ₹15-30k. **20x delta hai bhai.**

Aur ye stipend tax-free nahi hai but typically reported as scholarship/grant — agar tu student hai aur kuch documentation properly handle karta hai (ITR mein "income from other sources" / scholarship category), to most cases mein zero/low tax hota hai. CA se confirm kar.

### 1.2 The mentorship factor — yahan asli value hai

Stipend tab tak important hai jab tak tu kaam shuru nahi karta. Ek baar shuru ho gaya, **mentorship hi asli payoff hai**. Sun:

- **Senior maintainer ka 1:1 attention** — tu Kubernetes ke ek subsystem maintainer ke saath weekly 1:1 call kar raha hai. Wo log Google/Red Hat/IBM ke staff/principal engineers hain. Industry mein 8-15 saal experience. Tujhe woh consulting normally ₹50k/hour cost karti.
- **Code review ka quality** — tera code professional standards pe judge ho raha hai. "Your function has 4 responsibilities, split it" — ye feedback tu apne college projects mein kabhi nahi sunega.
- **Design review experience** — bade features ke pehle tu RFC / design doc likhega. Multiple maintainers usse review karenge. Ye **principal-engineer-level skill** hai — most engineers ye 5+ saal kaam karne ke baad seekh paate hain.
- **Async communication** — Slack/Zulip/Matrix/email pe daily updates dena, weekly reports likhna, video calls mein context share karna. Ye exact skill remote-first companies (Vercel, GitLab, Postman) mein hire karne ke liye filter hai.

Ye sab tu random PR mein nahi seekh sakta. Random PR mein maintainer ek-line review chhod ke chala jata hai. Mentorship program mein **tu literally kaam karne ka tareeka seekhta hai**.

### 1.3 The resume signal — recruiter ki nazar mein

Ek bullet padh:

> Selected for Google Summer of Code 2026 with the Apache Software Foundation. Built a distributed tracing module for Apache APISIX (8.3k+ stars), shipped in v3.7. Mentored by 2 PMC members. ([proposal](#))

Ye line resume pe dikhi to recruiter ke brain mein 6 cheezein parallel fire hoti hain:

1. **Selectivity** — GSoC 8% acceptance rate hai. Tu un 8% mein hai. Ye signal hi caliber prove kar deta hai.
2. **Sustained execution** — 12 weeks of disciplined work. College projects ka 1-week sprint nahi.
3. **Tier-1 organization** — Apache, CNCF, Google, Mozilla, Linux Foundation. Ye brands recognized hain globally.
4. **Real shipped feature** — "shipped in v3.7" matlab tera code production mein hai. Crores of users isse use kar rahe hain.
5. **Mentor verifiable** — proposal public hai, mentors public hain, code public hai. Fake nahi ho sakta. Recruiter 2 minute mein verify kar lega.
6. **English + async + remote** — tu international maintainers ke saath kaam kar raha hai. Communication pe doubt nahi.

Ek bullet, 6 signals. **Ye exact reason hai jo GSoC alumni ko Google STEP / Microsoft Engage / Stripe Alpha — sab mein direct interview calls aate hain.**

### 1.4 The India-specific timing alignment

Ye sabse underrated point hai. Sun.

Indian B.Tech ka academic year **June/July se April/May tak chalta hai**. Pre-final year (3rd year) ka summer break **mid-May se mid-July** ka hota hai — approx 8-10 weeks.

GSoC coding period **mid-May se end-August** chalta hai — exactly 12 weeks. Outreachy ka summer round bhi **May-August**. LFX Spring cohort **March-May**, Summer cohort **June-August**.

Mtlb tera academic year ka summer break **literally exact overlap karta hai** in programs ke saath. Tu apna college break GSoC mein bitayega — ek paisa lose nahi hota. Aur 12-week duration matlab ye **ek normal internship ke equivalent slot mein fit ho jata hai** — recruiter resume pe dekhta hai aur "yaar isne 6th sem ke summer mein paid OSS internship ki" — same weight as tier-1 product company internship.

Compare: agar tu sirf "summer break mein 200 LeetCode kar raha hu" karega — wo log usse internship nahi maanege. Tera 6th sem ka summer **wasted** counts hoga resume pe. **GSoC/LFX/Outreachy isi gap ko fill karta hai.**

### 1.5 The alumni-to-FAANG conversion pipeline

Anecdotal data, but consistent across batches:

- **GSoC alumni Google STEP/SWE direct path** — Google maintains a soft "GSoC alumni track" in their early-career pipeline. Ek GSoC student jiska code Google-sponsored project mein merge hua hai, wo Google STEP application mein **automatic shortlist** ki tarah feel hota hai. Tier-3 college students ko bhi STEP mein chance milta hai agar GSoC done hai.
- **LFX alumni → CNCF-sponsoring companies** — Red Hat, IBM, AWS, Google Cloud, Microsoft Azure, HashiCorp, DataDog, Grafana — sab CNCF ko massively sponsor karte hain. LFX project ke maintainers in companies mein staff engineers hain. Mentorship complete hone ke baad **wo log apne hiring managers ko refer karte hain**.
- **Outreachy alumni → Mozilla / GNOME / Wikimedia FTE** — Outreachy specifically inclusivity-focused hai. Aur Mozilla, GNOME, Wikimedia jaise orgs **explicitly Outreachy alumni se hire karte hain** — har year ek-do Indian female engineer Mozilla SF / Berlin office mein FTE jaati hai isi pipeline se.
- **MLH Fellowship → Meta / Stripe / Coinbase** — MLH ko Meta sponsor karta hai (Production Engineering track). Stripe aur Coinbase ke alumni-to-FTE pipelines bhi public hain. Tier-3 college se Coinbase Bangalore SDE-1 jaana realistic ban jata hai isse.

Ye alumni-pipelines koi guarantee nahi hain. Lekin **the slope is real**. Random PR-grinder vs structured-mentorship-program-alumni — recruiter funnel mein second wala 5x faster move karta hai.

---

## 2. The 5 flagship programs in 2026

Pehle ek high-level comparison table dekh — fir har program ko deep-dive karenge.

### 2.1 The comparison table

| Program | Org sponsor | Stipend (India) | Duration | Typical timeline | Acceptance rate | Eligibility | India-tip |
|---|---|---|---|---|---|---|---|
| **GSoC** | Google | $1,500-$3,000 | 12 weeks | Org list Feb, proposal Mar-Apr, work May-Aug | ~8% | 18+, enrolled student or verifiable status | Pick CNCF/Apache org, lurk Zulip 2 weeks before applying |
| **LFX Mentorship** | Linux Foundation | $3,000 | 12 weeks | 3 cohorts/year (Spring/Summer/Fall) | ~15-20% per project | 18+, no education requirement | Cloud-native is the brand. Join SIG meetings on Zoom |
| **Outreachy** | Outreachy.org | $7,000 | 13 weeks | 2 rounds/year (May & Dec) | ~10% (after contribution period) | Underrepresented in tech (women, non-binary, BIPOC, etc.) | Initial application → contribution → final application sequence |
| **MLH Fellowship** | Major League Hacking | $5,000+ | 12 weeks | 3 batches/year (Feb-Apr, Jun-Aug, Sep-Nov) | ~10% | 18+ enrolled or within 12 months of grad | Apply early in cycle (rolling admissions) |
| **Season of KDE** | KDE Community | €1,800 | 16 weeks | Apr-Aug typically | ~25-30% (smaller scale) | 18+, anywhere | Easier to get in than GSoC, great GSoC stepping stone |
| **Season of Docs** | Google | $5,000-$15,000 | 3-9 months | Sep-Mar typically | ~20% | Technical writers (no coding required) | If tu writing-strong hai but DSA-weak, ye perfect path |
| **Hyperledger Mentorship** | Linux Foundation | $3,000-$6,000 | 12-24 weeks | 2 cohorts/year | ~12-15% | 18+ | Blockchain niche, lower competition |

Each row deserves its own deep-dive. Chal section 3 se shuru karte hain — biggest fish first.

### 2.2 Anecdotal alumni-to-FTE conversion observations

Ye numbers official nahi hain — saalon ke LinkedIn-stalking, Twitter threads, alumni interviews se aaye hain. But the pattern repeats:

- **GSoC** → ~30-40% Indian alumni land tier-1 product co. roles within 18 months (Google STEP/SWE, Microsoft IDC, Apple India, Adobe MTS).
- **LFX Mentorship** → ~40-50% Indian alumni land cloud-native company FTE (Red Hat, AWS, GCP, HashiCorp, Grafana, Datadog).
- **Outreachy** → ~50-60% (smallest pool, but inclusivity-mentorship-FTE pipeline is the most explicit). Mozilla, GitLab, Wikimedia, Linux Foundation hire repeatedly from Outreachy India alumni.
- **MLH Fellowship** → ~30-40% Indian alumni land Meta/Stripe/Coinbase/Square within 12 months.
- **Season of KDE / Season of Docs** → smaller scale, but ~25-35% conversion to KDE/Google ecosystem roles (frequently includes Google Docs/Devrel teams).

Bhai, ye conversion rates **on-campus tier-3 college placement rate se 5-10x zyada hain**. Wahan TCS Ninja milne ka rate ~40% hai @ ₹3.5 LPA. Yahan Google Bangalore @ ₹35 LPA milne ka rate ~30% hai. Same effort budget mein. Ye math soch.

---

## 3. GSoC deep-dive — the OG program

GSoC = Google Summer of Code. 2005 se chal raha hai. Google sponsors. ~150-200 organizations participate karte hain har saal (Apache, CNCF, GNOME, KDE, Mozilla, Postman, Drupal, etc.). Indian students globally **largest demographic** hain — har year ke ~30-40% selected students Indian hain. **Ye program literally tujhe target karta hai.**

### 3.1 The yearly timeline — month-by-month

Ye dates har year ~10 din shift hoti hain. 2026 ka indicative:

- **Late January / early February** — Org applications open (orgs apply to Google to participate).
- **End of February** — Accepted org list announced (~150-200 orgs).
- **March 1 - March 20** — Student/contributor proposal window (~3 weeks).
- **March 20 - April 28** — Mentor + org review proposals (~5-6 weeks).
- **May 8 (approx)** — Selection results announced.
- **May 8 - May 28** — Community bonding period (paid time to set up dev env, learn codebase, meet mentor).
- **May 28 - August 25 (12 weeks)** — Coding period. 4-week and 8-week evaluations. Final evaluation at week 12.
- **September 5** — Final results, certificate, payment.

Mark these in your Google Calendar **NOW**. Pehle saal miss ho gaya to agle saal phir same dates aayegi — but tu 1 saal lose karega.

### 3.2 The selection process — what really happens behind the scenes

Naive view: "Tu proposal likhta hai, Google decide karta hai." **Galat.** Reality:

1. **Orgs decide**, not Google. Each org gets allocated N slots (varies by org size, history, mentor capacity). Org's mentors/admins decide which proposal wins their slot.
2. **Mentors weigh prior contribution heavily.** ~80% of selected students had **prior PRs/issues** with that org before proposal window. Pure proposals (no prior involvement) almost never win.
3. **Communication signal matters.** Have you been on the org's Zulip/Discord/Slack/IRC? Have you asked smart questions? Have you helped other newcomers? Maintainers track this.
4. **Proposal depth filters out 80%** — generic copy-pasted proposals get auto-filtered. Specific, scoped, well-researched ones bubble up.
5. **Mentor has final say.** Even if 5 strong proposals come in, mentor picks the one whose communication style + technical taste matches theirs best.

Mtlb selection ek **relationship game** hai, not a paperwork game. Proposal sirf last mile hai — pichle 6-8 hafte ka background work hi 80% filter hai.

### 3.3 The acceptance rate reality

GSoC ka official acceptance rate ~8% hai globally. India-specific number ~6-7% hai (kyunki Indian applicants disproportionately zyada hain). Mtlb 100 mein se 6-7 students select hote hain.

Demoralizing? **Bilkul nahi.** Dekh, ye 6-7% **uniformly distributed** nahi hai. Selection probability strongly correlates with effort:

- **No prior PR + generic proposal** → ~1% chance.
- **2-3 PRs to org + generic proposal** → ~5% chance.
- **2-3 PRs + tailored proposal + mentor email exchange** → ~15-25% chance.
- **5+ PRs + co-authored RFC + active in community 3 months** → ~40-50% chance.

Mtlb agar tu 6 mahine pehle se prepare kar raha hai, **selection probability 6-7x improve ho jati hai**. Ye program "lottery" nahi hai — ye "preparation" hai. Aur preparation tu kar sakta hai. Section 6 mein 30-day pre-proposal sequence dekhenge.

### 3.4 What mentors actually look for

Ek GSoC mentor (let's say CNCF org ka maintainer, 12 saal experience) ke brain mein evaluation criteria:

1. **GitHub history** — Last 6 months ka heatmap. Diversity of contributions. Code quality of merged PRs.
2. **PRs to my project specifically** — kya pehle se familiar hai codebase se? Kya communication style mature hai PR threads mein?
3. **Proposal quality** — kya isne actual code padha? Kya implementation details realistic hain? Kya weekly milestone breakdown believable hai?
4. **English clarity** — kya proposal coherent English mein likha hai? Wrong grammar fine hai, but logical structure must be clear.
5. **Commitment signal** — student kya 12 weeks 25-30 hr/week commit karega? Other commitments (parallel internship, exam season) kya disclosed hain?
6. **Personality fit** — student ka tone arrogant nahi hai? Past PR threads mein kya politeness baked-in hai?

Ye sab signals tu **proposal ke 1 hafte pehle artificial nahi bana sakta**. Yahan se 6 mahine ka background prep wala paragraph back-to-the-fore aata hai.

---

## 4. The GSoC proposal — what wins, what loses

Proposal = your application. 2,500-4,000 words ka document. 10 sections hote hain typically. Ye section "winning proposal anatomy" hai.

### 4.1 The 10-section anatomy

Standard winning proposal structure (har org thoda alag prefer karti hai, but ye baseline hai):

| # | Section | Word count | Purpose |
|---|---|---|---|
| 1 | Summary / Abstract | 150-200 | TL;DR — kya banaoge, kyon, expected outcome |
| 2 | Problem Statement | 300-400 | Issue/feature ka context, current state, pain point |
| 3 | Goals + Deliverables | 300-400 | Concrete shipping list. Bullets. Verifiable. |
| 4 | Technical Approach | 600-900 | Architecture, design choices, data structures, alternatives considered |
| 5 | Weekly Timeline | 400-600 | Week 1-12 milestone breakdown |
| 6 | Prior Work | 200-300 | PRs to this org, related projects, relevant experience |
| 7 | Why Me | 200-250 | Skills, motivation, time availability |
| 8 | Mentor Questions Answered | 100-200 | Org-specific Q's from their proposal template |
| 9 | Post-GSoC Plan | 100-150 | Will you stay involved? Maintainer trajectory? |
| 10 | References + Links | — | GitHub, prior PRs, related issues, similar projects |

Total: ~2,500-3,500 words. PDF mein 6-10 pages.

### 4.2 The "before vs after" — generic vs strong

**BEFORE (generic, will be rejected):**

```
Proposal: Improve performance of Project X

Hello, I am a 3rd year B.Tech student at XYZ College. I am very
interested in open source and would love to work on Project X this
summer. I have used Project X in my college projects and find it
amazing. I want to improve its performance and add new features.

I have good knowledge of Python, Java, C++, JavaScript, React, Node.js,
MongoDB, MySQL, Docker, Kubernetes, AWS, Azure, machine learning, deep
learning, NLP, computer vision, blockchain, web3, and IoT.

I will work hard for 12 weeks and complete the project. Please give me
this opportunity. I will not let you down.

Thank you,
Random Student
```

EngiNerd commentary (Hinglish): Yaar, ye proposal **5 second mein reject** ho jayega. Reasons:
- "Improve performance" — kis cheez ki performance? Kitna improve? Measurable nahi hai.
- Skills ka grocery list — 15 technologies likh dene se zero credibility milti hai. Ye recruiter-resume ka anti-pattern hai.
- "I will work hard" — sab likhte hain. Ye signal nahi hai.
- Zero prior contribution evidence.
- Zero technical specifics — mentor ko pata bhi nahi chala tu codebase samjha bhi hai ya nahi.

**AFTER (strong, has actual chance — abridged sample):**

```
Proposal: Add Distributed Tracing Support to Apache APISIX
         via OpenTelemetry SDK Integration

# Summary
APISIX exposes basic Prometheus metrics but lacks end-to-end
distributed tracing across upstream services. This proposal
integrates the OpenTelemetry Lua SDK for W3C TraceContext
propagation, span generation across the request lifecycle, and
OTLP-compatible exporter support. Deliverable: new core plugin
shipping in v3.8 with docs + integration tests.

# Problem Statement
In production, APISIX-as-gateway operators cannot correlate
gateway-side latency with upstream latency. Two specific gaps:
(1) traceparent/tracestate headers not propagated upstream,
breaking trace continuity (issue #8721, 142 thumbs-up); (2) no
spans emitted for internal lifecycle (router decision, plugin
execution). Three RFCs filed in the past year confirm demand.

# Goals + Deliverables
1. New core plugin apisix/plugins/opentelemetry.lua with W3C
   TraceContext propagation, OTLP-HTTP exporter (default),
   OTLP-gRPC (flagged), configurable sampling strategies.
2. Spans for apisix.access, apisix.plugin.<name>, apisix.upstream.
3. Plugin metadata schema config + tests in t/plugin/opentelemetry.t.
4. Performance regression target: <2% throughput degradation.

# Technical Approach
Singleton TracerProvider instantiated in http_init phase, accessed
via core.tablepool in each plugin phase. Reuses existing deps
(lua-cjson, lua-resty-http). Sampler abstraction supports always-on,
always-off, ratio-based, parent-based.

Alternatives considered:
- Custom tracing exporter — rejected (reinventing wheel)
- Zipkin-only — rejected (OTel is superset, future-proof)
- Sidecar exporter — rejected (operational complexity)

# Weekly Timeline (12 weeks, May 28 - Aug 25)
Wk 1-2: Community bonding. Dev env. Design doc on apisix-dev@.
Wk 3:   TraceContext extractor/injector + unit tests.
Wk 4:   TracerProvider singleton + apisix.access span.
Wk 5:   OTLP-HTTP exporter + Jaeger integration testing.
Wk 6:   Mid-term review. OTLP-gRPC exporter behind flag.
Wk 7:   Per-plugin span instrumentation.
Wk 8:   Sampler implementations + sampling tests.
Wk 9:   Performance benchmarks (wrk) + regression fixes.
Wk 10:  Documentation in docs/en/latest/plugins/opentelemetry.md.
Wk 11:  Code review iterations.
Wk 12:  Final polish. CI green. v3.8-rc1 tag.

# Prior Work
- PR #11432: Memory leak fix in limit-count plugin (merged Dec 2025).
- PR #11587: Test for traffic-split round-robin edge case.
- PR #11623: Documentation correction in prometheus plugin.
- Issue #11689: Proposing this integration — got approval from
  @membphis (PMC chair) on Feb 5, 2026, to write GSoC proposal.
- 4 PRs to OpenTelemetry-Lua SDK; 2 to envoyproxy/envoy.

# Why Me
3rd-year CS student at <University>. Built a custom Nginx-Lua
rate-limiter for college; deployed OTel for a Node microservices
fest project (~3000 users); 9 merged PRs to Apache + CNCF orgs.
Available 30+ hr/week May 28 - Aug 25 (no parallel internship).
Online classes resume mid-Aug; manageable overlap disclosed.

# Mentor Questions Answered
Q1: Backwards compat with existing Zipkin plugin?
A1: Zipkin remains. New plugin additive; both can run together.
    Migration guide included.
Q2: Behavior when OTLP collector unreachable?
A2: BatchSpanProcessor with bounded queue (1024 default).
    Drop oldest-first. Warning metric apisix_otel_dropped_spans.
Q3: Test plan for TraceContext propagation?
A3: t/plugin/opentelemetry/propagation.t covering W3C spec's 7
    example vectors + invalid/missing header edge cases.
Q4: Plugin development workflow integration?
A4: Mirror apisix/plugins/prometheus.lua structure for consistency.

# Post-GSoC Plan
Co-maintain plugin if PMC agrees. Drive follow-up RFC for OTLP
metrics export. Write APISIX blog tutorial on E2E observability.

# References
- Issue #8721, RFC-37/42/49
- apisix/plugins/zipkin.lua (reference implementation)
- W3C TraceContext spec
- github.com/<username> + linked PRs above
```

EngiNerd commentary: dekh, ye proposal **kyun jeetega**:

- **Specific problem with verifiable evidence** — issue #8721 cited, 142 thumbs-up cited, 3 prior RFCs cited. Mentor verify kar sakta hai.
- **Detailed weekly milestones** — week 1 to week 12, specific deliverable each week. "I'll work hard" wala fluff zero.
- **Technical depth** — architecture diagram, alternatives considered + rejected with reasoning, specific module names, Lua patterns referenced. Mentor ko pata chal raha hai tu codebase samjha hai.
- **Prior contribution receipts** — 3 specific PRs cited, dates, links. Verifiable in 30 seconds.
- **Time availability disclosed** — 30+ hr/week, exam overlap honestly mentioned.
- **Mentor questions answered** — org-specific 4 questions inline. Shows tu org's process respect kar raha hai.
- **Post-GSoC plan** — committed to staying. Mentor ko pata hai 12 weeks ke baad bhi tu maintain karega.

Ye pure proposal ka **70%** likhne mein 6 hafte lag jayenge — kyunki tujhe pehle codebase samajhna hoga, prior PRs karne honge, issue thread mein engage karna hoga. **Proposal likhna last 2 hafte ka kaam hai. Pehle 6 hafte ka groundwork hi proposal banata hai.**

### 4.3 Proposal anti-patterns — what loses

10 quick rejection-triggers (mentor ne 30 second mein scroll karke filter kar diya):

1. **"Respected Sir/Madam"** opening. International OSS culture mein ye **pure cringe** hai. Tu chai pee, mentor ko "Hi <FirstName>" likh.
2. **"I am very interested in your prestigious organization"** — generic flattery filter ho jata hai.
3. **Skills grocery list** — "Python, Java, C++, JS, React, Node, Mongo, SQL, Docker, K8s, AWS, ML, NLP, blockchain". Mentor laughs, closes.
4. **No prior PR** — single biggest filter. Mentor literally search karta hai org repo mein for your username. Zero hits = zero shortlist.
5. **Vague timeline** — "Phase 1: Research. Phase 2: Implementation. Phase 3: Testing" — ye college BE-project ka template hai. Weekly milestones chahiye.
6. **Wrong project scope** — "I'll rewrite the entire scheduler in 12 weeks" — bhai chal hat. Mentor ko pata hai realistic kya hai.
7. **Multiple-org boilerplate** — same proposal 5 orgs ko submit kiya gaya, sirf org name change kar diya. Mentors detect this in 5 seconds (they cross-reference with other org admins on private GSoC mentor channels).
8. **AI-written proposal** — GPT-typical phrases ("delve into", "navigating the landscape", "harness the power of"). Mentors are now trained to spot it. Auto-reject in 2026.
9. **Hostile or arrogant tone** — "Your codebase is poorly architected, I'll fix it." Even if true, way to lose mentor. Politeness baked-in chahiye.
10. **Missing references** — no GitHub link, no prior PR links. Mentor cannot verify your claims = cannot select you.

### 4.4 The proposal review process

Tu submit karega → mentor padhega within 1-2 weeks → tu shortlist mein aaya to mentor wapas message karega ("Some questions about your week-3 milestone — can you elaborate?"). **This is your moment.**

Reply **fast** (within 24 hours), reply **specific**, reply **with reference to actual code**. Ek reply mein tu shortlist se selection mein chala jata hai.

Ek mentor ne ek proposal-cycle mein 14 proposals padhe. 4 ko shortlist kiya. 4 mein se 2 ko questions bheje. 2 mein se ek ne 4-din baad reply kiya — generic. Doosre ne **6 ghante mein** reply kiya — specific code references ke saath. **Doosra select hua.** Period.

---

## 5. Finding the right org + project

GSoC ka real game **proposal likhne se 3 mahine pehle** shuru hota hai. Ye section us pre-game ke baare mein hai.

### 5.1 The org-shortlisting framework

GSoC orgs ki list ~150-200 hoti hai. Sab tere liye relevant nahi. Filter:

**Step 1: Domain match.** Tu kya seekh raha hai? Backend, ML, distributed systems, frontend, infra, scientific computing, mobile, game dev. Apne 2-3 domains pick kar.

**Step 2: Tech stack match.** Tu kya likh sakta hai? Python comfortable hai? Go nahi seekha? C++ ke saath struggle hai? Apne current language confidence honestly assess kar.

**Step 3: Org repo health check.** (Same checklist `open-source-guide.md` se):
- 1k+ stars (preferably 5k+ for prestige)
- Last commit < 14 days
- Active maintainers (recent PR merges)
- Contributing guide present
- Healthy community channel (Zulip/Discord/Slack)

**Step 4: India-friendliness.** Some orgs are explicitly Indian-students-friendly:
- Apache foundation projects (Apache APISIX, Apache Camel, Apache Beam) — Indian PMCs galore
- CNCF projects sponsored by Indian-friendly companies (Argo by Intuit, Crossplane by Upbound)
- Google projects (TensorFlow, Bazel, Project Open Source) — explicit Indian recruitment
- Indian-origin orgs — Postman, Hasura, Atlan, Frappe, ERPNext

**Step 5: Mentor timezone overlap.** Section 5.4 mein deep-dive — but minimum 2-3 hours overlap with mentor chahiye for sync calls.

**Step 6: Project scope realism.** Org ke ideas-list pe har project ke saath difficulty rating hoti hai (Easy/Medium/Hard, ya Beginner/Intermediate/Advanced). **First-time GSoC applicant?** Medium pick kar. Hard pick mat kar — chances of finishing kam hote hain.

### 5.2 The lurking phase — Zulip / Discord / Matrix mein 2 hafte

Ye **most-skipped, most-important** step hai.

Org choose kar lia? Ab **2 hafte tak unke community channel pe lurk kar**. Zulip / Discord / Matrix / IRC / Slack / mailing list — jo bhi unka primary channel hai. Read 2 weeks of backlog. Don't post immediately. Listen.

Lurking ke 2 hafte mein tu sikhega:

- **Maintainers ke names + personalities.** Kaun PMC chair hai, kaun beginners ko welcome karta hai, kaun strict reviewer hai, kaun fun-loving tech debater hai.
- **Active priorities.** Kya features chal rahe hain abhi? Kya 1.5 release ke liye plan ho raha hai? Tera GSoC project usse align hona chahiye.
- **Pain points.** Maintainers kis baat se frustrated hain? "We need more docs" / "we need test coverage" — ye exact gaps mein tera proposal value-add kar sakta hai.
- **Communication culture.** Formal hai (Apache mailing list style)? Informal hai (Discord bantz)? Casual code-review style? Strict?

2 hafte ke baad **first message likh** — ek smart question, ek issue ka triage, ek meeting attend karke notes share karna. **Don't introduce yourself with "I want to do GSoC"** — too transactional, mentors instantly tune out. Introduce yourself with technical curiosity — "Hi, I was reading the X module and noticed Y — is this a known issue?"

### 5.3 Reading the Ideas page

Har GSoC org ek **Ideas page** publish karta hai (typically on their wiki / GitHub README / dedicated docs site). Ye tera template hai.

Ideas page mein typically 10-30 project ideas hote hain. Each idea mein:

- **Description** — kya banana hai
- **Difficulty** — Easy / Medium / Hard
- **Required skills** — language, libraries, prior knowledge
- **Mentor name + contact** — kaun guide karega
- **Expected outcome** — deliverable list

**Don't pick the easiest idea.** Easy ideas pe 50 students apply karte hain — competition crazy. Pick **Medium difficulty in your skill range**, ideally one where:

- Mentor list mein 2+ mentors hain (signal of mentor commitment)
- Idea is specific (vague ideas like "improve performance" are red flags — mentor khud confused hai)
- Idea has 1-2 tracking issues open (signal of community demand)

Pro move: agar tu lurking-phase mein dekha ki maintainers ek specific gap discuss kar rahe hain jo Ideas page pe nahi hai — **propose a custom project**. GSoC orgs custom proposals accept karte hain. Mentor ko email kar — "I noticed you're discussing X in #channel; here's a 2-paragraph project proposal addressing it. Would you be open to mentoring this?" Jeet ka rate **2x** ho jata hai custom proposals ka.

### 5.4 The timezone reality — IST vs US/EU mentors

Ye sabse underrated practical issue hai.

- **IST = UTC+5:30**
- **PST (US West) = UTC-8** → IST se 13:30 hours behind
- **EST (US East) = UTC-5** → IST se 10:30 hours behind
- **CET (Europe) = UTC+1** → IST se 4:30 hours behind
- **JST (Japan) = UTC+9** → IST se 3:30 hours ahead
- **AEST (Australia) = UTC+10** → IST se 4:30 hours ahead

Mentor agar US-based hai (most common for CNCF, Google projects):
- Tera 8 PM IST = unka 6:30 AM PST / 9:30 AM EST → minimum overlap window.
- Mentor ke 9 AM PST = tera 9:30 PM IST → late but workable.
- **Reality**: tu daily 9 PM-11 PM IST mein async ho jayega ya weekly sync hoga.

Mentor agar EU-based (lots of KDE, GNOME, Mozilla, Apache projects):
- Tera 5 PM IST = unka 12:30 PM CET → great overlap.
- Comfortable working window 1 PM IST - 8 PM IST.

Mentor agar Australian/Japanese:
- Best overlap. Almost same timezone.

**Action item:** mentor ki location proposal review se pehle confirm kar le. Email kar — "Hi, what's your typical working timezone? Just checking for our weekly sync slot." Ye signal mature hai — mentor impressed hota hai.

Aur **honestly disclose karna**: agar tu 9 AM-9 PM apne college schedule mein busy hai, but 9 PM IST baad available — mentor ko proposal mein bata. Don't hide it. They'd rather know upfront than be surprised in week 4.

### 5.5 Beating the timezone trap

Three patterns Indian students use to make timezone work:

1. **Async-first with weekly sync.** Mentor ko Monday morning unka 9 AM = tera Monday evening 6:30 PM IST sync set kar. Rest of week pure async via PR comments + Zulip threads.
2. **Daily standup notes.** Every day end-of-day, write a 5-line update in a public Zulip thread. Mentor reads when they wake up. Solves async coordination.
3. **Recorded video walkthroughs.** Big change ya design proposal? Loom recording bhej ke "5-min video explaining my approach" — mentor watches at their convenience. **More effective than text** for complex topics.

Ye sab habits **professional remote work skills** hain — bonus: tu future Vercel/GitLab/Postman remote-job ke liye automatically prepared ho gaya.

---

## 6. The "first PR" sequence — 30 days before proposal opens

This section is the **before-the-before**. Proposal opens early March. Tujhe **late January / early February** mein ye 30-day sequence run karna hai.

### 6.1 The week-by-week breakdown

**Week 1 (Day 1-7): Org reconnaissance**

- Day 1: Pick top 3 candidate orgs from accepted list.
- Day 2: Run repo-health check on all 3 (stars, commits, contributing guide).
- Day 3: Read Ideas page of each. Shortlist 1 org.
- Day 4: Join their primary community channel. Lurk only.
- Day 5: Read past 2 weeks of channel backlog.
- Day 6: Identify 5 maintainer names + their roles.
- Day 7: Read their CONTRIBUTING.md + DEVELOPER.md + ARCHITECTURE.md (if exists). Ye 200+ pages ho sakta hai. Pura padh.

**Week 2 (Day 8-14): Dev environment + first issue triage**

- Day 8: Fork the repo. Clone. Set up dev environment per CONTRIBUTING guide. Run tests.
- Day 9: If tests don't pass → debug. File issue if reproducible. Otherwise → success.
- Day 10: Open issues page. Filter `good-first-issue`. Read 20 such issues' descriptions.
- Day 11: Pick 1 `good-first-issue` to work on. Comment to claim.
- Day 12: Code the fix. Run tests locally.
- Day 13: Open PR with proper description.
- Day 14: Wait for review. Engage politely with feedback.

**Week 3 (Day 15-21): Iterate + claim help-wanted**

- Day 15-17: Address review feedback on first PR. Ideally merged by Day 18.
- Day 18: Filter `help-wanted` (slightly harder than `good-first-issue`). Pick one.
- Day 19-21: Code + open PR for help-wanted issue.

**Week 4 (Day 22-30): Propose + draft proposal**

- Day 22-25: Wait for second PR review/merge.
- Day 23: Identify potential GSoC project from Ideas page.
- Day 24: Email/Zulip-DM mentor: "Hi <FirstName>, I'm interested in proposing X for GSoC. Quick question on scope: <specific question>. Happy to send a draft for feedback if useful."
- Day 25: Mentor responds. Iterate scope.
- Day 26-28: Draft full proposal. Section-by-section.
- Day 29: Self-review. Send to peer GSoC alumnus for cross-check.
- Day 30: Submit final proposal.

### 6.2 Real PR title patterns

Pehle 2 PRs typically aise titles wale hote hain:

```
docs: fix typo in plugins/opentelemetry.md sampling section
docs(api): correct return type for client.send() in api-reference.md
test(plugin): add missing test case for traffic-split round-robin edge
fix(plugin): handle nil response in limit-count plugin redis-cluster mode
chore: bump etcd dependency from 3.5.10 to 3.5.13 in CI matrix
refactor(core): extract URL parser into separate module for reusability
```

Ye real, small, scoped PRs hote hain. **Mentor ko ye dikhana hai ki tu codebase ke saath comfortable hai, aur convention follow karta hai.**

### 6.3 The "right" first PR difficulty

Pehla PR pe golden rule: **easy enough to finish in 4-6 hours, hard enough to require reading 200+ lines of unfamiliar code**.

- Too easy: README typo fix → no signal, mentor ignores.
- Too hard: rewrite scheduler → won't finish, mentor sees abandoned PR, negative signal.
- Just right: bug fix in a plugin you understand after reading 3 files. ~50 lines of code change. ~100 lines of test. Reviewable in 15 minutes.

### 6.4 Communication on the first PR

PR description matters a lot. Sample template (English, because that's what the maintainer reads):

```
## What
Fixes nil-pointer panic in apisix/plugins/limit-count.lua when
Redis cluster has all nodes down.

## Why
Issue #11432: limit-count crashes the worker when cluster is
unreachable. Stack trace showed missing pcall around
redis_cluster:get().

## How
- Wrapped Redis call in pcall(...).
- On failure, fall back to "allow request" (configurable via
  policy.fallback_action).
- Added redis-down test case in t/plugin/limit-count.t.

## Testing
- make test passes (full suite, ~5 min).
- Manually verified: killing redis-cluster no longer panics worker.

## Risks
- Behavior change: previously failed; now defaults to "allow".
  Documented default per CONTRIBUTING.md; flagged in changelog.

Closes #11432
```

EngiNerd commentary: dekh, ye PR description **why pe focus karti hai**, what pe nahi. Code khud what dikha raha hai. **Reviewer ki cognitive load minimize kar — jo tu nahi karega, wo karega — usse bachao**. Aur "Risks" section hamesha rakh — mentor ko impressed karta hai ki tu side-effects soch raha hai.

### 6.5 Building mentor recognition before proposal time

Goal: jab mentor tera proposal padhne baithe, **wo soche "haan, ye username pehle bhi dekha hai"**. Ye recognition tu kaise build karega:

1. **First name basis pe aana** — Zulip pe maintainers ko "Hi <FirstName>" se address kar. Don't be formal.
2. **Smart questions in public channels** — Stack Overflow pe DM mat kar. Public channel mein puch — sab maintainers see karenge.
3. **Help other newcomers** — agar tu kisi ek PR ka issue solve kar chuka hai, doosre newcomer ko same issue pe help kar. Mentor notice karta hai.
4. **Attend SIG / community meetings** — most CNCF + Apache projects mein weekly Zoom call hota hai (Zoom links public hote hain). Even if tu sirf attend kare, mute pe baith ke notes share kare — recognition jeevan-changing hai.
5. **Tweet/blog about your contributions** — tag the org. Maintainers retweet. Now they remember your handle.

6 hafte mein tu **invisible se "haan, woh kid jo tracing pe kaam kar raha hai" tak** ka journey kar sakta hai. Wahi recognition proposal review mein 5x boost deta hai.

---

## 7. LFX Mentorship — the cloud-native pipeline

LFX = Linux Foundation eXperience. Linux Foundation ka mentorship platform. Cloud-native (CNCF) projects pe focus. **GSoC ka practical alternative**, especially agar tu Kubernetes / containers / observability ecosystem mein interested hai.

### 7.1 Why LFX > GSoC for cloud-native

GSoC mein 150 orgs hain — sab domains. LFX mein 50-80 projects, sab cloud-native (Kubernetes, Envoy, Argo, Prometheus, etcd, Falco, OpenTelemetry, Cilium, Istio, OpenEBS, KubeEdge, etc.). **Domain focus** matlab tu yahan grow ho gaya to **directly hire kar lete hain CNCF-sponsoring companies**.

Aur LFX:
- 3 cohorts/year (Spring/Summer/Fall) — GSoC ek baar saal mein hota hai. LFX miss ho gaya to 3 mahine mein agla shot.
- ~15-20% acceptance rate (better than GSoC's 8%).
- Less proposal-writing overhead — usually a 1-2 page cover letter is enough.
- $3,000 stipend (India tier), 12 weeks, ~10-15 hr/week.

### 7.2 Application process

1. **Browse open mentorships** at `mentorship.lfx.linuxfoundation.org`. Each project has its own application form.
2. **Cover letter required** — 500-1000 words. Why this project, your background, what you'll work on.
3. **Pre-existing involvement boosts chances dramatically** — file an issue, fix a typo, comment on a PR before applying.
4. **Mentors review applications** — usually pick 1-3 mentees per project.
5. **Selection within ~3 weeks** of application close.

### 7.3 The cloud-native lurking strategy

Same lurking-phase logic as GSoC, but with CNCF-specific channels:

- **Slack:** `kubernetes.slack.com` — most CNCF orgs have a channel here. Join `#sig-X` channels matching project.
- **Zoom calls:** every CNCF project ki weekly SIG meeting hoti hai. Zoom links + recording links public hote hain at `kubernetes.io/community`.
- **GitHub orgs:** `kubernetes/`, `cncf/`, `envoyproxy/`, `prometheus/`, `argoproj/`, `open-telemetry/`, `falcosecurity/` — har ek mein discussions tab active hai.
- **CNCF mentor calls:** monthly **Contributor Strategy Working Group** call jaha new contributors welcome hote hain.

### 7.4 India success stories — anonymized

- **Anonymous_A** (NIT Surathkal, 2022 batch): LFX Mentorship Spring 2021 with **CNCF Argo project**. Built dashboard improvements. Post-mentorship → joined **Intuit Bangalore** as SDE-1 ($28 LPA), continued as Argo committer. 2024 mein switch to **Akuity** (Argo-creator's startup) as full-time maintainer.
- **Anonymous_B** (PES Bangalore, 2023 batch): LFX Mentorship Summer 2022 with **OpenTelemetry**. Built Lua SDK. Post-mentorship → joined **Honeycomb.io** Bangalore as O11y engineer ($45 LPA, including stock).
- **Anonymous_C** (BIT Mesra, 2021 batch): LFX Mentorship Fall 2020 with **Prometheus**. Built metric relabeling improvements. Post-mentorship → joined **Red Hat Pune** as RHCSA, then promoted to **OpenShift core team**. Now at **Red Hat North Carolina** as senior engineer.
- **Anonymous_D** (Tier-3 Bangalore college, 2024 batch): LFX Spring 2023 with **Falco**. Built rule-engine improvements. Post-mentorship → joined **Sysdig** (Falco-creator company) Bangalore as junior engineer ($24 LPA). 1.5 years later promoted to mid-level.

Ye 4 cases ka pattern: **CNCF project mentorship → CNCF-sponsoring company FTE within 18 months**. Conversion rate of LFX alumni to CNCF-ecosystem companies anecdotally **40-50%**.

### 7.5 Sample LFX cover letter excerpt

```
Subject: LFX Mentorship application — Argo CD Notification engine

Hi <Mentor1>, <Mentor2>,

I'm <Name>, 3rd-year CS at <University>, applying for the Argo CD
Notification engine mentorship for Summer 2026.

Why this project: I run Argo CD for my college's 4-microservice
hackathon platform (~2k weekly users). I narrowed issue #15432
(templated webhooks fail silently on nil context) to the templater's
missing-key handling; draft fix in progress — PR by next week.

My background:
- 6 merged PRs across argoproj/argo-cd + argo-rollouts (links below)
- 2 PRs to OpenTelemetry-Go SDK
- Strong Go background; won SIH 2025 with a Go distributed cache

Proposed deliverable: rebuild the notification template engine
with nested context resolution, custom function registration, and
graceful nil-handling. Backwards-compatible v1.10 release + migration
docs.

Time availability: 30 hr/week May 28 - Aug 25, no conflicts.
Sync window 7-10 PM IST (1:30-4:30 PM PT) — happy to flex.

Best,
<Name>
github.com/<username>
```

EngiNerd commentary: dekh, ye cover letter **2-paragraph filler nahi hai**. Specific project, specific issue cited, specific PRs cited, time availability disclosed, sync window proposed. Mentor 30 second mein decide kar leta hai "haan, ye candidate ready hai." LFX cover letter LinkedIn-DM-tone mein nahi likhna — **professional but warm**, English mein, "Hi <FirstName>" se start karna.

---

## 8. Outreachy — explicitly inclusive

Outreachy = mentorship program **explicitly for underrepresented backgrounds** in tech. Originally for women in OSS, now expanded to include non-binary individuals, BIPOC (Black, Indigenous, People of Color), trans + LGBTQIA+, and people from regions/countries underrepresented in tech.

### 8.1 Why Outreachy is special

Sun, ye 5 unique features hain:

1. **Highest stipend:** $7,000 USD (~₹5.85 lakh) for 13 weeks. **Highest of all programs** in this guide.
2. **No college requirement:** anyone 18+ can apply, including career-changers, mothers returning to tech, self-taught developers.
3. **Work-sample evaluation, not interview:** there's no "interview" step. Selection is based on the contribution period (4-week window where multiple applicants contribute to project, mentors evaluate quality).
4. **Inclusive by design:** if you're a woman from any country (including India), you're eligible. Many other underrepresented categories listed at outreachy.org/eligibility.
5. **Two rounds/year:** May-August summer round, December-March winter round. Both equally good.

### 8.2 The 3-stage application pipeline

Outreachy ka selection process **GSoC se categorically alag** hai:

**Stage 1: Initial application (~2 weeks before contribution period).**
- Standard form: name, education, employment, time availability.
- **Time-zone based essay questions** about your underrepresentation context — answered honestly.
- Outreachy verifies eligibility, then admits qualified applicants to Stage 2.
- Acceptance rate at Stage 1: ~70-80% (most filter is honesty + eligibility match).

**Stage 2: Contribution period (~5 weeks).**
- After Stage 1 approval, Outreachy publishes the project list with mentors.
- Applicants browse projects, pick 1-3, **start contributing immediately** to those projects' repos.
- Mentor evaluates contributions: code quality, communication, persistence.
- This is the **real selection filter** — typical applicant submits 5-10 PRs in this window.

**Stage 3: Final application (~last 2 days of contribution period).**
- Applicant writes a project proposal for their chosen project.
- Mentor reviews proposal + contributions together.
- Selected applicant gets the slot.
- Acceptance rate at Stage 3: ~10-15% (depending on project popularity).

**Critical insight:** Outreachy mein **proposal kam matter karta hai, contribution period mein actual code zyada matter karta hai**. GSoC mein opposite hai. Isiliye Outreachy zyada **fair** feel hota hai — there's no "fancy proposal writer" advantage.

### 8.3 Common Indian success path

Anonymized but real pattern:

> Tier-3 college woman engineer → Discovered Outreachy via Twitter → Initial application → Selected for contribution period → Submitted 8 PRs to Mozilla Common Voice over 5 weeks → Selected for final round → Outreachy with Mozilla → 3 months of full-time OSS work → Mozilla Berlin office offered her a full-time position post-internship.

Ye exact path multiple Indian women engineers ne follow kiya hai. **Outreachy is THE pipeline for tier-3 college Indian women into Mozilla, GNOME, Wikimedia, Linux Foundation, GitLab.**

Indian women engineers jo Outreachy se gaye hain:
- Mozilla India / Mozilla Berlin
- GitLab (fully remote, hires globally)
- Wikimedia Foundation
- GNOME Foundation
- Linux Foundation
- Cloud Native Computing Foundation

Conversion rate **probably highest** among all 5 programs covered in this guide.

### 8.4 Outreachy vs GSoC — which to pick

If you're eligible for Outreachy:
- **Pick Outreachy if:** you want fairness (contribution-based selection), higher stipend, no college requirement, inclusive community.
- **Pick GSoC if:** you want broader org choice (150 orgs vs Outreachy's ~30), prestige association with "Google", more flexible mentor-fit options.

Honestly, **dono parallel apply kar** — most timelines are slightly offset and you can do both contribution windows simultaneously. Outreachy May round overlaps with GSoC summer — you'd have to choose if both accept.

### 8.5 Outreachy initial application — sample answers

The Outreachy initial application has questions like:

```
Q: Tell us about a time you felt under-represented or
discriminated against in tech.
```

EngiNerd commentary: yaar, ye questions answer karte time **honestly likh**. Outreachy reviewers trained hain authentic vs constructed answers detect karne mein. Don't fabricate. Don't exaggerate. Bas apni real story politely likh — agar tu small-town Indian woman hai jo CS mein 1 of 5 in a class of 60, ye real underrepresentation hai. Likh.

```
Q: What are your technical skills?
```

Honest answer: list 3-4 things you're genuinely good at. Don't list 15 technologies. Outreachy values depth.

```
Q: How will you balance Outreachy with other commitments?
```

Time availability honestly disclose kar — agar college 9-5 chal raha hai, evening 6-10 PM mein 30 hr/week kar sakte ho, write that. Don't lie about availability — mentor track karta hai.

### 8.6 Outreachy contribution period strategy

Stage 2 ka 5-week contribution window — **ye tera asli interview hai**.

Pattern that wins:
- **Pick 1 project, focus exclusively.** Don't spread across 3.
- **Submit 1 PR/week minimum** (more is better but quality > quantity).
- **Public Zulip/Slack engagement** — mentor sees you everywhere in their channel.
- **Help other Outreachy applicants** — they're also competing, but Outreachy culture rewards collaborators.
- **Daily small commits to your fork** — visible momentum.
- **Final proposal extends from contributions** — not a separate doc, but a "and here's what I'd build next" extension.

5 weeks intense kaam karega — yahan se selection probability **20-30%** ho jata hai (vs 5-7% Stage 1 acceptance rate).

---

## 9. MLH Fellowship — open source as a paid internship

MLH = Major League Hacking. Tujhe pata hai — same MLH jo Devpost ke saath hackathons run karte hain. **MLH Fellowship** unka 12-week paid OSS program hai.

### 9.1 The pod system — unique to MLH

MLH Fellowship ka core differentiator: **pod system**.

- 10-12 fellows ek pod mein hote hain.
- 1 **pod leader** (senior engineer, often from sponsor company).
- 2-3 **maintainers** (open source project owners).
- 12-week structured curriculum + weekly office hours + pair programming sessions + demo days.

Ye literally ek **paid 12-week internship structure** hai, just done on open source projects instead of company-internal projects. **Resume pe "MLH Fellow" likhne ka prestige zyada hai** GSoC se kuch contexts mein, especially if your goal is Meta/Stripe/Coinbase placement.

### 9.2 Tracks available

- **Open Source Track** — assigned to a real OSS project, contribute alongside maintainers. Most popular.
- **Production Engineering** (sponsored by Meta) — DevOps, SRE, infrastructure. Meta engineers mentor.
- **Externship** — work directly on sponsor company's projects (e.g., Microsoft, GitHub, Twilio). Effectively a sponsored internship at a tier-1 company without going through their interview process.

### 9.3 Stipend + duration

- **Stipend:** $5,000-$8,000 USD (~₹4.18-6.7 lakh) over 12 weeks.
- **Duration:** 12 weeks, 40 hr/week (full-time equivalent).
- **Cohorts:** 3 batches/year (Spring Feb-Apr, Summer Jun-Aug, Fall Sep-Nov). Rolling admissions.

### 9.4 Application process

1. **Online form:** name, school, resume upload, GitHub URL, **2 essays** (~250 words each).
2. **Live coding interview** (~30-45 min, beginner-friendly — fizz-buzz to LeetCode-easy).
3. **Behavioral interview** with MLH staff.
4. Total process: 3-4 weeks.

Acceptance rate ~10% (varies per cohort + track).

### 9.5 India success stories — anonymized

- **Anonymous_E** (Tier-2 college Bangalore, 2023 batch): MLH Fellowship Summer 2022 (Production Engineering with Meta). Built monitoring tools. Post-fellowship → Meta London internship → Meta London FTE @ ~£70k.
- **Anonymous_F** (IIIT Allahabad, 2022 batch): MLH Fellowship Spring 2021 (Open Source with Mongo). Built Mongo connector improvements. Post-fellowship → Stripe Bangalore SDE-1 @ ₹38 LPA.
- **Anonymous_G** (NIT Calicut, 2024 batch): MLH Fellowship Fall 2023 (Externship with Twilio). Built API improvements. Post-fellowship → Coinbase Hyderabad SDE-1 @ ₹35 LPA + crypto stock.

Pattern: **MLH Fellowship → Sponsor-company-or-adjacent FTE within 6-12 months**.

### 9.6 Why MLH beats GSoC for some

- **Rolling intake** (3/year) — less stress, miss one batch, apply next.
- **40 hr/week structure** — counts as full-time internship on resume (better than GSoC's 25-30 hr/week part-time vibe).
- **Less proposal overhead** — short essays + interview, not a 2,500-word proposal.
- **Pod-based mentorship** — peer learning + structured curriculum.
- **Stipend higher** — $5k+ vs GSoC's $1.5-3k.

Trade-off:
- **Less prestige** than "GSoC at LLVM/Apache/CNCF" type lines for hardcore OSS-credibility-seekers.
- **More competitive** in some cohorts than realized — apply early in cycle (rolling).

### 9.7 Sample MLH essay excerpt

The "Why open source?" essay (~250 words):

```
I started using open source as a sophomore because my college's
MATLAB/SolidWorks lab licenses expired mid-semester. Switching
to Octave and FreeCAD revealed a world where I could read every
line of code I depended on, fix bugs, and contribute back.

My first contribution was a typo fix to FreeCAD's docs. Trivial,
but it showed me "doing open source" is not mystical — it's
communicating with strangers about shared code.

Since then I've contributed 7 PRs to Argo CD, OpenTelemetry-Lua,
and Apache APISIX. The pattern: open source rewards consistency.
Mentors are stretched thin; if you reliably ship small fixes,
they trust you with bigger ones.

I'm applying to MLH Fellowship to convert "I do open source"
into "I'm a sustained contributor" — to spend 12 dedicated weeks
working with maintainers on a real project. The pod system
attracts me especially: I want to learn how senior engineers
communicate, break down hard problems, handle disagreement in
code review. That's the skill I can't learn solo.
```

EngiNerd commentary: dekh, ye essay **AI-detection-trap se bachke** likha gaya hai. Personal anecdote (FreeCAD/Octave wala), specific PRs cited, motivation honest hai. **Don't write essays in fancy English with words like "delve into" / "harness the power of"** — MLH reviewers GPT-detection trained hain.

### 9.8 The MLH live coding interview

30-45 min session. Examples of questions (beginner level — these are easier than typical SDE-1 interview):

```
1. Reverse a string in your preferred language.
2. Find the largest element in an array.
3. Detect if a string is a palindrome.
4. Count vowels in a string.
5. Implement FizzBuzz.
6. Given a list of integers, return only the unique values.
7. Reverse a singly linked list.
```

Tu agar 200 LeetCode kar chuka hai, **ye 5-min mein solve kar lega**. Pressure kam hai. Stress mat le.

---

## 10. Long-tail programs — Season of KDE / Docs / Hyperledger / Sovereign Tech

Ye section "smaller but easier-to-win" programs ke baare mein. Agar tu first-timer hai aur GSoC ka acceptance 8% scary lagta hai, ye programs ke saath credibility build karke phir GSoC pe attempt kar.

### 10.1 Season of KDE (SoK)

KDE = Linux desktop environment + ecosystem. Season of KDE is their dedicated mentorship program.

- **Duration:** 16 weeks (longer than most).
- **Stipend:** €1,800 (~₹1.62 lakh).
- **Acceptance rate:** ~25-30% (much better than GSoC).
- **Project domain:** KDE applications (Krita, Plasma, KDevelop, Kdenlive, Konsole, etc.) + supporting infrastructure (KIO, Kirigami, Qt, etc.).

**Why pick:** if your interests align with desktop apps + C++/Qt + KDE, this is **easier path than GSoC** to get a stipended OSS experience. KDE alumni are well-connected in European tech scene + Plasma Linux ecosystem.

### 10.2 Season of Docs (Google)

Google's program for **technical writers** contributing to OSS docs. **Coding optional** — you write documentation.

- **Duration:** 3-9 months (highly flexible).
- **Stipend:** $5,000-$15,000 USD (highest range varies by project size).
- **Acceptance rate:** ~20%.
- **Eligibility:** anyone 18+, no formal "writer" credential required.

**Why pick:** if you're DSA-weak but communication-strong (good written English, technical understanding, can break down complex topics) — **this is your path**. Many Indian Season of Docs alumni have transitioned into developer relations / technical writer roles at Google, GitHub, Stripe, MongoDB.

### 10.3 Hyperledger Mentorship (Linux Foundation)

Blockchain niche under Linux Foundation. Less competitive than CNCF projects.

- **Duration:** 12-24 weeks (varies by project).
- **Stipend:** $3,000-$6,000 USD.
- **Acceptance rate:** ~12-15%.
- **Project domain:** Hyperledger Fabric, Indy, Aries, Besu, Iroha, Sawtooth — enterprise blockchain frameworks.

**Why pick:** if you're interested in Web3/blockchain but want **enterprise-blockchain pedigree** (vs DeFi/crypto-shitcoins), Hyperledger is the gateway. Companies like IBM, Accenture, Deloitte, Ernst & Young aggressively hire from Hyperledger contributor pool.

### 10.4 Sovereign Tech Fund (Germany)

German government's program funding critical OSS infrastructure. Launched 2022.

- **Duration:** 6-12 months (longer-term, more like a grant).
- **Stipend / Grant:** €10k-€50k+ for project work (project-based, not per-person).
- **Acceptance:** application-based, more selective.
- **Project domain:** core open source infrastructure (curl, OpenSSL, GnuPG, Python core, Sequoia-PGP, etc.).

**Why pick:** if you've already contributed to a critical-infrastructure OSS project (curl, OpenSSL, Python interpreter, Linux kernel), Sovereign Tech Fund can fund your maintenance work directly. Higher payout, **way more selective**.

### 10.5 FOSSEE Summer Fellowship (IIT Bombay)

India-specific, IIT Bombay-run, scientific Python ecosystem focus.

- **Duration:** 8 weeks (May-July).
- **Stipend:** ₹15,000-₹25,000/month (~₹30k-₹50k total).
- **Acceptance rate:** higher than international programs.
- **Project domain:** Scilab, OpenFOAM, Python educational material, scientific computing.

**Why pick:** Indian-origin program, simpler logistics (no international payment, no timezone issues, English+Hindi + IIT-B mentor support). Stipend lower but **way easier to get into** as a 2nd-year student. Use this as a **stepping stone to GSoC next year**.

### 10.6 GitHub Octernship / Maintainer Month

GitHub's own internship/mentorship batches.

- **Duration:** 12 weeks.
- **Stipend:** ~$5,000 USD.
- **Project domain:** GitHub-curated projects, often from sponsor companies.
- **Acceptance:** moderate, applicant pool limited (less promotion than GSoC).

**Why pick:** if you want **direct GitHub-employee mentorship** + sponsor company exposure (Meta, Microsoft, etc. partner with Octernship). Plus, GitHub itself has hired multiple Octernship alumni.

### 10.7 The "stepping stones" strategy

**First-time applicants** (especially 2nd year students):

1. **Year 1 of OSS:** Hacktoberfest + 1-2 random PRs (`open-source-guide.md`).
2. **Year 2 of OSS:** Season of KDE / FOSSEE / Hyperledger Mentorship (lower bar, you'll likely get in).
3. **Year 3 of OSS:** GSoC / LFX / Outreachy / MLH (now you have credibility, stipend track record).

Ye 3-year ladder hai. **Don't try to skip directly to GSoC year 1**. Build credibility first.

---

## 11. Mentor outreach — emails, chat, video that lands "yes"

Mentorship-program success ka 50% hissa **mentor relationship build karna** hai. Ye section: 4 specific outreach templates + cultural calibration tips.

### 11.1 The cold-mail intro template

```
Subject: Question about <Project> — and a possible LFX 2026 contribution

Hi <FirstName>,

I'm <Name>, 3rd-year CS at <University>. I've been reading the
<Project> codebase for 2 weeks (specifically the <module> module)
and want to confirm: is <specific behavior described in 2-3
sentences> intentional, or a known gap?

If it's a gap I could help close, I'd be interested in framing
this as a potential LFX 2026 project. I've already opened PR
#<XYZ> in <Project> and contributed 4 PRs to the broader CNCF
ecosystem (links below).

No rush on a reply.

Thanks!
<Name>
github.com/<username>

PS prior PRs:
- <Project> PR #ABCD
- <Other CNCF project> PR #EFGH
```

EngiNerd commentary: dekh, ye email **3 things** karta hai:
1. Specific technical question (not "can you mentor me?" — too transactional).
2. Prior contribution receipts at the bottom (mentor instantly verifies caliber).
3. "No rush on a reply" — respects mentor's time, removes pressure.

**Avoid:**
- "Respected Sir/Madam" → use "Hi <FirstName>".
- "I want to do GSoC and need a project" → too transactional, mentors get 50 such emails/year and ignore.
- Long autobiography in first message → keep it under 200 words.
- Asking for a Zoom call in first email → that's premature; first establish via async + then propose call.

### 11.2 Follow-up after a PR

```
To: <Mentor Email or PR thread>
Subject: Re: PR #<XYZ> — addressed all review feedback

Hi <FirstName>,

Just pushed v3 of PR #<XYZ> addressing your review comments:
- Resolved the nil-handling concern in `<file>:<line>`.
- Added the regression test you suggested.
- Updated the changelog entry.

CI is green. Let me know if there's anything else.

Also — I had a question about the broader direction here.
Is there interest in extending this to handle <related case>?
That could be a follow-up I could pick up if useful.

Best,
<Name>
```

EngiNerd commentary: ye follow-up **3 cheezein achieves** karta hai:
1. Specific updates (mentor doesn't have to re-read the PR).
2. Confirms CI is green (saves mentor a click).
3. Plants the seed of "next contribution" — mentor sees momentum.

### 11.3 Proposal feedback ask

```
To: <Mentor Email or DM>
Subject: GSoC proposal draft — feedback request

Hi <FirstName>,

I've drafted my GSoC proposal for the <Project> idea on tracing.
Would you have 15 min over the next week to glance at it? Linked
below; specifically would value feedback on:

1. The week-by-week breakdown — is week-3 too ambitious for the
   exporter implementation?
2. The OTLP-gRPC scope — should I cut it from MVP and add as
   stretch goal?
3. Any factual errors in the technical approach section?

If 15 min is too much, even a quick "looks reasonable / has
gaps" verdict would be valuable.

Draft: <link>

Thanks!
<Name>
```

EngiNerd commentary: dekh, ye ask **respects mentor's time**:
- Specific 3 questions (not "review my whole proposal" — too vague).
- Time-budgeted ("15 min" — mentor can plan).
- Fallback option ("even a quick verdict") — reduces friction.
- Link prominently.

Mentor 15 min nikal lega. **Generic ask ka** ("can you review my proposal?") response rate ~30%. **Specific time-budgeted ask** ka response rate ~80%.

### 11.4 Post-acceptance check-in

```
Subject: Selected — excited to start, quick logistics

Hi <FirstName>,

Just saw the GSoC selection email. Excited to spend 12 weeks
working with you on <project>.

Quick logistics:
1. Preferred sync cadence? I was thinking weekly 30-min calls.
2. Preferred async channel — Slack DMs, email, GitHub discussions?
3. Kickoff call in community bonding week (May 8-15)?
   My availability is flexible 5-9 PM IST.
4. Docs/code-paths to read during bonding period?

Looking forward!
<Name>
```

EngiNerd commentary: post-acceptance check-in **professional** rakhe — mentor ko pata chal jata hai tu serious hai. **Don't disappear after selection** — most students do this, then mentor ghosts them in week 4 because relationship hadn't been built.

### 11.5 Cultural calibration — Indian-student mistakes to avoid

International OSS culture **Indian formal-respect culture se categorically alag** hai. 7 mistakes specifically Indian students karte hain:

1. **"Respected Sir/Madam"** — pure cringe in international OSS. Use "Hi <FirstName>". First-name basis universal hai.
2. **Over-apologizing** — "Sorry to bother you, sorry for taking your time" — humility India mein achi mani jati hai, but international maintainers usse anxiety-inducing find karte hain. Confidence dikhao.
3. **Vague humility** — "I am just a beginner, please guide me" — weak position. Reframe: "I'm new to this codebase but have <prior experience>. Here's where I'm stuck: <specific>."
4. **Generic guidance ask** — "Sir, can you guide me on how to start?" → mentor has no specific answer. Ask specific: "Should I start with auth module or storage module? Both have open `good-first-issue` labels."
5. **SMS-speak** — "u" / "ur" / "plz" / "thanq" reads as unprofessional. Full words. 5 sec extra, 10x perception boost.
6. **Reply latency mismatch** — Indian students reply in minutes, expecting same. International maintainers reply in 2-5 days. Don't follow up after 12 hours — wait 5-7 days.
7. **Sycophantic praise** — "Your project is amazing, you do great work for the world" — cringe. Praise specific work instead: "Your design doc section on Y was clarifying."

### 11.6 The video intro — when to use, how to do

For complex topics or when text-async is failing, **2-3 min Loom video** mein walkthrough kar.

**When to use:** explaining a complex bug (visual is faster), showing a working prototype before formal PR, design feedback on multi-file architecture.

**How to do:** Loom (free) / CleanShot / OBS. Face-cam in corner, screen-share + voice. 90 sec - 5 min max. Speak slowly, pause between thoughts. Indian accent is fine — clarity > accent. Loom auto-captions; review them.

Mentor video response rate **emails se 3-5x higher** hota hai because video shows effort.

---

## 12. The mentorship-to-FAANG pipeline — 5 case studies

Ye section: 5 anonymized but realistic India-specific case studies. Pattern recognize kar.

### 12.1 Case study 1 — Tier-3 → GSoC → Google STEP → Google FTE

**Profile:** Tier-3 college Vidarbha (Maharashtra), B.Tech CSE, 8.2 CGPA, 200 LeetCode by end of 2nd year.

**Path:** Year 2 — Hacktoberfest 4 random PRs, identified Apache Beam as GSoC target. Year 3 (Nov) — lurked Apache Beam Slack, Dec-Jan opened 3 PRs (1 bug fix + 2 doc), all merged. Feb — emailed mentor with GSoC idea. March — submitted proposal, selected May. May-Aug — shipped distributed-tracing-aware DoFn lifecycle hooks. Sep — applied Google STEP with GSoC bullet. Year 4 — Jan STEP interview cleared, May-Aug Bangalore internship on Cloud Pub/Sub, Sep PPO @ ₹35 LPA + stock.

**What worked:** consistent contribution, mentor relationship pre-proposal, scoped specific GSoC project, GSoC bullet bypassed Google's normal college filter.
**What didn't:** wasted 2 months on too-popular org (Kubernetes); switched to Apache Beam where mentor had time.

### 12.2 Case study 2 — Tier-2 → Outreachy → Mozilla → Microsoft

**Profile:** Tier-2 college Bhubaneswar, B.Tech IT, 8.5 CGPA, woman from non-metro state.

**Path:** Year 3 (Aug) — discovered Outreachy via Twitter thread. Sep — applied Dec round, Stage 1 cleared. Oct-Nov contribution period — 8 PRs to Mozilla Common Voice in 5 weeks, all merged. Dec — selected. Dec-Mar — shipped voice-data validation pipeline. Year 4 (Mar) — Mozilla India referral for SDE-1. Apr-Jul Mozilla India internship → FTE @ ₹22 LPA. 18 months later: switched to Microsoft IDC SDE-2 @ ₹55 LPA.

**What worked:** Outreachy's contribution-based selection (no fancy proposal-writing needed), Mozilla brand, alumni-network referrals.
**What didn't:** first project (GNOME) had unresponsive mentors; switched to Mozilla in contribution-period week 2.

### 12.3 Case study 3 — Tier-2 → MLH Fellowship → Stripe internship → Stripe FTE

**Profile:** Tier-2 college Bangalore, B.Tech CSE, 8.0 CGPA, strong Go background.

**Path:** Year 3 (Jan) — applied MLH Spring. Feb — live coding cleared (FizzBuzz, 3 min). Feb-Apr — pod of 11 fellows, Mongo Atlas connector improvements. Apr — demo day, Stripe recruiter attended. May — Stripe Bangalore internship offer @ ₹2.5L/month. Year 4 (May-Aug) — payment-routing reliability work. Aug — Stripe SDE-1 PPO @ ₹38 LPA + stock. Started Dec 2026.

**What worked:** MLH demo-day sponsor exposure, smooth MLH-internal referral path.
**What didn't:** initial MLH essay AI-detected; rewrote with personal anecdote.

### 12.4 Case study 4 — IIIT → LFX → Sysdig → Red Hat

**Profile:** IIIT campus, B.Tech CSE, 9.1 CGPA, Linux + systems hobbyist.

**Path:** Year 3 (Aug) — lurked Falco Slack 6 weeks. Oct — 4 PRs in falcosecurity/falco merged. Nov — applied LFX Spring 2026 with Falco. Dec — accepted. Feb-May — shipped rule-engine eBPF integration. Year 4 (May-Aug) — simultaneous Sysdig Bangalore internship via mentor referral. Aug — Sysdig PPO @ ₹28 LPA + stock. Dec — joined Sysdig Junior Engineer. 18 months later: promoted Mid-Level. 30 months (2028): switched Red Hat OpenShift core team @ ₹50 LPA + stock.

**What worked:** Linux background aligned with Falco, LFX mentor's direct Sysdig referral, sustained engagement post-LFX.
**What didn't:** initial Cilium application rejected; pivot to Falco was the win.

### 12.5 Case study 5 — Tier-3 + 3 failures → SIH win + LFX → AWS

**Profile:** Tier-3 small-town college Bihar, B.Tech CSE, 7.4 CGPA (low for tier-1 filters).

**Path:** Year 2 — GSoC 2024 rejected (generic proposal, no prior PRs). MLH Summer 2024 rejected (essay AI-coded). Year 3 — Outreachy Dec 2024 not eligible (male). GSoC 2025 rejected again (still few prior PRs). Pivoted to hackathons — won SIH 2025 3rd place with K8s-based solution. Used SIH as CNCF community lead-in. Aug 2025 — applied LFX Fall with 5 prior PRs to OpenTelemetry. **Accepted.** Aug-Nov — shipped span exporter improvements. Year 4 (Dec) — AWS Bangalore noticed via mentor referral. Jan-Mar AWS interview cleared. May-Aug AWS Bangalore internship. Aug — PPO @ ₹32 LPA.

**What worked:** persistence through 3 failures, hackathon-win community lead-in, eventually broke through with LFX.
**What didn't:** initially competed on proposal-writing skill (weak background); eventually realized credibility-building was the lever.

### 12.6 Patterns across all 5 cases

Common threads: (1) all 5 had 3+ PRs to target org **before** applying; (2) winning proposals were specific over generic; (3) 4 out of 5 had direct mentor email/DM before formal application; (4) 2 out of 5 failed first attempt, pivoted, never gave up; (5) every mentee leveraged the program's alumni network for FTE recruiting.

---

## 13. The 6-month application calendar

Tu agar abhi padh raha hai aur summer 2026 GSoC/LFX/Outreachy target kar raha hai, to ye **month-by-month** plan hai.

### 13.1 September — research orgs

- **Week 1-2:** Read GSoC 2025's accepted org list (will give signal of 2026 likely orgs). Identify 3-5 orgs aligned with your tech stack.
- **Week 3-4:** For each shortlisted org, run repo-health check + read their Ideas page from prev year.

**Goal:** end of September — 2 candidate orgs locked-in.

### 13.2 October — first PR sequence + Hacktoberfest

- **Week 1-4:** Start Hacktoberfest. Use it as forcing function for first PRs.
- **Strategy:** don't just do random Hacktoberfest PRs — focus 4 PRs on your candidate orgs.
- **Goal:** 4 merged PRs across your 2 candidate orgs by month-end.

### 13.3 November-December — deepen contribution

- **Week 1-2 Nov:** open 2 issues in candidate orgs proposing small feature improvements.
- **Week 3-4 Nov:** open PRs for your own proposed features (the proposals from week 1-2).
- **Week 1-2 Dec:** join the org's community channel daily. Help newcomers.
- **Week 3-4 Dec:** start brainstorming GSoC proposal. Email mentor with high-level direction.

**Goal:** end of December — 6+ merged PRs, mentor recognition built, proposal direction validated.

### 13.4 January-February — proposal drafting

- **Week 1-2 Jan:** draft GSoC proposal v1. Run by your CS senior / GSoC alumnus for sanity check.
- **Week 3-4 Jan:** apply to MLH Fellowship Spring batch (in parallel — don't put all eggs in GSoC basket).
- **Week 1-2 Feb:** apply to LFX Mentorship Spring cohort (different timeline — applications open Jan-Feb).
- **Week 3-4 Feb:** finalize GSoC proposal v3. Send to mentor for feedback.

**Goal:** end of February — 4 program applications in flight (GSoC, LFX, MLH, plus Outreachy if eligible).

### 13.5 March-April — submission + iteration

- **Week 1 Mar:** submit GSoC proposal (window typically opens Mar 1-20).
- **Week 2-3 Mar:** await mentor questions on proposal. Respond fast (within 24 hours).
- **Mid March:** LFX Mentorship Spring decisions out. If accepted, focus shifts.
- **End March:** MLH Spring batch results.
- **April:** pure waiting + bug-fixing PRs in target orgs to keep credibility warm.

**Goal:** ideally 1+ acceptance by mid-April.

### 13.6 May-August — work + visibility

- **May:** community bonding period (if GSoC/LFX selected). Set up dev env, meet mentor, start coding.
- **June:** weekly progress posts on Twitter / LinkedIn — "Week 3 update on my [program] project: X". Builds public presence.
- **July:** mid-term evaluation period. Defend your milestones. Adjust if needed.
- **August:** final week sprint. Get feature merged. Submit final eval.

**Goal:** end of August — completion certificate + visible LinkedIn / Twitter presence + alumni network access.

### 13.7 September onwards — leverage the bullet

- **Sep-Oct:** apply to Google STEP / Microsoft Engage / Amazon SDE Internship using your mentorship bullet.
- **Oct-Nov:** apply to FTE positions (if final year) at companies that sponsor your program (Google, Mozilla, Red Hat, Stripe, etc.).
- **Throughout:** stay engaged with your project as a maintainer. Build long-term identity.

### 13.8 Failure recovery — if rejected from all

Bhai, ye sad reality hai — competitive programs hain. Selection rate 8-15% means **85-92% applicants reject hote hain**. Tu un mein ho sakta hai. Don't break.

**Plan B:**

1. **Diagnose the gap.** Was your prior PR count too low? Was proposal too generic? Did mentor outreach not happen? Honest postmortem.
2. **Apply to LFX Fall cohort** (Sep-Nov) — most-immediate retry. 6 weeks runway to submit.
3. **Apply to MLH Fall cohort** — same window.
4. **Apply to Season of KDE Apr-Aug** — different timing, lower competition.
5. **Or skip a year — pivot to other paths.** If 4 programs reject, the issue is fundamental (probably credibility-building gap). Spend a year doing **sustained random OSS PRs** (`open-source-guide.md`), then retry next year.

**Don't quit after 1 failure.** Most successful Indian students in these programs have **at least one rejection** in their journey. Persistence is the differentiator.

---

## 14. When NOT to apply — honest skip-this-season criteria

Bhai, ye section koi nahi likhta but main likh raha hu kyunki **honest hona zaroori hai**. Sab logon ko mentorship program apply nahi karna chahiye — **at least not this year**.

### 14.1 If your DSA is below baseline

GSoC/LFX/Outreachy mentorship programs **DSA test nahi lete** (mostly), but tujhe still **40-50 LeetCode Easy/Medium fluently solve karna chahiye** taaki tu code-review feedback handle kar sake. Bug-fix karte time tujhe arrays, hash maps, basic recursion pe comfort hona chahiye.

**Skip this season if:**
- LeetCode count < 50 problems.
- You're stuck on basic-array problems.
- You haven't shipped a single side project deployed publicly.

**Do this instead:** spend the next 6 months on `open-source-guide.md`'s prep + DSA grind + one solid side project. Then apply next year.

### 14.2 If your CGPA is on probation

Multiple programs (especially MLH Fellowship) need full-time commitment. 40 hrs/week for 12 weeks. **Agar tu academic probation pe hai aur supplementary exam clear karna hai** — focus on academics first. 12 weeks ka mentorship + 12 weeks ka exam-prep — both can't succeed simultaneously.

**Skip this season if:**
- CGPA < 6.5 (academic probation territory).
- Backlogs > 2 active.
- Pending semester clearance.

**Do this instead:** stabilize academics. Then apply next semester. **Mentorship is not worth losing a year of college over.**

### 14.3 If you can't commit 30+ hr/week

Programs like GSoC need 25-30 hr/week. MLH needs 40 hr/week. Outreachy needs 40 hr/week.

**Skip this season if:**
- You have parallel internship in same window.
- Family commitments require 4+ hours daily.
- Health issues (mental or physical) limit your bandwidth.

**Don't lie about availability.** Mentors track productivity. Tu agar week 4 mein already ghost ho gaya, **tu industry mein blacklist ho jata hai informally**. Permanent reputation hit hai. Better to skip this year than burn this bridge.

### 14.4 If your English communication is below threshold

Mentorship programs **async-heavy international communication** require karte hain. Tu PR description likhega, code review feedback respond karega, weekly progress reports likhega.

**Skip this season if:**
- You can't write a coherent 200-word paragraph in English.
- You don't understand idiomatic technical English (PR comments, RFC discussions).
- Your writing has so many grammar errors that mentors give up.

**Do this instead:** spend 3 months on technical writing fluency. Read PR threads on famous repos (next.js, kubernetes, react). Practice writing PR descriptions for your own random commits. Get feedback from English-fluent friends. **Then apply.**

Pro tip: agar mentor tujhe samajh nahi paaya English mein — selection ho bhi gaya to project mein dikkat aayegi. Don't fake fluency.

### 14.5 If you haven't done sustained engagement in any community

Mentorship programs **trust-based** hain. Mentor 12 weeks tujhe time deta hai. **Tu agar pehle kabhi long-term commitment nahi kiya hai** — koi club, koi side project, koi sustained activity — mentor ko signal nahi mil raha tu finish karega.

**Skip this season if:**
- You've never shipped a project end-to-end.
- You quit every side activity within 4-6 weeks.
- You don't have any GitHub heatmap > 30 days streak.

**Do this instead:** before applying, build **one** sustained piece of work — a 6-month side project, a 60-day GitHub streak, a published series of blog posts. **Show capability for sustained focus.** Then apply.

### 14.6 The honest skip-decision worksheet

Ye 5 questions imandari se answer kar:

1. Have I solved 50+ LeetCode problems? (Yes / No)
2. Is my CGPA stable and clearable this year? (Yes / No)
3. Can I commit 30+ hr/week for 12 weeks straight? (Yes / No)
4. Can I write a coherent 200-word technical English paragraph? (Yes / No)
5. Have I sustained any prior engagement (project / club / activity) for 60+ days? (Yes / No)

- **5 yes:** apply with confidence.
- **4 yes:** apply, but address the gap (probably DSA or CGPA — both fixable in 1-2 months).
- **3 yes:** **skip this season**, address gaps, apply next round.
- **<3 yes:** focus on fundamentals — `open-source-guide.md`, DSA, basic projects. Apply 6-12 months later.

**Skipping is not failing.** Skipping is **strategic timing**. Better one prepared application than 5 desperate ones.

---

## 15. Pulling it all together — your 12-week sprint plan

Aakhri section. Sab kuch ek concrete 12-week plan mein.

### 15.1 The week-by-week distillation

If you're reading this **today** and want to be GSoC-ready by **March of next year**, ye 12-week plan se shuru kar:

**Week 1:** Setup + read foundations.
- Read `open-source-guide.md` (if haven't) end-to-end.
- Read 3 GSoC alumni blog posts. Understand what worked.
- Pick 2 candidate orgs from current GSoC org list.

**Week 2-3:** Deep-dive candidate orgs.
- Lurk in each org's community channel.
- Read past 2 weeks of channel backlog.
- Read each org's CONTRIBUTING.md, ARCHITECTURE.md, ROADMAP.md.

**Week 4:** First PR.
- Identify 1 `good-first-issue` in primary candidate org.
- Claim, fix, open PR.
- Iterate on review feedback.

**Week 5-6:** Second + third PR.
- Move to `help-wanted` issues.
- Build technical depth in 1-2 modules of the codebase.

**Week 7:** Identify GSoC project.
- Read Ideas page (or current discussions).
- DM/email mentor to validate direction.

**Week 8-10:** Continue PR cadence + draft proposal.
- 1-2 PRs per week.
- Proposal draft v1, v2, v3 over these 3 weeks.
- Get peer + mentor feedback.

**Week 11:** Polish + parallel applications.
- Finalize GSoC proposal.
- Apply to MLH (if cycle aligns).
- Update LFX cover letter (if applicable).

**Week 12:** Submit + wait.
- Submit all applications.
- Continue PR cadence in candidate orgs (signal: "I'll keep contributing regardless of selection").
- Plan May-August summer schedule.

### 15.2 The 3 mantras

Bhai, agar tu sab kuch bhool jata hai, sirf ye 3 cheezein yaad rakh:

1. **Pre-existing PRs are 80% of selection.** Proposal ka polish 20% hai. Code-evidence ka background 80% hai.
2. **Mentor relationship matters more than proposal.** Email karo, video bhejo, smart questions pucho — selection ho gaya samjho.
3. **Persistence > perfection.** Reject ho gaya? Plan B/C/D try kar. Ek mentee ka first attempt success rate ~5% hai. Iss saal ke top performers next year ke 10x easier path pe hote hain.

### 15.3 The compound ROI

Ek paid mentorship = ₹2-6 lakh stipend. Wo number bada hai but **asli** asli payoff:

- **Tier-1 brand on resume** — Google/CNCF/Apache/Mozilla — recruiter funnel ka instant unlock.
- **Mentor referrals** — 1 GSoC mentor ka referral = 5+ FAANG interviews bypass kar deta hai DSA-screen.
- **Alumni network** — Slack + Discord + Linkedin — lifetime access to 1000+ engineers in your domain.
- **Compounding visibility** — har year tera resume thoda strong hota jata hai. Year 2 LFX ke baad year 3 GSoC easier ho jata hai. Year 4 mein FAANG offer easy.
- **Skill compounding** — async, English, code review, design — ye sab life-long.

5 saal baad jab tu Bangalore ke product company mein staff engineer hai, usse compare kar tier-3 college ke peer ke saath jo 3 LPA TCS Ninja mein bench warming kar raha hai. **Ye guide us 5-year ka difference create karta hai.**

### 15.4 What to learn next

Ye guide ka next layer:

- **`open-source-guide.md`** — broader OSS contribution mindset. Sustained PR culture.
- **`hackathons-bip-freelancing.md`** — adjacent visibility multipliers (hackathons + Build-in-Public + freelancing).
- **`off-campus-playbook.md`** — applying to product companies via off-campus channels (because GSoC alumni often combine off-campus + alumni-referrals).
- **`resume-behavioural.md`** — translating your mentorship work into resume bullets + acing HR rounds.
- **`faang-india-prep.md`** — once your mentorship-bullet is on resume, the FAANG prep is the next layer.

### 15.5 The final thought

Yaar, sun le ek baar final.

Mentorship programs are **literally the highest-ROI 12 weeks of your engineering education**. ₹2-6 lakh stipend. Tier-1 brand. Mentor relationship. Alumni network. Skill compounding. **Single-line resume bullet that opens FAANG doors.**

Most Indian students skip this — they're scared of GSoC's 8% acceptance rate. **Ye exact reason hai jo tujhe karna chahiye** — kyunki most logon ke skip karne ka matlab hai jo karte hain wo hi competitive advantage create karte hain.

Acceptance rate 8% **dikhta** hai scary. **Reality** mein, agar tu sustained 6 months prep karega, tera personal selection probability 30-40% hai. **5x bhetter than the average applicant.**

Aur agar 1 attempt mein nahi mila? **Plan B/C/D try kar.** LFX. MLH. Outreachy. Season of KDE. FOSSEE. Hyperledger. **6 programs hain. Kisi na kisi mein chance hai.**

Aur agar 6 mein se ek mein bhi nahi mila this year — **next year retry kar**. Tu aaj kal 19-20 saal ka hai. 1 saal lose karna kuch nahi hai. **3 saal mein tu Google FTE mein hai if you start today.**

Chal, ab tab band kar. GSoC org list kholo. 2 orgs shortlist kar. **Ye weekend ek community channel join kar. Aur Monday se first PR ka kaam shuru kar.**

Pehla PR October mein. Pehla mentor email November mein. Proposal February mein. Submission March mein. Acceptance May mein. **Stipend September mein. FAANG offer October mein.**

Ye sab connected hai. Start node ye guide hai. Execute.
