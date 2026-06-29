/**
 * goal-match.ts
 *
 * Pure, zero-dependency helper that maps a free-text career aspiration
 * (Hinglish + English) to one of the 24 EngiNerd roadmap slugs.
 *
 * Exports
 * -------
 *  matchGoal(input)  → { slug, title } | null
 *  VALID_SLUGS       → Set<string>   (all 24 slugs — for validation elsewhere)
 *  GOAL_PREVIEWS     → Record<string, string>  (4-6 line Hinglish blurbs per roadmap)
 */

/* ============================================================================
 * 1. Inline title map (avoids importing the large roadmaps.ts on the client).
 *    Must stay in sync with lib/mock-data/roadmaps.ts.
 * ============================================================================ */

const ROADMAP_TITLES: Readonly<Record<string, string>> = {
  "genai-developer": "GenAI Developer (Top 2% Path)",
  "senior-frontend-engineer": "Senior Frontend Engineer (React + Performance)",
  "java-full-stack": "Java Full Stack Developer",
  "cloud-devops-engineer": "Cloud / DevOps Engineer",
  "data-analyst-top2": "Data Analyst (Top 2% Path)",
  "product-company-cracker": "Product Company Cracker (Razorpay / Flipkart / Zomato)",
  "service-company-cracker": "Service Company Cracker (TCS NQT / Infosys / Wipro)",
  "tcs-nqt-cracker": "TCS NQT Cracker — Volume Play (3-9 LPA)",
  "mern-stack-developer": "MERN Stack Developer — Indian Startups (8-25 LPA)",
  "android-developer": "Android Developer (Kotlin + Compose) — 6-22 LPA",
  "ml-engineer": "ML Engineer / Data Scientist (12-50 LPA)",
  "infosys-sp-cracker": "Infosys SP / Power Programmer Cracker (8-11.25 LPA)",
  "portfolio-builder": "Portfolio Builder — Resume + Projects + Open Source",
  "data-engineer": "Data Engineer (14-65 LPA — Razorpay/Swiggy/Zomato)",
  "qa-sdet-cracker": "QA / SDET — Underrated Entry Point (6-25 LPA)",
  "off-campus-cracker": "Off-Campus Drive Cracker — For Tier-3 / No-Placement-Cell",
  "backend-engineer": "Backend Engineer — Python / Go (12-40 LPA)",
  "flutter-rn-developer": "Flutter / React Native Developer (6-22 LPA)",
  "devsecops-engineer": "DevSecOps / AppSec Engineer (18-100 LPA)",
  "service-trio-cracker": "Cognizant + Capgemini + Wipro Cracker (3.5-7.6 LPA)",
  "gate-cse-cracker": "GATE CSE Cracker — IIT MTech / PSU / PhD",
  "embedded-iot-engineer": "Embedded / IoT Engineer (6-25 LPA)",
  "game-dev-engineer": "Game Dev Engineer (Unity + Unreal) — 5-25 LPA",
  "blockchain-engineer": "Blockchain / Web3 Engineer (12-60 LPA)",
} as const;

/* ============================================================================
 * 2. Alias map: slug → list of recognized aliases (all stored lowercase).
 *    Rules for adding aliases:
 *      - Minimum 2 characters for single-word aliases.
 *      - Avoid generic words ("developer", "engineer") as standalone aliases;
 *        they must be combined with a role keyword.
 *      - Longer + more specific aliases win over shorter ones (algorithm picks
 *        the longest substring match).
 * ============================================================================ */

const SLUG_ALIASES: Readonly<Record<string, readonly string[]>> = {
  "genai-developer": [
    "genai developer",
    "gen ai developer",
    "generative ai developer",
    "generative ai engineer",
    "llm engineer",
    "llm developer",
    "genai engineer",
    "gen ai engineer",
    "llm",
    "genai",
    "gen ai",
    "generative ai",
    "large language model",
    "gpt developer",
    "rag engineer",
    "langchain",
    "foundation model",
    "multimodal",
    "fine tuning engineer",
    "ai engineer",
    "ai developer",
  ],

  "senior-frontend-engineer": [
    "senior frontend engineer",
    "frontend engineer",
    "front end engineer",
    "frontend developer",
    "front end developer",
    "react developer",
    "react engineer",
    "nextjs developer",
    "next.js developer",
    "ui developer",
    "ui engineer",
    "web developer",
    "web engineer",
    "javascript developer",
    "typescript developer",
    "js developer",
    "css developer",
    "angular developer",
    "vue developer",
    "svelte developer",
    "frontend dev",
    "front-end dev",
    "fe engineer",
    "fe developer",
    "react",
    "nextjs",
    "frontend",
    "front end",
    "front-end",
  ],

  "java-full-stack": [
    "java full stack developer",
    "java full stack engineer",
    "java full stack",
    "java fullstack",
    "java developer",
    "java engineer",
    "spring boot developer",
    "spring boot engineer",
    "spring developer",
    "java backend developer",
    "j2ee developer",
    "java",
    "spring boot",
    "spring",
  ],

  "cloud-devops-engineer": [
    "cloud devops engineer",
    "devops engineer",
    "cloud engineer",
    "platform engineer",
    "infrastructure engineer",
    "site reliability engineer",
    "sre engineer",
    "kubernetes engineer",
    "cloud architect",
    "cloud developer",
    "aws engineer",
    "gcp engineer",
    "azure engineer",
    "cicd engineer",
    "devops developer",
    "cloud devops",
    "devops",
    "cloud",
    "kubernetes",
    "k8s",
    "docker engineer",
    "aws",
    "gcp",
    "azure",
    "terraform",
    "ansible",
    "sre",
  ],

  "data-analyst-top2": [
    "data analyst",
    "business analyst",
    "analytics engineer",
    "data analytics",
    "business intelligence analyst",
    "bi analyst",
    "sql analyst",
    "product analyst",
    "marketing analyst",
    "analytics",
    "tableau developer",
    "power bi developer",
    "data insights",
    "da",
  ],

  "product-company-cracker": [
    "product company cracker",
    "product company interview",
    "product startup interview",
    "sde interview prep",
    "product interview prep",
    "system design interview",
    "lld interview",
    "sde1 prep",
    "sde 1 prep",
    "product cracker",
  ],

  "service-company-cracker": [
    "service company cracker",
    "service company prep",
    "mnc prep",
    "it company prep",
    "campus placement prep",
    "service company",
    "mass recruiter prep",
    "mnc",
  ],

  "tcs-nqt-cracker": [
    "tcs nqt cracker",
    "tcs nqt prep",
    "tcs digital",
    "tcs prime",
    "tcs ninja",
    "tcs codevita",
    "tata consultancy services",
    "tcs interview",
    "tcs nqt",
    "tcs",
    "nqt",
  ],

  "mern-stack-developer": [
    "mern stack developer",
    "mern stack engineer",
    "full stack developer",
    "full stack engineer",
    "fullstack developer",
    "fullstack engineer",
    "mean stack developer",
    "node react developer",
    "mongodb express react node",
    "full stack javascript",
    "full-stack developer",
    "full-stack engineer",
    "mern stack",
    "mern",
    "full stack",
    "fullstack",
    "full-stack",
    "mean stack",
  ],

  "android-developer": [
    "android developer",
    "android engineer",
    "android app developer",
    "kotlin developer",
    "jetpack compose developer",
    "android mobile developer",
    "android",
    "kotlin",
    "jetpack compose",
  ],

  "ml-engineer": [
    "ml engineer",
    "machine learning engineer",
    "data scientist",
    "data science engineer",
    "ml developer",
    "machine learning developer",
    "aiml engineer",
    "ai ml engineer",
    "mlops engineer",
    "nlp engineer",
    "computer vision engineer",
    "cv engineer",
    "research engineer",
    "applied scientist",
    "applied ml engineer",
    "ml scientist",
    "data science",
    "machine learning",
    "aiml",
    "ai ml",
    "mlops",
    "nlp",
    "computer vision",
    "ml",
    "ds",
  ],

  "infosys-sp-cracker": [
    "infosys sp cracker",
    "infosys power programmer",
    "infosys specialist programmer",
    "infosys sp prep",
    "infosys pp",
    "infosys sp",
    "infosys",
  ],

  "portfolio-builder": [
    "portfolio builder",
    "portfolio developer",
    "github portfolio",
    "resume projects",
    "open source contributor",
    "capstone projects",
    "personal portfolio",
    "portfolio",
    "open source",
  ],

  "data-engineer": [
    "data engineer",
    "data engineering",
    "analytics engineer",
    "pipeline engineer",
    "etl engineer",
    "big data engineer",
    "spark engineer",
    "airflow engineer",
    "warehouse engineer",
    "data pipeline engineer",
    "data warehousing engineer",
    "de",
  ],

  "qa-sdet-cracker": [
    "qa engineer",
    "sdet engineer",
    "test engineer",
    "quality assurance engineer",
    "automation test engineer",
    "qa automation engineer",
    "playwright engineer",
    "selenium engineer",
    "software tester",
    "quality engineer",
    "qa developer",
    "sdet",
    "qa",
    "testing",
    "automation testing",
    "quality assurance",
  ],

  "off-campus-cracker": [
    "off campus placement",
    "off campus job hunt",
    "no placement cell",
    "tier 3 placement",
    "off campus",
    "tier3 college",
    "off campus drive",
  ],

  "backend-engineer": [
    "backend engineer",
    "backend developer",
    "python backend engineer",
    "python backend developer",
    "golang engineer",
    "golang developer",
    "go backend engineer",
    "go backend developer",
    "fastapi developer",
    "django developer",
    "flask developer",
    "api developer",
    "api engineer",
    "server side developer",
    "rest api developer",
    "back end developer",
    "back end engineer",
    "backend dev",
    "backend",
    "back-end",
    "back end",
    "fastapi",
    "django",
    "golang",
    "python backend",
    "go backend",
  ],

  "flutter-rn-developer": [
    "flutter developer",
    "flutter engineer",
    "react native developer",
    "react native engineer",
    "cross platform mobile developer",
    "dart developer",
    "flutter react native",
    "hybrid mobile developer",
    "mobile app developer",
    "cross platform developer",
    "react native",
    "flutter",
    "dart",
    "cross-platform mobile",
    "cross platform",
    "rn",
  ],

  "devsecops-engineer": [
    "devsecops engineer",
    "application security engineer",
    "appsec engineer",
    "security engineer",
    "cybersecurity engineer",
    "appSec developer",
    "owasp engineer",
    "pen tester",
    "penetration tester",
    "secops engineer",
    "devsecops",
    "appsec",
    "app security",
    "application security",
    "cybersecurity",
    "secops",
    "pentester",
    "pen tester",
  ],

  "service-trio-cracker": [
    "cognizant genc prep",
    "capgemini prep",
    "wipro wilp prep",
    "cognizant prep",
    "cognizant genc",
    "capgemini pseudocode",
    "wipro elite",
    "service trio",
    "cognizant capgemini wipro",
    "cognizant",
    "capgemini",
    "wipro",
  ],

  "gate-cse-cracker": [
    "gate cse cracker",
    "gate cse prep",
    "gate exam prep",
    "iit mtech prep",
    "psu through gate",
    "gate preparation",
    "gate cse",
    "gate",
    "iit mtech",
    "psu gate",
  ],

  "embedded-iot-engineer": [
    "embedded systems engineer",
    "iot engineer",
    "firmware engineer",
    "embedded software engineer",
    "rtos developer",
    "microcontroller developer",
    "embedded c developer",
    "embedded developer",
    "iot developer",
    "embedded iot",
    "embedded",
    "iot",
    "firmware",
    "rtos",
    "microcontroller",
  ],

  "game-dev-engineer": [
    "game developer",
    "game engineer",
    "unity developer",
    "unreal engine developer",
    "unity engineer",
    "game programmer",
    "game development",
    "game dev",
    "unity",
    "unreal",
    "gaming",
    "game",
  ],

  "blockchain-engineer": [
    "blockchain developer",
    "blockchain engineer",
    "web3 developer",
    "web3 engineer",
    "solidity developer",
    "smart contract developer",
    "defi developer",
    "ethereum developer",
    "dapp developer",
    "crypto developer",
    "crypto engineer",
    "nft developer",
    "blockchain",
    "web3",
    "solidity",
    "ethereum",
    "defi",
    "smart contract",
    "dapp",
    "polygon developer",
  ],
} as const;

/* ============================================================================
 * 3. Derived constants (computed once at module load time).
 * ============================================================================ */

/** All 24 valid roadmap slugs — use this set to validate `goal` query params. */
export const VALID_SLUGS: ReadonlySet<string> = new Set(Object.keys(SLUG_ALIASES));

/**
 * Reverse lookup: normalized alias → slug.
 * When two aliases have the same length, the first one in SLUG_ALIASES wins
 * (predictable — insertion order is guaranteed in modern JS).
 */
const _REVERSE: Readonly<Record<string, string>> = (() => {
  const map: Record<string, string> = {};
  for (const [slug, aliases] of Object.entries(SLUG_ALIASES)) {
    for (const alias of aliases) {
      // Only set if not already claimed by a longer/earlier alias.
      if (!(alias in map)) {
        map[alias] = slug;
      }
    }
  }
  return map;
})();

/* ============================================================================
 * 4. Normalizer — strips Hinglish noise words and punctuation.
 * ============================================================================ */

// Longer phrases must appear before their sub-words so they're stripped first.
const _NOISE_RE = new RegExp(
  [
    "i want to be a",
    "i want to be an",
    "i want to be",
    "i want to become a",
    "i want to become an",
    "i want to become",
    "banna chahta hoon",
    "banna chahti hoon",
    "banna chahta",
    "banna chahti",
    "banna chahna",
    "banna chahiye",
    "ban na chahta",
    "karna chahta",
    "karna chahti",
    "i am a",
    "i am an",
    "i am",
    "become a",
    "become an",
    "become",
    "be a",
    "be an",
    "as a",
    "as an",
    "banna",
    "chahta",
    "chahti",
    "chahna",
    "hoon",
    "mein",
    "main",
    "aur",
    "\\bme\\b",
    "\\bhai\\b",
    "\\btoh\\b",
    "\\bto\\b",
    "\\bka\\b",
    "\\bki\\b",
    "\\bke\\b",
  ]
    .map((p) => p.replace(/^\\b|\\b$/g, ""))
    .map((p) => `\\b${p.replace(/\s+/g, "\\s+")}\\b`)
    .join("|"),
  "gi",
);

function _normalize(raw: string): string {
  return raw
    .toLowerCase()
    .replace(_NOISE_RE, " ")
    .replace(/[^\w\s.+#/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* ============================================================================
 * 5. matchGoal — the public API.
 * ============================================================================ */

/**
 * Maps free-text career aspiration to the best-fit EngiNerd roadmap.
 *
 * @param input - Raw user text (Hinglish or English), e.g. "ML engineer banna chahta hoon"
 * @returns `{ slug, title }` when a roadmap matches, `null` for unrecognized / garbage input.
 *
 * Algorithm (in order):
 *   1. Normalize (lowercase + strip Hinglish noise).
 *   2. Exact alias match.
 *   3. Substring scan — find the longest alias that appears anywhere in the normalized text.
 *   4. Token scan — split into words, test each against single-word aliases.
 *   5. null if nothing matched.
 *
 * Leniency: any recognized role word matches. Strictness: pure gibberish with
 * no recognized token returns null.
 */
export function matchGoal(input: string): { slug: string; title: string } | null {
  if (!input || typeof input !== "string") return null;

  const normalized = _normalize(input);
  if (!normalized) return null;

  // 1. Exact alias match (fastest path).
  const exactSlug = _REVERSE[normalized];
  if (exactSlug) {
    return _result(exactSlug);
  }

  // 2. Substring scan — longest alias wins (prevents "go" matching "golang engineer").
  let bestSlug: string | null = null;
  let bestLen = 0;

  for (const [alias, slug] of Object.entries(_REVERSE)) {
    if (alias.length > bestLen && normalized.includes(alias)) {
      bestSlug = slug;
      bestLen = alias.length;
    }
  }

  if (bestSlug) return _result(bestSlug);

  // 3. Token scan — for single words that weren't caught by step 2.
  const tokens = normalized.split(/\s+/).filter((t) => t.length >= 2);
  for (const token of tokens) {
    const tokenSlug = _REVERSE[token];
    if (tokenSlug) return _result(tokenSlug);
  }

  return null;
}

function _result(slug: string): { slug: string; title: string } | null {
  const title = ROADMAP_TITLES[slug];
  if (!title) return null; // safety guard — slug must be in the title map
  return { slug, title };
}

/* ============================================================================
 * 6. GOAL_PREVIEWS — short Hinglish blurbs (4-6 lines) for each roadmap.
 *    Used by the hero form to stream a roadmap-specific first-lesson preview.
 *    Keep each blurb under ~350 chars.
 * ============================================================================ */

export const GOAL_PREVIEWS: Readonly<Record<string, string>> = {
  "genai-developer": `Dekh bhai — seedha bolta hoon.

GenAI engineer banna hai? Toh pehle samajh: LLMs ko "use" karna alag baat hai, aur unhe "build + fine-tune + ship" karna alag. Woh doosri baat hai jo ₹32 LPA fresher offer deti hai.

Hum start karenge math foundations se — linear algebra, probability — jo transformers ke andar ki mechanics samjhne deta hai. Phir RAG, agentic loops, LoRA fine-tuning. Har step pe real code.`,

  "senior-frontend-engineer": `Frontend matlab sirf React nahi — woh toh entry ticket hai.

Asli edge hai: Core Web Vitals (LCP, INP, CLS) samajhna, accessibility jo screen reader pe bhi chalti ho, aur performance budget jispe senior engineer bhi thumbs-up de.

Hum start karenge HTML ke real semantics se. Jab tujhe pata chalega ki <button> aur <div onClick> mein kyun fark hai — tab asli game shuru hota hai.

Salary: ₹12–24 LPA fresher at product cos.`,

  "java-full-stack": `Java ek boring choice lagti hai — isliye hi 70% Indian product companies isko use karti hain.

Spring Boot backend + React frontend = the most consistently hired combo at Amazon, Flipkart, Atlassian, Razorpay. Safe bet with the highest salary floor.

Pehla lesson: Core Java internals — OOP nahi, asli internals. Collections, concurrency, JVM. Wahan se Spring Boot ka journey simple ho jaata hai.

Salary: ₹14–26 LPA fresher at product cos.`,

  "cloud-devops-engineer": `"Mera code toh chal raha tha local pe" — yeh sentence engineers ki career rok deta hai.

DevOps engineer woh hai jo production alive rakhta hai. Docker → Kubernetes → CI/CD → monitoring. Phir jab 3 baje production down ho, tum woh banda ho jisko pata hai kya karna hai.

Pehla lesson: Docker fundamentals — containers, images, networking, volumes. Hands-on se shuru.

Salary: ₹13–25 LPA fresher, ₹30–65 LPA at 2–5 years.`,

  "data-analyst-top2": `"Dashboard banana aata hai" aur "business decision drive karna aata hai" — dono alag cheezein hain.

Top 2% analysts SQL window functions se raw data ko cohort funnels mein convert karte hain, A/B tests run karte hain, aur ₹-quantified recommendations dete hain.

Pehla lesson: SQL + business fundamentals — COUNT(*) se window functions tak seedha rasta.

Salary: ₹8–18 LPA fresher, ₹22–55 LPA at 2–5 years at product cos.`,

  "product-company-cracker": `Razorpay, Flipkart, Swiggy — yeh companies ek hi format mein interviews leti hain: DSA + LLD + HLD + behavioural.

Problem yeh hai ki zyaadatar engineers sirf DSA practice karte hain aur LLD pe fail ho jaate hain. Yeh roadmap LLD ko front-load karta hai.

Pehla lesson: SQL fundamentals aur indexes — kyunki har LLD round mein DB design poochhi jaati hai.

Target salary: ₹8–25 LPA SDE-1 at Indian product startups.`,

  "service-company-cracker": `TCS, Infosys, Wipro — yeh companies 1M+ engineers hire karti hain per year. Aur 60% fail karte hain aptitude round mein, coding mein nahi.

Is roadmap mein hum pehle aptitude (Quant + Logical + Verbal) front-load karte hain — yahi gate hai jahan zyaadatar students rok diye jaate hain.

Pehla lesson: Quantitative aptitude — ratio, time-speed-distance, percentage. Yahan se shuru.

Salary: ₹3–7 LPA, upgrade path to product cos available baad mein.`,

  "tcs-nqt-cracker": `1 million+ aspirants per year. TCS NQT single biggest engineering placement gateway hai India mein.

Score thresholds: Ninja (3.36 LPA) → Digital (7 LPA) → Prime (9 LPA) → CodeVita. Deterministic hai — sahi prep karo, sahi band milega.

Pehla lesson: TCS NQT structure — Foundation vs Advanced section, time allocation, question types. Strategy pehle, grind baad mein.

Target: 60-day prep, daily 3 hours. Achievable hai.`,

  "mern-stack-developer": `MERN = MongoDB + Express + React + Node. India ke product startups ka #1 hired stack.

JS ek language — frontend aur backend dono. Razorpay, Zomato, Swiggy, Cred — sabke JDs mein hai. Faster ramp than Java + Python combos.

Pehla lesson: JavaScript fundamentals deep — closures, promises, async/await, event loop. Bina yeh samjhe React chalega lekin senior SDE nahi banoge.

Salary: ₹8–25 LPA SDE-1 at Indian product startups.`,

  "android-developer": `India ka 78% smartphone market Android hai. Swiggy, Zomato, PhonePe, Paytm — yeh companies continuously Android engineers hire karti hain.

2026 mein XML layouts mat batao. Interview mein Jetpack Compose, ViewModel + StateFlow, Hilt, Coroutines poochha jaata hai.

Pehla lesson: Kotlin essentials — null safety, coroutines basics, data classes. Kotlin samjhe bina Compose ka koi fayda nahi.

Salary: ₹6–22 LPA, consistent demand at consumer product cos.`,

  "ml-engineer": `ML engineer = model train karo, productionise karo, business ko value do.

Data Analyst se alag (woh analysis karta hai), GenAI engineer se alag (woh LLMs use karta hai). MLE ka kaam: Razorpay risk model, Swiggy ETA prediction, CRED fraud detection.

Pehla lesson: Python + Pandas — data loading, cleaning, feature engineering. Yahan se sab shuru hota hai.

Salary: ₹12–25 LPA fresher, ₹25–50 LPA at 2–4 years.`,

  "infosys-sp-cracker": `Infosys SP (Special Programmer) aur PP (Power Programmer) — regular SE (₹3.5 LPA) se 2-3× salary.

Zyaadatar students SP test mein pseudocode round pe fail ho jaate hain — sirf aptitude practice karte hain aur wahan chuuk jaate hain.

Pehla lesson: Aptitude triplet (Quant, Logical, Verbal). TCS NQT ke saath 80% overlap — dono simultaneously prepare kar sakte ho.

Target: ₹8 LPA (SP) → ₹11.25 LPA (PP) at Infosys.`,

  "portfolio-builder": `Recruiter GitHub se pehle open karta hai, resume baad mein.

20 portfolio-grade capstone projects — MERN, backend, mobile, ML, DevOps — har ek ke saath stack, build outline, aur resume-ready bullet.

Pehla lesson: GitHub portfolio polish — README game, pinned repos, contribution graph, live deployment link. 2 ghante ka kaam recruiter ka attention 6 seconds se zyaada pakad leta hai.`,

  "data-engineer": `Data Engineer = woh banda jo data pipelines banata hai taaki analysts aur ML engineers kaam kar sakein.

2026 mein every Indian product co (Razorpay, Swiggy, Zomato) ka dedicated DE org hai, alag Data Analyst team se. SQL → Spark → Kafka → dbt — yeh poora stack seekhna hai.

Pehla lesson: SQL deep + warehousing concepts — star schema, SCD, window functions. DE ki foundation yahan hai.

Salary: ₹14–30 LPA fresher, ₹35–65 LPA at 3–5 years.`,

  "qa-sdet-cracker": `QA/SDET is the most underrated entry into Indian tech.

Lower interview bar than SDE, but Razorpay/Postman ke explicit SDET → SDE upgrade ladders documented hain. 2-year pivot path real hai.

Pehla lesson: Manual QA fundamentals — test cases, bug lifecycle, test plan. Boring lagta hai, lekin automation yahan se samajh aata hai.

Salary: ₹6–15 LPA fresher SDET, ₹12–25 LPA at 2 years.`,

  "off-campus-cracker": `Tier-3 college ke 40% Indian product co hires off-campus hote hain. LinkedIn, Naukri, referrals — agar yeh playbook nahi pata, toh ₹3 LPA service company hi milegi.

5 model DMs jo recruiter ka reply karaate hain. ATS keyword strategy. FAANG India intern programs (Google STEP, Amazon WoW, MS Engage) — jo zyaadatar students miss kar dete hain.

Pehla lesson: Off-campus playbook — LinkedIn profile setup, outreach timing, referral plays.`,

  "backend-engineer": `Python (FastAPI) aur Go (gin/fiber) — yeh woh backend stacks hain jo MERN shops nahi hain.

Razorpay ka payments-core Go mein hai. Swiggy ka delivery engine Python services pe. Atlan Go microservices run karta hai. Yeh sab careers hai.

Pehla lesson: Python FastAPI — typed APIs, Pydantic validation, auto-OpenAPI. Ek din mein production-grade API banao.

Salary: ₹12–40 LPA. Go roles + ₹10-15% premium over Python at Razorpay/Atlan.`,

  "flutter-rn-developer": `Flutter ya React Native — dono cross-platform mobile stacks jo Indian startups prefer karti hain.

PhonePe, Paytm, Flipkart Lite = Flutter. Swiggy = React Native. Ek engineer, dono platforms. Native Android/iOS hire karna costly hota hai — isliye cross-platform demand consistent hai.

Pehla lesson: Flutter + Dart basics — widgets, state, the Widget tree. Pehle 2 ghante mein first app ship.

Salary: ₹6–22 LPA, consistent demand at consumer product cos.`,

  "devsecops-engineer": `Highest-paying + lowest-supply track in Indian tech 2026 mein.

Razorpay, Cred, Zerodha, HDFC Tech — dedicated AppSec engineers at ₹18–50 LPA fresher. Demand-supply ratio 10:1. Skill bar real hai lekin compounding effect bhi real hai.

Pehla lesson: OWASP Top 10 — SQL injection se SSRF tak, real code examples ke saath. Yeh woh vocabulary hai jo AppSec interview mein sabse pehle aata hai.

Salary: ₹18–50 LPA fresher, ₹35–100 LPA mid-career.`,

  "service-trio-cracker": `Cognizant GenC (300k), Capgemini Pseudocode (200k), Wipro WILP (200k) — combined 700k engineering hires per year.

Aptitude prep TCS NQT se 80% overlap karta hai. Plus Capgemini ka unique game-based psychometric round (Pymetrics-style) — yahan zyaadatar candidates chuuk jaate hain.

Pehla lesson: Aptitude triplet (Quant, Logical, Verbal). Ek baar padho, teen tests ke liye ready.`,

  "gate-cse-cracker": `GATE CSE = multi-path exam. Top 100 → IIT MTech. Top 1000 → PSU jobs. Side effect: 80% product company interview prep already done.

DBMS/OS/CN/COA/Algorithms/Compiler/TOC — yeh subject list lagbhag wahi hai jo Razorpay/Goldman Sachs mein poochhi jaati hai.

Pehla lesson: GATE subject weightage map — kahan se kitne marks aate hain. Strategy pehle, grind baad mein.

PSU salary: ₹6–12 LPA + government benefits.`,

  "embedded-iot-engineer": `Indian hardware-startup wave: Ola Electric, Ather, Mahindra, Boat — 5000+ embedded engineers per year.

Chip companies: Qualcomm India 15–25 LPA fresher, NXP/TI/Intel India 12–20 LPA. Plus GATE se BHEL/BEL/DRDO/ISRO ka government path.

Pehla lesson: C for embedded — memory layout, hardware registers, volatile keyword. Sab yahan se start hota hai.

Salary: ₹6–25 LPA, career shelf 10+ years.`,

  "game-dev-engineer": `Indian game industry: Krafton (BGMI) 15–25 LPA fresher, MPL/Junglee 6–13 LPA, Nazara 5–10 LPA.

Unity dominates mobile + casual. Unreal for AAA + console. Niche matlab low competition — fewer applicants per role at premium studios.

Pehla lesson: Unity basics — GameObjects, MonoBehaviour, the GameObject hierarchy. Seedha hands-on, pehle 2 ghante mein first 2D game.`,

  "blockchain-engineer": `Indian Web3: Polygon (Indian unicorn, ZK rollups), CoinDCX, Nazara Web3. Market volatile hai — lekin skills portable hain.

Smart contract security expertise globally valued hai. Ethereum + Solidity + Hardhat/Foundry — yeh 2026 ka winning combo hai.

Pehla lesson: Ethereum + EVM internals — accounts, transactions, gas, bytecode. Yahan se Solidity ka foundation banta hai.

Salary: ₹12–30 LPA fresher, ₹25–60 LPA mid-career.`,
} as const;
