# Resume + LinkedIn + Behavioural STAR

Yaar, sun le. Tu 6 months DSA grind kar raha hai, 3 projects banaye, ek hackathon jeeta — sab kuch hai tere paas. Lekin agar resume kachra hai, LinkedIn dead pada hai, aur HR round mein "Tell me about yourself" pe tu freeze ho jata hai, to **interview tak pahuchega hi nahi**. Ye subject technical nahi hai, packaging hai. Aur packaging hi 50% rejections ka reason hai.

Ye doc end-to-end hai: ATS-friendly resume rules, X-by-Y-Z bullet framework, 10 bad-vs-good rewrite examples, LinkedIn optimisation, HR round playbook, STAR method deep-dive, top-20 behavioural questions ke answers, salary negotiation, aur ek pre-interview checklist. Ek baar end-to-end padh, fir apna resume khol aur line-by-line fix kar. Iska ROI tere baaki kisi bhi subject se zyada hai — kyunki agar tu interview tak nahi pahucha, to LeetCode 500 problems bekaar hain.

---

## 1. The brutal truth about resume + HR

Tu apne resume pe 4 ghante laga ke khush ho gaya — "boss, mast bana hai." Recruiter ne 6 second mein band kar diya. Welcome to reality.

**Numbers jo tujhe maan ne padenge:**

- **75% resumes ATS reject kar deta hai** before any human sees them. ATS = Applicant Tracking System, a software that parses your PDF, extracts text, matches keywords, scores you, and shortlists. Workday, Greenhouse, Lever, Naukri — sab ATS use karte hain. Tera fancy 2-column Canva template? ATS ke liye **garbage**.
- **25% jo human tak pahuchte hain, recruiter unhe 6-7.4 second dekhta hai** (TheLadders eye-tracking study). Six. Seconds. Tere 2-page magnum opus pe.
- **Top recruiters ke pas roj 200-500 applications aate hain** for one SDE-1 role. Wo har resume ko ek 6-second triage dete hain: name, college, top experience, top skills — sab kuch above the fold dikhna chahiye. Niche scroll karke kuch dhundta nahi hai.
- **HR round mein ~20-30% candidates fir bhi reject ho jaate hain** even after clearing technicals. Reasons: communication weak, "Tell me about yourself" bakwaas, attitude red-flag, salary expectations unrealistic, location/relocation issue. TCS / Infosys / Wipro mass-hiring rounds mein HR rejection rate aur high hai.

Iska matlab kya hai? Tere skills se pehle teri **packaging** judge hoti hai. Code likhne wala bhi tu hi hai, sales pitch likhne wala bhi tu hi. Engineering students yahin pe haar jaate hain — kehte hain "main toh tech mein strong hu, ye soft skills nautanki hai." Bhai, ye nautanki nahi hai. Ye gate hai. Gate cross karo, fir tech dikhao.

**Mental model:** Resume ek **marketing landing page** hai. Tu ek product hai, recruiter customer hai, time-on-page 6 seconds hai. Hero section mein clear value prop, niche social proof (projects with metrics), CTA (interview call). Same rules.

**One more truth:** Tier-2/3 college se hai? IIT-NIT log se compete kar raha hai? Teri resume **better likhi honi chahiye**, not equal. Brand nahi hai, to bullets se brand banao. Quantification, GitHub links, deployed URLs — sab kuch dikhana padega kyunki recruiter ko teri college se kuch bharosa nahi aata by default.

---

## 2. ATS-friendly 1-pager rules

Ye section ratta maar le. Ek-ek rule break karne pe ek-ek interview kho rahe ho.

### Rule 1: One column. Always.

Multi-column resumes (jaha left mein skills/contact, right mein experience) **ATS choke karta hai**. Why? ATS PDF se text linearly extract karta hai — left-to-right, top-to-bottom — and a 2-column layout often gets parsed as gibberish: "Skills Python Java SDE Intern Razorpay React Node Built API Bangalore Bachelor of Technology..." Sab mix ho jata hai.

**Test karna hai?** Apna PDF resume kholo, Ctrl+A, Ctrl+C, Notepad mein paste karo. Agar reading order toota dikh raha hai — sections jumbled — ATS ko bhi vahi dikh raha hai. Fix it.

### Rule 2: No tables, no text boxes, no sidebars, no icons-as-text.

- Tables: ATS ko rows/columns confuse karte hain. Especially nested tables.
- Text boxes (Word mein): often skipped entirely.
- Icons jaise phone-icon, email-icon, LinkedIn-icon — agar wo text se attached nahi hai, ATS ke liye invisible hain. Recruiter ko phone number dikhega image-icon ke baju mein, ATS ko sirf number dikhega — chalo theek hai. Lekin agar phone number text-frame ke andar hai jisko ATS skip karta hai, **tera contact info gayab ho jata hai**. Real story: Naukri pe 30% resumes ka phone parse fail hota hai isi wajah se.
- Headers / Footers: kuch ATS in regions ko skip karte hain. Naam aur contact main body mein rakho, header mein nahi.

### Rule 3: Standard fonts, standard sizes.

- **Font:** Arial, Calibri, Helvetica, Inter, Times New Roman. Bas. Cambria-Garamond-Lato bhi chal jaate hain. **Mat use karo:** custom fonts (Poppins ka woh light variant), script fonts, condensed/extended families.
- **Body size:** 10-11pt. Niche mat ja, recruiter old-eyed hai aur 9pt squint karta hai.
- **Name size:** 14-16pt, bold. Tera naam most prominent thing on the page hona chahiye — woh hi brand hai.
- **Section headers:** 11-12pt, bold, ALL CAPS or Title Case. Consistent across all sections.

### Rule 4: Standard section headers.

ATS apne database mein known headers dhundta hai. Creative-but-cute headers like "My Journey" instead of "Experience" — **fail**. Use boring, scannable headers:

- `Experience` (or `Work Experience`, `Professional Experience`)
- `Projects`
- `Education`
- `Skills` (or `Technical Skills`)
- `Achievements` (or `Awards & Recognition`)
- `Certifications`

Aur sirf yahi. "Professional Summary" optional, "Hobbies" skip kar.

### Rule 5: PDF, not Word.

Naukri/LinkedIn pe upload PDF karo. Word documents auto-format ho jaate hain different machines pe — teri Calibri 11pt Mac pe perfect dikh rahi hai, recruiter ke Windows pe Times New Roman 12pt mein expand ho gayi, layout toot gaya. **PDF freezes the layout.**

Exception: agar JD specifically Word format maange (some old enterprises do), tab Word de. Otherwise PDF.

**Save settings:** "Save as PDF (Standard)" not "PDF/A" (which is for archival and sometimes embeds fonts weirdly). Verify by opening the saved PDF and trying Ctrl+F to search "Python" — agar text searchable hai, ATS bhi padh paayega. Agar nahi (e.g., resume image-based bana hai), fix it.

### Rule 6: File name format.

```
firstname-lastname-resume.pdf
```

Examples:
- `aarav-sharma-resume.pdf` — clean.
- `Resume_Final_v3_actually_final.pdf` — recruiter cringe.
- `RESUME.pdf` — 200 such files in their downloads folder, tu lost ho gaya.
- `Aarav Sharma Resume - SDE Intern - Updated.pdf` — too long, spaces problematic on some systems.

Optional but recommended: include role.

```
aarav-sharma-sde-resume.pdf
aarav-sharma-data-resume.pdf
```

Tailoring file names per-role is a tiny touch but it sticks in recruiter's inbox.

### Rule 7: Photo? Almost never.

Indian context: TCS / Infy / some legacy companies still ask for a photo on the resume. **If the JD explicitly asks**, attach a passport-style photo top-right.

**Otherwise — no photo.** US/Europe ke companies (FAANG, startups, product cos) photo ko bias-trigger maante hain — diversity hiring guidelines mein photo banned-by-policy hota hai. Even Indian product companies (Razorpay, Swiggy, CRED, PhonePe, Atlassian, Adobe) no-photo prefer karte hain.

Photo dena hi ho:
- Plain background (white / light blue).
- Formal attire (collared shirt for guys, formal top for girls).
- Smile but not toothy.
- Recent (last 2 years).
- Not a selfie.
- Not the WhatsApp DP cropped from a wedding.

### Rule 8: One page. One.

You're a fresher. Ek page. No exceptions.

1 year experience? Still one page.

3+ years? Tab 1.5-2 pages allowed, but tight.

10+ years principal engineer? OK, 2-3 pages.

Tu fresher hai aur 2 pages bhar raha hai — kya likh raha hai bhai? "Class 10th: 92%, Class 12th: 88%, Hobbies: cricket, music" — cut it. ATS aur recruiter dono se itna nahi padhne wala.

### Rule 9: No fancy graphics.

- Skill bars (Python ████░ 80%) — **ATS ke liye invisible** AND **recruiters laugh**. "How did you measure 80%? Why not 79%?" Self-rated skill bars scream "fresher who watched a YouTube template video."
- Progress rings, language pie-charts, "Years of experience" timelines with cute icons — same fate.
- Color: ek single accent color OK (dark blue, dark grey). Rainbow resume reject.

### Rule 10: Margins, white space, alignment.

- Margins: 0.5"-0.75" all around. 0.4" if you must squeeze. Below that → cluttered.
- Line spacing: 1.0-1.15 within bullets, 1.5x between sections.
- Bullet alignment: hanging indent so wrap-around lines align with first letter.
- Dates: right-aligned. Always. Looks professional.

### Rule 11: Active voice, past-tense verbs.

- Bad: "Was responsible for managing the deployment pipeline."
- Good: "Owned and automated deployment pipeline using GitHub Actions."

Verbs: built, designed, deployed, optimised, reduced, automated, led, scaled, debugged, integrated, refactored, shipped, mentored, owned. Roman lage to Hinglish mein bhi tu likh sakta hai mentally — "maine deploy kiya" → "Deployed".

### Rule 12: No personal info that's not relevant.

Skip:
- Date of birth
- Gender / marital status
- Father's name
- Address (full PG address — city is enough)
- Religion, caste, nationality (unless visa-relevant for international role)
- Aadhaar / PAN
- "References available on request" — outdated, wastes a line, recruiters know they can ask.
- "Hobbies" beyond 1 line if at all (and only if interesting — "reading novels" is not interesting; "competitive cubing, sub-15 sec Rubik's record" is).

---

## 3. The quantification framework — X-by-Y-Z

Yahi sabse important framework hai is doc ka. Note kar le:

> **Built [X], achieving [Y], resulting in [Z].**

- **X** = what you built / did (the action + tech).
- **Y** = the metric / outcome (the number).
- **Z** = the business / user impact (why it mattered).

Har bullet mein ye teen pieces hone chahiye. **Y aur Z bina, bullet meaningless hai.** Recruiter ko number chahiye — 6 seconds mein number ki taraf hi eye jaati hai. "Reduced API latency by 40%" — eyes lock. "Worked on backend APIs" — eyes scan past.

### Numbers kaha se laaun? Tu bolega — "yaar, mera college project hai, kya number daalu?"

Bhai, har project mein numbers chhupe hote hain. Bas dhundh:

- **Performance:** load time, response time, throughput, queries/sec. Run a quick benchmark before/after.
- **Scale:** number of users, requests/day, data size, concurrent connections.
- **Cost / efficiency:** "reduced AWS bill by ₹X", "saved Y hours/week of manual work".
- **Adoption:** "deployed to 200+ users", "open-sourced, 50+ GitHub stars".
- **Quality:** test coverage %, bug count reduced, code review turnaround.
- **Time:** "shipped in 3 weeks", "reduced build time from 8min → 2min".
- **Comparison:** "vs alternative X, our approach Y was N% faster/cheaper/better".

Agar honest number nahi hai, **estimate karo aur clearly mark karo**. "Approx 50 daily users" theek hai. "1M users" jhooth — agar interviewer pooche, tu fas jayega.

Ek aur tip: chote-chote optimisations ko bhi quantify kar. "Switched from REST to GraphQL, reduced over-fetching by ~60% on profile page" — bohot strong bullet, even if your project is just a college mini-project.

### 10 bad-vs-good worked examples

**Example 1 — Frontend project (e-commerce)**

Bad:
> Built an e-commerce website using React and Razorpay.

Good:
> Built a Razorpay-integrated e-commerce React/Next.js app with cart, search, and order tracking; reduced checkout flow from 5 steps to 2, **improving conversion by 35%** in user testing with 40 beta users.

Why better: stack specifics, the X (what), the Y (35% conversion lift, beta-tested), the Z (real users, real flow improvement).

**Example 2 — Backend project (API)**

Bad:
> Worked on backend APIs using Node.js and Express.

Good:
> Designed and shipped 12 REST endpoints in Node.js + Express for a peer-to-peer book exchange platform; **handled 500 RPS** in load tests via Redis caching, reducing P95 latency from 800ms → 120ms.

Why better: count of endpoints, load number, cache rationale, before/after latency.

**Example 3 — ML / data project**

Bad:
> Built a machine learning model for sentiment analysis.

Good:
> Trained a fine-tuned DistilBERT sentiment classifier on 25K Hindi-English code-mixed tweets, **achieving F1 0.87 (vs baseline TF-IDF 0.71)**; deployed via FastAPI + Docker on AWS EC2 free-tier, serving 200+ daily queries.

Why better: dataset size, model choice rationale, baseline comparison, deployment + serving numbers.

**Example 4 — DSA contest / competitive programming**

Bad:
> Active on LeetCode and Codeforces.

Good:
> **Codeforces Specialist (max rating 1612)**, top 12% globally; solved 600+ problems on LeetCode with 100-day streak; **AIR 47** in CodeChef Starters #84 (out of 8,000+ participants).

Why better: specific ratings, ranks (AIR), participant counts, streaks. Recruiters love verifiable numbers — they cross-check on the platforms.

**Example 5 — Hackathon**

Bad:
> Participated in Smart India Hackathon, made an app for farmers.

Good:
> **Winner, Smart India Hackathon 2024 (Govt. of India)** — led 6-person team to build a Hindi-voice-based crop-disease detector (ResNet-50 + TFLite) running offline on low-end Android; demoed live to MoA officials, **selected 1st of 32 finalist teams**.

Why better: "Winner" upfront, specific authority (Govt of India / MoA), team size, tech stack, deployability constraint, ranking out of total.

**Example 6 — Internship (small startup)**

Bad:
> Interned at XYZ Technologies, worked on web development.

Good:
> SDE Intern, XYZ Technologies (May–Jul 2025): owned migration of legacy jQuery dashboards to React + TypeScript across 8 internal pages; **reduced page-load time by 55%** (4.2s → 1.9s) and unblocked the analytics team to query data in real-time.

Why better: scope (8 pages), the migration arc, perf metric with raw numbers, business outcome (analytics team unblocked).

**Example 7 — Open-source contribution**

Bad:
> Contributed to open source projects on GitHub.

Good:
> Merged **3 PRs to vercel/next.js** (issue #58221: routing edge case under streaming SSR; issue #59104: hydration mismatch in i18n) — verified by automated tests added; PRs reviewed by core maintainers and shipped in v15.0.3.

Why better: specific repo, specific issues, verified-by-tests claim, traceable (anyone can verify the PR).

**Example 8 — Leadership / club role**

Bad:
> Coordinator of college coding club.

Good:
> Lead Coordinator, GeeksForGeeks Campus Chapter (200+ members): organised 6 workshops + 2 inter-college hackathons in 2024–25; **grew club membership 3x (60 → 200)** through weekly newsletter + Instagram Reels reaching 12K impressions.

Why better: specific role, total scale, growth multiplier with raw numbers, channels used.

**Example 9 — Research / paper**

Bad:
> Wrote a research paper on graph neural networks.

Good:
> Co-authored "GNN-based Anomaly Detection in IoT Sensor Networks" (1st author of 4); **accepted at IEEE INDICON 2024**, presented orally; achieved 94% precision on the SWaT benchmark, beating prior best by 3.1%.

Why better: paper title (so it's googleable), venue (IEEE — credible), authorship position, presentation type, benchmark + delta.

**Example 10 — Side project / tool**

Bad:
> Built a Chrome extension for productivity.

Good:
> Built and published "FocusFlow" Chrome extension (Pomodoro + tab-blocker + analytics): **600+ active users on Chrome Web Store, 4.6 rating (53 reviews)**; open-sourced on GitHub (90+ stars), featured in r/productivity weekly thread.

Why better: real distribution number, rating + review count, GitHub social proof, external mention. All cross-verifiable.

### Common quantification mistakes to avoid

1. **Vanity metrics** — "Wrote 5,000 lines of code". Lines of code is not an outcome. Skip.
2. **Unrealistic numbers** — "Handled 1M users". On a college project? Recruiter sniffs BS in 1 second.
3. **Ratio without base** — "Improved by 50%". 50% of what? "50% from 200ms → 100ms" — that's clear.
4. **Buzzword soup** — "Leveraged synergistic AI/ML/Blockchain". Stop.
5. **Listing tech without action** — "React, Node, MongoDB". So? What did you DO with them?

---

## 4. Section-by-section template

Top to bottom. Order matters — most-impactful section closer to top.

### Header (top of page, 4 lines max)

```
AARAV SHARMA                                     +91-98XXXXXXXX
Full-Stack Developer | SDE Intern              aarav.sharma@gmail.com
LinkedIn: linkedin.com/in/aarav-sharma   GitHub: github.com/aarav-sharma
Bangalore, India  (Open to relocation)         Portfolio: aarav.dev
```

Or two-line clean:

```
AARAV SHARMA
+91-98XXXXXXXX | aarav.sharma@gmail.com | linkedin.com/in/aarav-sharma | github.com/aarav-sharma
```

**Rules:**
- Use a professional email — `aarav.sharma@gmail.com`, not `coolboy_aarav99@gmail.com`. College emails fine but personal Gmail safer (you don't lose access after graduation).
- Phone: include country code (+91) and a 10-digit number. WhatsApp-active number.
- LinkedIn: customise URL — see LinkedIn section below.
- GitHub: must have at least 5-6 starred / pinned projects with READMEs.
- Location: city, India. Mention "Open to relocation" if applying to other cities.
- Portfolio link if it's actually good. Don't link a half-built portfolio that 404s — recruiter clicks, sees 404, you're dead.

### Summary (optional, only if 1+ year experience)

If you're a pure fresher, **skip the summary**. Save the line for projects.

If you have 1+ year:

```
SUMMARY
Backend engineer with 1.5 years of experience in Go + Postgres, having shipped 4 production
microservices at a Series-A fintech (200K MAU). Strong on distributed systems, observability,
and on-call. Targeting senior backend / platform roles in product startups.
```

Rules:
- 2-3 lines, max ~50 words.
- Target-role-specific. Applying for ML role? Lead with ML. Backend? Lead with backend.
- No "passionate, dedicated, hard-working" — those are filler. Show, don't tell.
- Mention years, stack, scale signal, and what you want.

### Experience (or Projects, for freshers)

For freshers: **Projects above Education**. For 1+ yr: **Experience above Projects**.

Per entry:

```
Role | Company / Project Name | City              Month YYYY – Month YYYY
- Bullet 1 (X-by-Y-Z, ~1-2 lines)
- Bullet 2 (X-by-Y-Z, ~1-2 lines)
- Bullet 3 (X-by-Y-Z, ~1-2 lines)
[Optional] Tech: React, Node.js, Postgres, Redis, AWS Lambda
[Optional] Live: link.to/demo  |  Code: github.com/.../repo
```

Rules:
- 3-5 bullets per entry. 6+ → trim, the lower bullets are weaker anyway.
- Strongest bullet first (biggest number or biggest impact).
- Tech line at the bottom is fine — searchable for ATS keywords.
- Live + Code links critical for projects — recruiter wants to verify.

### Skills

Group by category. **No ratings**. No "Python ★★★★☆" — that's amateur and meaningless.

```
SKILLS
Languages: Python, JavaScript / TypeScript, Java, Go, SQL
Frameworks: React, Next.js 16, Node.js, Express, FastAPI, Spring Boot
Databases: PostgreSQL, MongoDB, Redis, DynamoDB
Cloud / DevOps: AWS (EC2, S3, Lambda, RDS), Docker, GitHub Actions, Terraform (basic)
Tools: Git, Linux, Postman, Jira, Figma, Excalidraw
```

Rules:
- Order categories by relevance to target role. Backend role? Languages → Frameworks → DBs → Cloud. Frontend? Languages → Frameworks → CSS-tools → Build-tools.
- "(basic)" tag is OK if you've only touched something briefly — better than claiming expert and getting torn apart in interview.
- Don't list 25 things. ATS scans, but recruiter sees fluff. 15-20 max.
- Don't list MS Office unless applying for analyst roles.

### Education

```
EDUCATION
B.Tech, Computer Science                                      2022 – 2026
XYZ Institute of Technology, Pune                             CGPA: 8.4 / 10
Relevant coursework: DSA, OS, DBMS, Computer Networks, Distributed Systems, ML
```

Rules:
- CGPA only if ≥7.5 OR you're in top 25% of your class. Below 7.5? Just write the institute name and degree, skip the CGPA.
- Relevant coursework optional but good for fresher → fills space and shows depth.
- Class 10 / 12 percentages: include only if you went to a good school AND your CGPA is weak. Otherwise skip — they don't matter once you're in college.
- Don't put school marks above your B.Tech. Reverse chronological.

### Achievements

This is where you flex. Coding ranks, hackathons, scholarships, OSS, papers, athletic / cultural wins.

```
ACHIEVEMENTS
- Codeforces Expert (max 1712) — top 6% globally; solved 800+ problems
- Winner, Smart India Hackathon 2024 (Govt. of India) — 1st of 32 finalist teams
- AIR 312, GATE CS 2025
- Recipient of Inspire Scholarship (₹80K/year, top 1% of state in Class 12 Boards)
- Co-author, "GNN-based Anomaly Detection" (IEEE INDICON 2024)
- Open-source: 3 merged PRs to vercel/next.js (#58221, #59104, #61003)
```

Rules:
- Each achievement gets 1 line. Quantify ranks, percentiles, prize money.
- Order: most relevant + most recent first.
- Don't pad. 4-7 strong items > 12 weak ones.

### Optional: Certifications

Only if relevant and prestigious.

- AWS Solutions Architect Associate ✓
- Coursera "Introduction to Python" ✗ (everyone has it, dilutes the section)
- Google Cloud Professional Data Engineer ✓
- Udemy "Complete Web Bootcamp" ✗

Rule of thumb: if recruiter has heard of the cert AND it's not free-with-certificate-on-completion, include it. Otherwise skip.

### What NOT to include

- "References available on request" — outdated since ~2010.
- Date of birth, marital status, age, gender, religion.
- Photo (unless asked).
- Hobbies (unless genuinely standout).
- Soft skill claims with no proof: "Excellent communicator, team player, leader" — show via STAR in bullets, don't claim.
- Class 10 marks if your B.Tech CGPA is decent.
- Your full home address — city is enough.
- Aadhaar / PAN — never put on resume.
- Salary expectations — never on resume; that's a negotiation, not a credential.

### A complete fresher resume — anatomy

```
AARAV SHARMA
+91-98XXXXXXXX | aarav.sharma@gmail.com | linkedin.com/in/aarav-sharma | github.com/aarav-sharma | aarav.dev
Bangalore, India | Open to relocation

PROJECTS

ChaiBot — RAG-based assistant for tea-shop owners        Mar 2025 – present
- Built a multilingual (Hindi/English) RAG app using LangChain + Pinecone + Llama-3 8B; serves 60+ tea-shop owners in Pune answering inventory & GST queries.
- Reduced average response latency from 4.1s → 1.3s by switching to streaming + cached embeddings; cut Pinecone cost ~70% via 384-dim instead of 1536-dim embeddings.
- Open-sourced (62 GitHub stars), featured on r/LangChain weekly.
Tech: Python, FastAPI, LangChain, Pinecone, Postgres, Docker, AWS EC2
Live: chaibot.app  |  Code: github.com/aarav/chaibot

PeerLearn — P2P book-exchange marketplace                Sep 2024 – Feb 2025
- Designed and shipped 14 REST endpoints (Node + Express) backing a Next.js frontend; load-tested at 500 RPS with Redis caching dropping P95 latency 800ms → 110ms.
- Integrated Razorpay (one-time payments + refunds), reducing transaction failures from 12% → 2.5% via idempotency keys.
- Wrote 84 Jest tests (88% coverage) and set up GitHub Actions CI catching ~3 regressions/week before merge.
Tech: Node.js, Express, Postgres, Redis, Next.js 16, Razorpay, Jest, GitHub Actions
Live: peerlearn.in  |  Code: github.com/aarav/peerlearn

EXPERIENCE

SDE Intern, Kuku FM, Mumbai                              May – Jul 2025
- Owned migration of 8 legacy jQuery admin dashboards to React + TypeScript; reduced page-load 55% (4.2s → 1.9s) and unblocked analytics team for real-time queries.
- Shipped a feature-flag service (Go + Postgres) used by 4 product teams; cut deploy-revert MTTR from 22min → 4min.
- Mentored 2 fresher interns through code reviews; their PRs got first-time-right merge rate from 40% → 75%.

EDUCATION
B.Tech, Computer Science                                 2022 – 2026
ABC College of Engineering, Pune                         CGPA: 8.4 / 10
Coursework: DSA, OS, DBMS, Computer Networks, Distributed Systems, ML

SKILLS
Languages: Python, TypeScript / JavaScript, Go, SQL, Java
Frameworks: React, Next.js 16, FastAPI, Express, LangChain
Databases: PostgreSQL, Redis, MongoDB, Pinecone
Cloud / DevOps: AWS (EC2, S3, Lambda), Docker, GitHub Actions
Tools: Git, Linux, Postman, Excalidraw

ACHIEVEMENTS
- Codeforces Expert (max 1712), 800+ LeetCode problems, 100-day streak
- Winner, Smart India Hackathon 2024 — 1st of 32 finalist teams
- 3 merged PRs to vercel/next.js (#58221, #59104, #61003)
- AIR 312, GATE CS 2025
```

Ye approx 1 page mein fit ho jata hai with 11pt body, 0.6" margins. Print karo, look at it. Recruiter ke 6 second journey mein "Codeforces Expert", "SIH Winner", "Kuku FM intern", "RAG project, 60+ users" — sab pop karta hai.

---

## 5. LinkedIn Optimisation

LinkedIn ek **second resume + active inbound channel** hai. Recruiters India mein ab Naukri se zyada LinkedIn pe fishing karte hain — especially product startups (Razorpay, Cred, Zomato, PhonePe, Flipkart, Atlassian Bangalore, Microsoft IDC). Tu agar LinkedIn ignore kar raha hai, tu inbound interviews ka 60% kho raha hai.

### Custom URL

Default LinkedIn URL: `linkedin.com/in/aarav-sharma-7b8c9d2e1f`. Ugly. Change it.

Settings → Edit public profile & URL → set to: `linkedin.com/in/aarav-sharma`.

If your name is taken, try variants:
- `aarav-sharma-dev`
- `aaravsharma`
- `aarav-s-sharma`

Avoid numbers. Avoid years (`aarav-2026` — looks like batch tag, dates the profile).

### Profile photo + banner

- **Photo:** clear face, smile, plain background, decent lighting, formal-casual outfit (collared shirt fine, t-shirt risky for professional vibe). Crop tight: shoulders up. **Profiles with photo get 14x more views.**
- **Banner:** not blank. Use Canva — pick a tech-themed banner (clean, dark, with maybe a tagline like "Building backend for the next billion users"). Or a photo of you giving a talk / at a hackathon. **Skip:** stock photos of "code on screen with hooded hacker."

### Headline (the 220-char gold mine)

Default: `Student at XYZ College`. **Change immediately.**

The headline shows everywhere — search results, comments, DMs, recommendations. It's your handshake.

Formula:

```
[Current role] @ [Company] | Building [thing] with [stack] | Open to [target role]
```

Examples:

- `SDE Intern @ Razorpay | Building payment infra with Go + Postgres | Open to backend SDE-1 roles`
- `B.Tech CS '26 @ NIT Trichy | Full-stack dev (React + Node) | 3x Hackathon Winner | SIH '24`
- `Data Analyst @ Swiggy | SQL + Python + Tableau | ex-Flipkart | Writing about A/B testing`
- `ML Engineer | Computer Vision + LLMs | IIT Hyderabad '24 | Open to research roles`

Rules:
- Keywords matter (recruiters search "backend SDE Bangalore 2025"). Include role + stack + location-implied signals.
- 220 character limit — use it.
- Update before placement season starts: change "Open to internships" → "Open to full-time SDE roles" by August.

### About section (3-paragraph framework)

The About is read by ~30% of profile visitors — recruiters who're seriously considering you. Waste this section and you waste the few who actually invest in you.

**Para 1 — Who you are (2-3 lines):**
Position + tech stack + 1 signature signal.

> Backend engineer in the making, currently building distributed systems at Razorpay (intern). I write Go + Postgres for a living and TypeScript on weekends. Codeforces Expert, AIR 47 in CodeChef Starters #84.

**Para 2 — What you build / have shipped (3-5 lines):**
Highlight 2-3 standout projects/wins. Concrete, with numbers.

> At Razorpay, I'm rewriting parts of our settlement service handling ₹40Cr+/day. On the side, I built ChaiBot — a RAG assistant for tea-shop owners (60+ active users, 62 GitHub stars). Last year, my team won SIH 2024 with a Hindi-voice crop-disease detector. I've also shipped 3 PRs to vercel/next.js (issues #58221, #59104, #61003).

**Para 3 — What you want / how to reach (2-3 lines):**
Target role + signal what you're open to + how to DM.

> I'm targeting full-time backend / platform engineering roles starting July 2026 — Bangalore, Bengaluru, or remote-India. Always up for a chai chat about distributed systems, on-call horror stories, or open-source. DM me on LinkedIn or aarav.sharma@gmail.com.

**Style tips:**
- First-person ("I"), not third-person ("Aarav is...").
- Hindi-English Hinglish mostly avoided in About — keep this section professional English. Save the Hinglish for personal posts where personality shines.
- Line breaks. Wall-of-text About = nobody reads.
- Avoid clichés: "passionate", "go-getter", "results-oriented".
- Update yearly minimum.

### Featured section

Pin **3 best projects** here. This is the showcase wall.

For each:
- Banner image (Canva — title + tech logos).
- Title + 1-line outcome.
- Click-through: GitHub repo, live demo, or a LinkedIn post about it.

Why featured matters: recruiter scrolls down, sees Featured, sees screenshot of `chaibot.app` — that's a 5-second nudge stronger than a bullet.

### Experience (same quantification rules as resume)

LinkedIn experience entries can be slightly **longer** than resume — paragraph + bullets fine. ~3-5 sentences per role + 3-5 bullets. Use the same X-by-Y-Z framework. Don't just copy resume verbatim — expand.

Pro tip: each experience entry can have media attached (PDFs, links, images). Attach a project deck, demo video, or LinkedIn post.

### Recommendations — how to ask

LinkedIn recommendations = social proof on steroids. 3-5 recommendations from real people (managers, professors, teammates) is the sweet spot. **0 recommendations = profile feels empty.**

How to ask (template DM):

> Hey [Name], hope you're well! I'm putting together my LinkedIn profile for placements / job hunt and wanted to ask — would you be willing to write a short recommendation about our work together on [project / internship / course]? Even 3-4 lines about what you saw me do well would mean a lot.
>
> Happy to draft a starting version you can edit, if that's easier — totally up to you. No worries at all if it's not a good time.
>
> Thanks!
> Aarav

Tips:
- Ask people you actually worked with — fake-feeling recs read as fake.
- Drafting one for them is fine — most managers appreciate the time saved.
- Reciprocate: write recommendations for them too. LinkedIn shows mutual recs as stronger signal.

### Activity / posts — build in public

Top 5% of profiles **post regularly**. Doesn't need to be daily, weekly is fine.

Post types that work:

1. **Build-in-public update**: "This week shipped X. Hit problem Y. Solved with Z. Code link." 100-200 words.
2. **Learning notes**: "Read [book/paper], top 3 takeaways for engineers."
3. **Project launch**: "Launched [thing]. Here's what it does, who it's for, link to try."
4. **Honest reflection**: "Failed in [contest/round]. Here's what I learned." Vulnerability sells in tech.
5. **Helping juniors**: "5 mistakes I made in my first internship — so you don't."

Avoid:
- Re-shares with one-line "Insightful!" comment — algorithm penalises low-effort.
- "Excited to announce I cleared [trivial milestone]" — Indian LinkedIn meme territory.
- Crying-face videos. Just no.

Cadence: 1 post / week is plenty for a student. Recruiters who land on your profile see "Active recently" + 4-5 recent posts → they trust you're real.

### "Open to work" toggle

Two options when toggling on:
- **Public banner** (green frame on photo + #OpenToWork): visible to everyone.
- **Recruiters only**: visible only to LinkedIn Recruiter subscribers.

Trade-off:
- **Public banner**: maximum visibility, but can signal desperation if you're already employed (current employer sees it). For students/freshers — public banner is fine. For ~1 yr exp pivoting jobs — usually "recruiters only" to avoid the awkward chat with current manager.
- **Recruiters only**: stealth, no current-employer drama, but smaller reach.

For final-year placement-season students: **public banner**. You want every recruiter ping.

### LinkedIn India-specific quirks

- Don't add 5,000 random connections — quality > quantity. Connect with people you've met / interacted with.
- Hindi/English mix in posts is OK, but English-first for professional posts (HRs across India read English).
- Big-name connection chasing (random VPs, CEOs) is futile — they ignore. Connect with engineers, EMs, recruiters at companies you target.
- Skill endorsements are inflated everywhere (someone you talked once endorses you for "Leadership"). Largely ignored by recruiters now. Don't sweat them.

---

## 6. The HR / Behavioural round

Tech round clear kar liya — celebration mat shuru kar. HR round baki hai, aur 20-30% candidates yahin reject hote hain.

### Why HR rounds even exist

- **Cultural-fit gate.** Company doesn't want a brilliant jerk. Will you collaborate? Are you reasonable in conflict? Will you sue them in 6 months over PIP?
- **Attrition signal.** TCS / Infy / Wipro / Cognizant — bulk hiring. They don't want someone who'll quit in 6 months for a ₹20K hike. So HR digs into stability, family/relocation comfort, long-term plans.
- **Communication check.** SDE-1 will write Slack messages, design docs, PR descriptions. Can you communicate in plain English without rambling? HR is a 30-min stress-test of that.
- **Salary/notice-period alignment.** HR negotiates the offer. They want to know your expected CTC, current notice, joining flexibility — before they generate the letter.
- **Red-flag detection.** Drug/criminal background hints, multiple-offer-shopping vibes, extreme negativity about previous employer.

Engineering students often dismiss HR as "ratta-maar nautanki." Big mistake. HR has **veto power**. They can spike a recommended candidate by writing "communication weak" in the feedback.

### The three big questions (every HR asks 80% of the time)

#### Q1: "Tell me about yourself."

This is the **most asked, most flubbed**. 90% of candidates rattle off their resume in chronological order — boring and pointless because the HR has the resume.

**Better structure (P-P-F: Past-Present-Future):**

> "Sure! I'm Aarav, currently in my final year of B.Tech CS at NIT Trichy.
>
> *(Past)* I started coding seriously in second year — built a peer-to-peer book exchange app that got ~200 college users — and that pulled me into backend engineering. Since then I've competed on Codeforces (Expert rating) and won SIH 2024 with my team.
>
> *(Present)* This summer, I interned at Razorpay's settlement team — owned a service handling ₹40Cr+/day, my biggest learning was on observability and on-call rotations.
>
> *(Future)* I'm now looking for a full-time backend role in a product company where I can keep working on payments or fintech infra. That's why I'm excited about the opening here at [Company]."

90 seconds, max 120. Practice it out loud 5x. Don't memorise verbatim — sound natural.

#### Q2: "Why this company?"

Bad answer: "It's a great company with good culture and growth opportunities."
HR will literally roll eyes (mentally). Generic = death.

Good answer formula: **specific company fact + specific role fit + specific you-reason**.

> "I've been following [Company]'s product launches since [year]. The thing that pulled me in specifically was [specific thing — e.g., the open-source tooling team's Hacktoberfest contributions / the engineering blog post on how you migrated to Kubernetes / the recent Series-C funding for international expansion]. For this role specifically, I see it overlaps heavily with the [thing] I built last year — and I want to do that at scale, not at toy-project size. I'm also based in Bangalore so location works for the long haul."

Show you've done homework. Read 2-3 recent eng blog posts. Know their tech stack. Know their last funding round.

#### Q3: "Where do you see yourself in 5 years?"

Trap question. Both extremes lose:
- "Your CEO" — arrogant, naive.
- "I don't know, depends" — no ambition.

Sweet spot: aspirational + role-aligned + humble.

> "Honestly, 5 years feels far, but my next 2-3 years I want to go deep on backend systems — own a critical service end-to-end, lead an oncall rotation, mentor 1-2 juniors. By year 5, I'd want to be either a strong senior engineer driving large architecture decisions or growing into tech-lead territory if that's where my strengths are. I don't have a fixed manager-vs-IC ambition yet — I'd want to figure that out from the work I do here."

Ye answer flexible hai, mature lagta hai, aur "I want to grow with you" implicitly bolta hai.

### Indian-specific HR quirks

- **Family / relocation question:** "Are your parents OK with you relocating to Bangalore?" Honest answer is fine — "Yes, we've discussed it, my parents are supportive, I've also lived independently in [city] for 4 years of college so the transition is fine." Don't say "it's complicated" — that's a yellow flag for them.
- **Marriage / settlement question (sometimes asked, especially for women candidates and in legacy IT):** Technically illegal-ish to ask but happens. Polite deflect: "That's a personal decision and not something that would impact my professional commitments." Tone: matter-of-fact, not offended.
- **Notice period:** Be honest. Most product cos can buy out notice up to 60 days. "I have 60 days notice but my current employer has accepted shorter buyouts in the past, so it's negotiable" is great.
- **Expected CTC:** Don't lowball, don't shoot the moon. See Salary Negotiation section below for the formula.
- **"Why are you leaving your current company?":** Never trash the current employer. Even if you hate it. Frame it as "looking for X that current role doesn't offer" — bigger scale, different domain, more ownership, etc.
- **Backup offers / multiple interviews:** "Yes I'm interviewing at 2-3 other places, but [Company] is among my top choices." Honest + signals you're a hot candidate. Don't lie that they're your only option — recruiters smell desperation.

---

## 7. STAR method deep-dive

Behavioural questions ka format pehle se decided hai. Tu agar STAR mein answer dega, tu auto-pilot pe organised lagega. Tu agar randomly dive in karega — bhatak jayega aur HR ka attention chala jayega.

### What is STAR

- **S — Situation:** Set the context. Where, when, what was happening. **1-2 sentences.**
- **T — Task:** Your specific role / responsibility / what you needed to achieve. **1 sentence.**
- **A — Action:** What YOU specifically did. Not "we did X" — "I did X". This is the **meat — 60% of your answer**. Use action verbs (designed, debugged, led, escalated, refactored, mediated, decided).
- **R — Result:** Quantified outcome + reflection. **2-3 sentences.** This is what 80% of candidates skip — they trail off after the action. STAR's R is its punch.

### Common STAR mistakes

1. **"We" overload.** "We built it, we shipped it, we won." HR wants to hear what YOU did. Even in team work, your slice was specific — call it out.
2. **No result.** "And then we shipped it." So? Did it work? Was it adopted? Did revenue go up? What happened?
3. **Too much situation, not enough action.** Spend 3 minutes setting up scene, 30 seconds on what you did. Wrong ratio.
4. **Theoretical answer.** "I would handle conflict by..." HR didn't ask hypothetically; HR asked about **a time** — give a real story.
5. **Negative endings.** "And then the project failed and management cancelled it." Even failure stories should end in **what you learned**.

### 5 worked STAR answers across categories

#### STAR-1: Leadership

**Q: "Tell me about a time you led a team."**

> **(S)** In my second-year coding club, we had a 6-person team building a fest-management app for our college's annual tech fest, with 4 weeks until launch and most members having no React experience.
>
> **(T)** As lead, I was responsible for shipping a working web + mobile flow handling event registrations for ~3,000 students.
>
> **(A)** First, I broke the project into 4 modules — auth, event-listing, registrations, admin dashboard — and matched each to one teammate's strength. For the two members new to React, I ran a 2-hour weekend crash-course covering hooks + REST integration. I set up GitHub PR-review rotations so we caught bugs early. Mid-project, our backend dev had a family emergency for 5 days — I picked up his work in addition to mine, and re-scoped the admin panel to ship a simpler v1 first.
>
> **(R)** We shipped on time. The app handled 2,800 registrations in launch week with zero downtime; we got featured in the college newsletter. Two of the juniors I mentored later told me it was their first "real" team project and they ended up leading their own teams the next year. My own takeaway was that **scope-cutting is a leadership skill** — not everything has to ship on day one.

#### STAR-2: Conflict

**Q: "Tell me about a time you disagreed with a teammate."**

> **(S)** During my Razorpay internship, my mentor and I disagreed on whether to use Postgres advisory locks vs a Redis-based distributed lock for a refund-deduplication service.
>
> **(T)** I had to deliver a concrete decision within 2 days because the service was blocking another team.
>
> **(A)** I was leaning Postgres advisory locks — simpler, no extra infra. He preferred Redis Redlock — battle-tested in our existing codebase. Instead of getting into a "I'm right, you're wrong" loop, I wrote a 1-page doc with both options, listed pros-cons, and added a small benchmark — under our load (~50 RPS), advisory locks were 2x faster, but Redlock had better failover semantics in the multi-AZ scenario we were about to migrate to in 3 months. I shared the doc with him, we sat down for 20 minutes, and decided Redlock was the right call given the upcoming migration.
>
> **(R)** We shipped Redlock; service has been running 6 months without lock-related incidents. The bigger lesson: **disagreements get unblocked faster when you put them on paper**. It removes ego and forces specifics. My mentor also told me later he appreciated that I didn't just defer because he was senior.

#### STAR-3: Failure

**Q: "Tell me about a project that failed."**

> **(S)** In my third year, I tried to build a "Razorpay-for-tuitions" app — let parents pay tuition fees, teachers manage class rosters. I gave myself 6 weeks.
>
> **(T)** Goal was to get 5 paying tuition centres on the platform.
>
> **(A)** I built the app in 4 weeks — Next.js, Razorpay, Postgres. Then I reached out to ~30 tuition centres in my city. Got 3 onboarded, but in the first week 2 of them dropped off. I went deeper — turned out they didn't have payment-collection problems; they had attendance and parent-communication problems. I had built the wrong thing.
>
> **(R)** I shut it down at week 7 instead of forcing more features. Direct loss: ~₹1,500 (Razorpay verification fees). Real lesson: **I built before I talked to users**. My next project — ChaiBot — I spent the first 2 weeks just talking to 12 tea-shop owners before writing a single line of code. That one ended up with 60+ users. Failure was tuition wala project; the win was learning to talk first.

#### STAR-4: Ambiguity

**Q: "Tell me about a time you had to work without clear instructions."**

> **(S)** During my internship, on day 3, my manager dropped a one-line Slack: "Aarav, can you investigate why our settlement reports are slower this week than last?" That's all I had.
>
> **(T)** Figure out why and fix it, with no clear scope or "definition of done."
>
> **(A)** Step 1, I asked my manager 3 specific clarifying questions: "Slower on dashboard, batch-job, or both? Any specific merchant or all? When did it start?" — got partial answers, accepted ambiguity. I pulled the metrics dashboard and saw P95 query latency had jumped 3x on Monday. I bisected — checked recent deploys (none), schema changes (one — new index removed last Friday). Reproduced locally, confirmed the missing index was the cause, wrote a migration to re-add it after benchmarking the impact on writes (acceptable).
>
> **(R)** Pushed the fix Tuesday EOD; latency back to baseline by Wednesday morning. My manager's feedback: "I deliberately gave you a vague brief to see how you'd approach it — you scoped it well." I learned that **the first 30 minutes of an ambiguous task should be spent narrowing the brief, not coding**.

#### STAR-5: Learning

**Q: "Tell me about something you had to learn quickly."**

> **(S)** In my second year, I joined an inter-college hackathon where the theme was announced 30 minutes before start: "Build a tool for the visually impaired in 36 hours."
>
> **(T)** My team needed accessible audio interfaces — none of us had ever touched the Web Speech API or accessibility patterns.
>
> **(A)** I split learning + building. First 2 hours: I read the MDN docs on Web Speech API, screen-reader basics (NVDA / TalkBack), and ARIA landmarks; built a tiny prototype that took voice and read text back. Then we designed the UX: voice-first, large fonts, no colour-only signals. I owned the speech and ARIA layer; my teammates handled image OCR + text extraction. Slept 4 hours total. Tested with one visually-impaired student from a partner college on day 2 — discovered our voice prompts were too verbose; trimmed them.
>
> **(R)** We placed 2nd / 38 teams. Judges specifically called out the accessible UX. Personal takeaway: **learning to learn under deadline is a skill** — read just enough to unblock, then build, then iterate. I now use this pattern (small docs read → prototype → iterate) for every new tech I pick up.

---

## 8. Top 20 behavioural questions with example STAR answers

Categorised. Memorise the **angle** for each, not verbatim wording — interviewer can sniff over-rehearsed answers.

### Leadership / ownership

**1. "Tell me about a time you led a team."**
→ See STAR-1 above. Pick a real lead role: club head, hackathon lead, internship sub-team lead, group-project DRI.

**2. "Have you ever had to take ownership of something outside your role?"**
> Once during the SIH hackathon, our designated "presentation guy" got food poisoning the night before. I'd never demoed publicly before. I rehearsed the 3-min pitch 12 times that night, watched 2 YouTube videos on demo flow, and presented to MoA officials the next morning. We won. Lesson: ownership isn't about job title; it's about who picks up the dropped ball.

**3. "Describe a time you mentored someone."**
> During my internship, two fresher interns joined 4 weeks after me. Their first PRs had ~40% first-time-merge rate (lots of nit-pick reviews). I started doing pre-reviews — they'd ping me before opening official PRs, I'd flag obvious issues. Within 6 weeks their first-time-merge rate was 75%. The senior tech-lead later asked me to formalise this as a "buddy system" for the next batch.

### Conflict / disagreement

**4. "Tell me about a time you disagreed with a teammate."**
→ STAR-2 above.

**5. "How did you handle a conflict with a manager?"**
> My internship manager wanted me to spend a week refactoring a legacy module; I felt fixing the customer-facing bug queue was higher impact. Instead of grumbling, I asked for a 15-min sync, presented data on the bug-queue impact (3 customer escalations in 2 weeks), and proposed splitting my time 60-40. He agreed. Three weeks later he told me he liked that I pushed back **with data, not opinion**.

**6. "Tell me about a time you received tough feedback."**
> After my first PR at Razorpay, my mentor wrote: "Your code works but adds 4 layers of abstraction we don't need. We optimise for readability, not flexibility." Stung. I re-read the PR, agreed, simplified it to 1 layer. From then on, my "default" became flat code first, abstract only when 3+ call sites emerge. The feedback shifted my engineering taste permanently.

### Failure / learning

**7. "Describe a project that failed."**
→ STAR-3 above.

**8. "Tell me about a mistake you made."**
> Pushed a migration to staging on a Friday evening (red flag #1) without a rollback script (red flag #2). It locked a table for 40 minutes. Two QA engineers couldn't run their tests over the weekend. Monday morning I owned it in our standup, wrote a postmortem, and added a CI rule: no migration PR merges without an explicit `rollback.sql` file. The CI rule was adopted across the team.

**9. "What's something you'd do differently in your last project?"**
> In ChaiBot, I picked Pinecone before benchmarking pgvector. Pinecone added ₹3K/month unnecessary cost for our scale. If I redid it, I'd start with pgvector + Postgres I already had and graduate to Pinecone only at 100K+ embeddings. **Lesson: pick boring infra first, scale into fancy infra when forced.**

**10. "Tell me about a time you failed a deadline."**
> During my first hackathon, I overscoped — promised auth + payments + admin in 24 hours. Shipped only auth + a barely-working payments flow at 25th hour. We placed 7th out of 20. Lesson: **MVP scoping is a deadline skill**. Next hackathon I scoped to 1 core flow + 2 nice-to-haves, finished both, won 1st.

### Pressure / prioritisation

**11. "How do you handle pressure?"**
> Concretely: list-making + sleep-protect. During my final-sem project deadline overlapping with placement interviews, I made a 2-week board — top 3 daily tasks, capped at 8 hours of focused work, slept 7 hours minimum. I'd rather under-promise + over-deliver than burn out and produce mush. My team got the project submitted on time, I cleared 4 of 6 interviews — and didn't break.

**12. "Tell me about a time you had to prioritise multiple urgent tasks."**
> Last week of internship: production bug, demo for VP, and farewell deck — all on same Wednesday. I asked myself "what is irreversible?" Bug: customer-facing, irreversible if escalated → P0. Demo: re-schedulable but politically costly → P1. Farewell: sentiment, easy → P2. I fixed bug by 11 AM, demoed at 3 PM, fixed deck at 9 PM. **Frame: irreversibility-first, not urgency-first.**

**13. "Walk me through a difficult bug you fixed."**
> A flaky test in our CI was failing ~5% of runs but passing locally. Two weeks of "rerun the CI" later, I dug in. Reproduced locally with `--repeat 100` flag — still passed. Went in deeper: timing-related, only failed when system load was high. Turned out we had a `setTimeout(fn, 0)` race with a `Promise.resolve().then()`. Switched to `await new Promise(setImmediate)` and the flake disappeared. **Real lesson: a "flaky" test is just a bug we haven't reproduced reliably yet.**

### Communication / collaboration

**14. "Tell me about a time you had to explain something technical to a non-technical person."**
> My grandmother asked why "the internet was slow" once. Instead of "your router..." I said: "Imagine your house has one corridor, and 5 people are walking through it carrying boxes. If everyone walks at once, the corridor is jammed. That's what happens when many devices use Wi-Fi." She got it. The pattern — **map technical concept to physical analogy** — is the same one I use in design reviews now: mapping cache to a notebook in your bag, DB to a library across town.

**15. "Describe a time you had to give bad news / push back on stakeholders."**
> A senior at my hackathon team wanted to add NFT minting (this was 2022). I disagreed — added complexity, no judging value. I scheduled a 5-min chat: "I respect the idea, but our 36-hour budget is gone if we add this. Can we ship the core first and add it as Day 2 stretch?" He accepted. We shipped core, didn't get to NFT, won 2nd. **Disagree privately, commit publicly.**

### Career / motivation

**16. "Why this company?"**
→ See HR section. Specific blog post + role fit + you-fit.

**17. "Why this role?"**
> "I've been deep in backend systems work — 2 internships, 3 production-deployed side projects. The role description specifically mentions ownership of payment infrastructure, which is the exact area my Razorpay internship prepared me for. I want to do this same thing but with fewer hand-holdings — a senior IC role on a critical service is what I'm optimising my next 2 years for, and this role description maps to that 1:1."

**18. "Why are you leaving your current job?" (for ~1 yr exp)**
> Never trash. Frame positively.
> "My current role has been a great launchpad — shipped 4 services, learned Go, owned an oncall rotation. I'm now looking for a domain shift into payments, which my current company doesn't do. I want to spend the next 3-4 years going deep in fintech infra, and your platform is one of the few places building it at scale."

**19. "Where do you see yourself in 5 years?"**
→ See HR section. Aspirational + role-aligned + humble.

**20. "Do you have any questions for me?"** (Yes. Always.)

Bad: "What's the work culture like?" — generic.
Good (pick 2-3):
- "What does success look like in this role at the 6-month mark?"
- "What's the most challenging tech problem this team is tackling right now?"
- "How does the team handle on-call / production incidents?"
- "How is performance reviewed — what do top performers do that average ones don't?"
- "What's the next major roadmap item, and what's blocking it today?"

Asking thoughtful questions = signals you're evaluating them, not just begging for an offer. Confidence amplifier.

---

## 9. Salary negotiation cheatsheet

5 rules. Memorise.

### Rule 1: Never speak first.

If recruiter asks "What's your expected CTC?" — try to deflect first.

> "I'd love to hear what the budgeted range is for this role first — I know levels and locations vary. Once I have that, I can confirm if it aligns."

If they push back ("we ask candidates first"), then give a **range**, anchored on data.

### Rule 2: Use "I'm targeting ₹X-Y based on market data."

> "Based on Glassdoor / levels.fyi / AmbitionBox data for SDE-1 roles in Bangalore at companies of your stage, I'm targeting ₹22-26 LPA total comp. That's flexible — I'd love to look at the full package including base, bonus, and stock."

Anchored, specific, professional. The "based on market data" makes it not personal — it's a number, not a demand.

### Rule 3: Defer until offer in writing.

If recruiter wants "yes / no" verbally — ask for written.

> "I'm really excited about this. Can you share a written offer letter so I can review the full package — base, RSU vest schedule, joining bonus, notice period — and get back to you within 48 hours?"

Verbal offers fall through. Written offers are real. Always wait for paper.

### Rule 4: Counter once, with data.

When you have the offer in hand, counter **once**:

> "Thank you so much for the offer. I'm very excited about the role. I wanted to share — based on the offers I'm currently evaluating from [Company X / similar-stage companies] which are around ₹28 LPA for similar levels, would you be able to revisit the base by ₹2-3 LPA? I'd be very happy to sign today if we can close that gap."

Three things doing work:
1. Counter is **specific** (₹2-3 LPA, not vague).
2. Counter is **anchored** (other offers / market data).
3. Counter is **closing** ("happy to sign today").

Most recruiters have 5-15% wiggle room. Almost nobody negotiates in India because of cultural shyness. Asking once politely usually yields ₹1-3 LPA.

### Rule 5: Don't counter twice. Don't ghost.

After your one counter, accept their final response gracefully — even if it's "we can't move on base, but here's a ₹2L joining bonus." Counter-twice = recruiter pulls offer.

If you decide to decline, decline **explicitly** with a thank-you note. Burning the bridge by ghosting = bad reputation in the small Indian tech HR community.

### Indian-specific salary tips

- Total CTC ≠ in-hand. ₹20 LPA CTC ≈ ₹1.4-1.5L/month in-hand after taxes + PF. Always negotiate on **fixed base**, not "total CTC" with stock and joining bonus inflating it.
- "Joining bonus" is a one-time number. Recruiters use it to pad CTC. ₹3L joining bonus on ₹20 LPA = ₹17 LPA recurring.
- "Variable / performance bonus" — assume 50-70% of stated will hit, not 100%.
- Stock (RSU/ESOP) at private companies is illiquid. Don't count on it like cash. At public companies (Microsoft, Google IDC, Adobe), RSU is real cash.
- Notice period buyout: you can negotiate ₹50K-2L of buyout from new employer. Ask.
- **Hike percentage:** Indian market norm for product-co switches is **30-60% hike** over current. SDE-1 → SDE-2 switch can be 80-100% if the company is leveling you up.

---

## 10. Pre-interview checklist + What to learn next

### 24 hours before

- [ ] Re-read the JD. Highlight 3-5 keywords; map each to a project / experience you'll bring up.
- [ ] Re-read the company's About + Engineering blog (last 2-3 posts).
- [ ] Look up your interviewer on LinkedIn — note their team, tenure, recent post if any.
- [ ] Charge laptop, test camera + mic + internet (run a Zoom test).
- [ ] Print or open digitally: your resume + JD + 3-question cheatsheet (questions you'll ask them).
- [ ] Glass of water near you, phone on Do Not Disturb, doors closed, tell housemates.

### 1 hour before

- [ ] Mock STAR answers out loud once: tell-me-about-yourself, why-this-company, why-leaving (if applicable).
- [ ] Bathroom break.
- [ ] Light, non-greasy snack — not a heavy meal (post-meal slump is real).
- [ ] No caffeine spike right before; if you drink coffee, do it 90 min before, not 10.
- [ ] Outfit: collared shirt + decent background — even on Zoom from home.

### Right before (5 min)

- [ ] Smile in mirror. Sounds silly, works. Camera-on smile reads warmer.
- [ ] Two slow breaths.
- [ ] Open the meeting link 2 min early — buffer for tech glitches.

### After the interview

- [ ] Within 6 hours: short thank-you email (3-5 lines, not paragraph). Reference one specific thing discussed.

> Hi [Interviewer], thanks for the conversation today. I really enjoyed digging into [the on-call rotation question / the system design discussion / the Postgres question]. Looking forward to the next steps.
>
> Best,
> Aarav

Most candidates skip the thank-you note. The 5% who send one stand out. Costs you 2 minutes.

### What to learn next

- Resume + LinkedIn done? Now go deeper on the **technical** side.
  - **System Design Basics** → `system-design-basics.md`. HLD round prep — load balancers, caching, sharding. SDE-1 / SDE-2 product-co essential.
  - **LLD Design** → `lld-design.md`. Class-level design, SOLID, design patterns. Almost every Bangalore product company asks one LLD round.
  - **DBMS** → `dbms-complete.md`. SQL questions, indexing, transactions. Asked in 80% of backend interviews.
  - **Top 2 habits** for your stream:
    - GenAI: `genai-top2-habits.md`
    - Data Analyst: `da-top2-habits.md`
- Behavioural prep doesn't end here. Continue refining:
  - Record yourself answering 3 STAR questions on phone, watch back. Cringe, learn, redo.
  - Find a peer mock-interview partner. 30-min mock weekly.
  - Read 1 engineering blog from your target company / month — adds substance to your "Why this company" answer.

---

## Closing yaad rakh

Resume + LinkedIn + HR is the **lowest-skill, highest-ROI** subject in the entire EngiNerd path. There's no algorithm to grind, no system-design to whiteboard. There's only: write tighter, quantify everything, practice 5 STAR stories until they sound natural, and care enough to send a thank-you note.

Tu ne dekha nahi recruiter ko, recruiter ne tujhe nahi dekha — ek PDF aur ek 30-min Zoom call hai. **Make every word count.** 6 seconds, 1 page, 90-second self-intro, 5 STAR stories, 1 polite counter on salary. That's the whole game.

Ab apna current resume khol. Line-by-line iss doc ke against audit kar. Pehli draft ke baad ek senior se review maangle. Iterate weekly during placement season. By the time interviews aate hain, tu the rare candidate hoga jo packaging mein bhi sharp hai aur tech mein bhi.

Apna kaam shuru kar. Chai bana, baith, aur shuru.
