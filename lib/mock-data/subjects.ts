import type { Subject, Topic } from "./types";

/**
 * Compact helper — build a Topic from a slug, title, and a list of subtopic
 * spec tuples. Hinglish content for every subject lives at
 * `content/<subject-slug>.md` and is fetched/rendered by
 * `SubjectMarkdownReader` — this file is purely the navigation tree.
 *
 * Phase 9 migrated the legacy inline `content:` blocks (Java, Spring,
 * Microservices subjects) into Markdown, dropping ~10K LOC from the
 * client bundle.
 */
function topic(
  slug: string,
  title: string,
  subs: Array<[string, string, number?]>,
): Topic {
  return {
    slug,
    title,
    subtopics: subs.map(([s, t, mins]) => ({
      slug: s,
      title: t,
      estMinutes: mins ?? 18,
      status: "not_started" as const,
    })),
  };
}

export const SUBJECTS: Subject[] = [
  // =====================================================================
  // RETAINED — Java + Spring + Microservices (have rich inline Hinglish content)
  // =====================================================================
  {
    slug: "java-fundamentals",
    title: "Core Java",
    description:
      "Java ki neev — variables, OOP, collections, streams, sab kuch deeply with Hinglish content.",
    category: "Backend",
    difficulty: "Beginner",
    estHours: 32,
    topicsCount: 7,
    progressPct: 0,
    hasPractice: true,
    iconAccent: "from-orange-500 to-red-500",
    roadmapSlugs: ["java-full-stack"],
    topics: [
      topic("data-types", "Data Types", [
        ["primitive-types", "Primitive types", 18],
        ["non-primitive-types", "Non-primitive (reference) types", 20],
        ["type-casting", "Type casting (implicit & explicit)", 16],
      ]),
      topic("variables-scope", "Variables & Scope", [
        ["variables-and-scope", "Variables, scope & lifetime", 18],
      ]),
      topic("operators", "Operators", [
        ["arithmetic-relational", "Arithmetic & relational", 16],
        ["logical-bitwise", "Logical & bitwise", 18],
      ]),
      topic("control-flow", "Control Flow", [
        ["if-else", "if / else / nested if", 16],
        ["switch-case", "switch case", 16],
        ["loops", "Loops & break/continue", 18],
      ]),
      topic("arrays-strings", "Arrays & Strings", [
        ["arrays", "Arrays — declaration, traversal, multi-dim", 20],
        ["strings", "String methods & immutability", 22],
        ["stringbuilder-buffer", "StringBuilder vs StringBuffer", 16],
      ]),
      topic("oop-concepts", "OOP Concepts", [
        ["class-object", "Class, object, constructors", 20],
        ["inheritance", "Inheritance — single, multilevel, hierarchical", 22],
        ["polymorphism", "Polymorphism — overload vs override", 20],
        ["abstraction", "Abstraction — abstract class & interface", 22],
        ["encapsulation", "Encapsulation & access modifiers", 18],
      ]),
      topic("advanced-java", "Advanced Java", [
        ["wrapper-classes", "Wrapper classes & autoboxing", 16],
        ["collections-framework", "Collections — List, Set, Map, Queue", 26],
        ["exception-handling-core", "Exception handling", 20],
        ["multithreading", "Multithreading & concurrency", 26],
        ["java-8-features", "Java 8+ — Lambda, Streams, Optional", 24],
      ]),
    ],
  },
  {
    slug: "spring-boot-basics",
    title: "Spring Framework + Spring Boot",
    description:
      "Spring foundation (IoC, DI, Beans, Context) + production-grade Spring Boot — REST APIs, JPA, transactions, security.",
    category: "Backend",
    difficulty: "Intermediate",
    estHours: 36,
    topicsCount: 12,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-emerald-500 to-cyan-500",
    roadmapSlugs: ["java-full-stack"],
    topics: [
      topic("spring-core-foundation", "Spring Core foundation", [
        ["spring-ioc-di", "IoC & Dependency Injection", 22],
        ["spring-beans", "Spring Beans — lifecycle & scopes", 22],
        ["spring-context", "ApplicationContext", 24],
      ]),
      topic("spring-boot-fundamentals", "Spring Boot fundamentals", [
        ["auto-configuration", "Auto-configuration", 14],
        ["starters-and-deps", "Starters & dependencies", 12],
        ["application-properties", "Application properties", 16],
        ["spring-profiles", "Profiles (dev, staging, prod)", 18],
      ]),
      topic("rest-fundamentals", "Building REST APIs", [
        ["http-methods", "HTTP methods (GET/POST/PUT/PATCH/DELETE)", 18],
        ["http-status-codes", "HTTP status codes", 16],
        ["rest-controllers", "REST controllers", 18],
        ["request-mapping", "Request mapping", 14],
        ["rest-validation", "Validation (@Valid, custom validators)", 18],
        ["exception-handling", "Exception handling", 16],
        ["rest-pagination", "Pagination & sorting", 18],
      ]),
      topic("data-persistence", "Data persistence with JPA", [
        ["jpa-entities", "JPA entities", 18],
        ["repository-pattern", "Repository pattern", 16],
        ["transactions", "Transactions", 20],
      ]),
    ],
  },
  {
    slug: "microservices",
    title: "Microservices",
    description:
      "Monolith se microservices tak — DDD, bounded contexts, communication, resilience, Saga, observability, deployment. Production-grade patterns.",
    category: "Backend",
    difficulty: "Advanced",
    estHours: 40,
    topicsCount: 5,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-indigo-500 to-purple-500",
    roadmapSlugs: ["java-full-stack"],
    topics: [
      topic("core-concepts", "Core concepts & decomposition", [
        ["microservices-vs-monolith", "Microservices vs Monolith", 22],
        ["service-decomposition", "Service decomposition strategies", 24],
        ["ddd-basics", "Domain-Driven Design basics", 26],
        ["bounded-context", "Bounded contexts", 24],
        ["srp-per-service", "Single Responsibility per service", 22],
      ]),
    ],
  },

  // =====================================================================
  // FRONTEND (12)
  // =====================================================================
  {
    slug: "html-fundamentals",
    title: "HTML (Complete)",
    description:
      "Document structure, semantic tags, forms, media, accessibility, SEO basics — HTML ka pura foundation.",
    category: "Frontend",
    difficulty: "Beginner",
    estHours: 16,
    topicsCount: 11,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-orange-500 to-amber-500",
    roadmapSlugs: ["senior-frontend-engineer"],
    topics: [
      topic("structure", "Document structure", [
        ["doctype-head-body", "doctype, head, body", 16],
      ]),
      topic("semantic-tags", "Semantic tags", [
        ["semantic-elements", "header, nav, section, article, aside, footer, main", 18],
      ]),
      topic("text-inline", "Text & inline elements", [
        ["text-elements", "Text & inline tags (p, span, em, strong, etc.)", 16],
      ]),
      topic("links-navigation", "Links & navigation", [
        ["anchor-tags", "Anchor tags, target, rel", 16],
        ["nav-patterns", "Internal vs external navigation", 14],
      ]),
      topic("media", "Media", [
        ["images", "img, alt, srcset, picture, lazy loading", 18],
        ["audio-video", "audio, video, sources, captions", 16],
      ]),
      topic("lists-tables", "Lists & tables", [
        ["lists", "ul, ol, dl semantics", 14],
        ["tables", "table, thead, tbody, scope, caption", 18],
      ]),
      topic("forms", "Forms", [
        ["input-types", "Input types (text, email, number, date, file, etc.)", 22],
        ["form-validation", "Validation (required, pattern, min/max, custom)", 20],
        ["labels-accessibility", "Labels, fieldset, legend, accessibility", 18],
        ["form-submission", "Form submission (GET vs POST, multipart)", 18],
      ]),
      topic("seo-basics", "SEO basics", [
        ["meta-tags", "meta tags, title, description, canonical, OG tags", 18],
      ]),
      topic("aria-accessibility", "Accessibility (ARIA)", [
        ["aria-roles-attrs", "ARIA roles, aria-label, aria-live, focus", 22],
      ]),
      topic("canvas-svg", "Canvas & SVG", [
        ["canvas-basics", "Canvas 2D drawing", 20],
        ["svg-basics", "SVG primitives, when to use which", 18],
      ]),
      topic("iframes", "Iframes", [
        ["iframe-sandbox", "iframe, sandbox, postMessage, security", 16],
      ]),
    ],
  },
  {
    slug: "css-fundamentals",
    title: "CSS (Complete)",
    description:
      "Selectors, box model, layout (flex/grid), responsive design, animations, BEM, SASS — CSS deeply.",
    category: "Frontend",
    difficulty: "Beginner",
    estHours: 14,
    topicsCount: 6,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-cyan-500 to-emerald-500",
    roadmapSlugs: ["senior-frontend-engineer"],
    topics: [
      topic("selectors-specificity", "Selectors & specificity", [
        ["selector-types", "Type, class, id, attribute, pseudo selectors", 18],
        ["specificity", "Specificity calculation, cascade, !important", 18],
      ]),
      topic("box-model", "Box model", [
        ["box-model-basics", "Content, padding, border, margin, box-sizing", 18],
      ]),
      topic("units", "Units", [
        ["css-units", "px, rem, em, %, vh, vw, ch, fr — when to use which", 18],
      ]),
      topic("layout", "Layout", [
        ["display-types", "Display types (block, inline, inline-block, none)", 16],
        ["positioning", "Position (static, relative, absolute, fixed, sticky)", 18],
        ["flexbox", "Flexbox — axis, justify, align, gap", 22],
        ["grid", "CSS Grid — template, areas, auto-fit, minmax", 22],
      ]),
      topic("responsive", "Responsive design", [
        ["media-queries", "Media queries, breakpoints", 16],
        ["mobile-first", "Mobile-first vs desktop-first", 14],
      ]),
      topic("css-advanced", "Advanced", [
        ["animations-transitions", "Animations & transitions, timing functions", 20],
        ["transform", "Transform — translate, rotate, scale, 3D", 18],
        ["css-variables", "CSS variables (custom properties)", 16],
        ["bem", "BEM methodology", 14],
        ["sass-scss", "SASS/SCSS basics — variables, mixins, nesting", 20],
      ]),
    ],
  },
  {
    slug: "javascript-deep",
    title: "JavaScript (Deep)",
    description:
      "Closures, event loop, async/await, modules, browser APIs — JS engine ke andar tak.",
    category: "Frontend",
    difficulty: "Intermediate",
    estHours: 24,
    topicsCount: 6,
    progressPct: 0,
    hasPractice: true,
    iconAccent: "from-amber-500 to-orange-500",
    roadmapSlugs: ["senior-frontend-engineer", "java-full-stack"],
    topics: [
      topic("js-basics", "Basics", [
        ["variables-data-types", "Variables (var/let/const), data types, coercion", 18],
        ["operators-control-flow", "Operators, control flow", 16],
        ["functions", "Functions (declarations, expressions, arrow, HOF)", 22],
      ]),
      topic("js-core-concepts", "Core concepts", [
        ["execution-context", "Execution context", 20],
        ["call-stack", "Call stack", 16],
        ["hoisting", "Hoisting (var/function/let/const)", 18],
        ["closures", "Closures (deep)", 24],
        ["scope", "Scope (lexical, block, function, module)", 18],
        ["this-keyword", "`this` keyword (implicit, explicit, default, arrow)", 22],
      ]),
      topic("objects-arrays", "Objects & arrays", [
        ["destructuring", "Destructuring patterns", 16],
        ["spread-rest", "Spread / rest", 14],
        ["array-methods", "Array methods (map, filter, reduce, flat, etc.)", 22],
      ]),
      topic("async-js", "Async JS", [
        ["event-loop", "Event loop (microtask vs macrotask)", 24],
        ["promises", "Promises (states, chaining, all/race/any)", 22],
        ["async-await", "async / await + error handling", 22],
      ]),
      topic("browser-apis", "Browser APIs", [
        ["dom-manipulation", "DOM manipulation", 20],
        ["events-delegation", "Events & delegation", 18],
        ["fetch-ajax", "Fetch API / AJAX", 18],
        ["storage", "localStorage, sessionStorage, IndexedDB intro", 18],
        ["cookies", "Cookies — flags, domains, security", 16],
      ]),
      topic("modules-tooling", "Module system & tooling", [
        ["es-modules", "ES Modules (import/export)", 16],
        ["npm-yarn", "NPM/Yarn — package.json, lockfile, scripts", 16],
        ["bundlers", "Bundlers (Webpack vs Vite — concepts)", 18],
        ["env-vars", "Environment variables", 14],
      ]),
    ],
  },
  {
    slug: "react-complete",
    title: "React (Complete)",
    description:
      "Components, hooks, state management, routing, performance — React ka pura mental model.",
    category: "Frontend",
    difficulty: "Intermediate",
    estHours: 22,
    topicsCount: 6,
    progressPct: 0,
    hasPractice: true,
    iconAccent: "from-cyan-500 to-violet-500",
    roadmapSlugs: ["senior-frontend-engineer", "java-full-stack"],
    topics: [
      topic("react-components", "Components", [
        ["functional-class", "Functional vs class components, JSX", 20],
      ]),
      topic("react-props-state", "Props & state", [
        ["props-state-basics", "Props, state, lifting state up", 20],
      ]),
      topic("react-hooks", "Hooks", [
        ["usestate", "useState", 18],
        ["useeffect", "useEffect — deps & cleanup", 22],
        ["usecontext", "useContext", 18],
        ["useref", "useRef", 16],
        ["usememo", "useMemo", 18],
        ["usecallback", "useCallback", 18],
      ]),
      topic("react-routing", "Routing", [
        ["dynamic-routing", "Dynamic routing, nested routes", 20],
      ]),
      topic("state-management", "State management", [
        ["context-api", "Context API — when enough", 18],
        ["redux-store", "Redux — store, reducers, actions, RTK", 24],
      ]),
      topic("react-advanced", "Advanced", [
        ["custom-hooks", "Custom hooks", 20],
        ["error-boundaries", "Error boundaries", 18],
        ["code-splitting", "Code splitting (React.lazy + Suspense)", 18],
        ["lazy-loading", "Lazy loading", 16],
        ["performance-opt", "Performance optimization (memo, profiler)", 22],
      ]),
    ],
  },
  {
    slug: "nextjs-modern",
    title: "Next.js (Modern, App Router)",
    description:
      "SSR/SSG/ISR, server components, route handlers, SEO — modern Next.js production patterns.",
    category: "Frontend",
    difficulty: "Intermediate",
    estHours: 12,
    topicsCount: 3,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-pink-500",
    roadmapSlugs: ["senior-frontend-engineer"],
    topics: [
      topic("rendering-modes", "Rendering modes", [
        ["ssr", "SSR — server-side rendering", 20],
        ["ssg", "SSG — static generation", 18],
        ["isr-rsc", "ISR + RSC vs Client components", 22],
      ]),
      topic("api-routes", "API routes", [
        ["route-handlers", "Route handlers, dynamic segments, middleware", 22],
      ]),
      topic("seo-optimization", "SEO optimization", [
        ["seo-metadata", "metadata API, sitemap, robots, OG", 18],
      ]),
    ],
  },
  {
    slug: "frontend-api-integration",
    title: "API Integration",
    description: "REST, HTTP semantics, auth, error handling, Axios vs Fetch.",
    category: "Frontend",
    difficulty: "Intermediate",
    estHours: 8,
    topicsCount: 5,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-cyan-500 to-blue-500",
    roadmapSlugs: ["senior-frontend-engineer"],
    topics: [
      topic("rest-apis", "REST APIs", [["rest-basics", "Resources, idempotency, status codes", 20]]),
      topic("http-methods", "HTTP methods", [["http-verbs", "GET, POST, PUT, PATCH, DELETE", 18]]),
      topic("headers-auth", "Headers & auth", [["auth-cors", "Common headers, Bearer, CORS, cookies", 22]]),
      topic("error-handling", "Error handling", [["retries-backoff", "Network errors, retries, timeouts, backoff", 20]]),
      topic("axios-vs-fetch", "Axios vs Fetch", [["axios-fetch-compare", "When to use which, interceptors", 18]]),
    ],
  },
  {
    slug: "frontend-testing",
    title: "Frontend Testing",
    description: "Unit, component, snapshot — Jest + React Testing Library philosophy.",
    category: "Frontend",
    difficulty: "Intermediate",
    estHours: 8,
    topicsCount: 4,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-rose-500 to-orange-500",
    roadmapSlugs: ["senior-frontend-engineer"],
    topics: [
      topic("unit-testing", "Unit testing", [["unit-test-basics", "Pure functions, mocking", 20]]),
      topic("component-testing", "Component testing", [["rtl-philosophy", "RTL philosophy — test behavior, not implementation", 22]]),
      topic("snapshot-testing", "Snapshot testing", [["snapshots", "When useful, when dangerous", 16]]),
      topic("testing-tools", "Tools", [
        ["jest", "Jest", 16],
        ["react-testing-library", "React Testing Library", 18],
      ]),
    ],
  },
  {
    slug: "frontend-security",
    title: "Frontend Security",
    description: "XSS, CSRF, secure storage, CSP — frontend ko surakshit kaise rakhe.",
    category: "Frontend",
    difficulty: "Intermediate",
    estHours: 8,
    topicsCount: 4,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-rose-500 to-orange-500",
    roadmapSlugs: ["senior-frontend-engineer"],
    topics: [
      topic("xss", "XSS prevention", [["xss-types", "Reflected, stored, DOM XSS; sanitization", 22]]),
      topic("csrf", "CSRF basics", [["csrf-protection", "SameSite cookies, CSRF tokens", 18]]),
      topic("secure-storage", "Secure storage", [["storage-tradeoffs", "localStorage vs httpOnly cookies", 18]]),
      topic("csp", "Content Security Policy", [["csp-directives", "Directives, nonces, hashes", 20]]),
    ],
  },
  {
    slug: "frontend-performance",
    title: "Frontend Performance",
    description: "Code splitting, lazy loading, memoization, image optimization — Core Web Vitals.",
    category: "Frontend",
    difficulty: "Advanced",
    estHours: 10,
    topicsCount: 4,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-amber-500 to-orange-500",
    roadmapSlugs: ["senior-frontend-engineer"],
    topics: [
      topic("code-splitting", "Code splitting", [["route-component-split", "Route-based, component-based", 20]]),
      topic("lazy-loading", "Lazy loading", [["lazy-images-components", "Images, components, data", 18]]),
      topic("memoization", "Memoization", [["memo-actual-benefit", "React.memo, useMemo, useCallback — actual benefit", 22]]),
      topic("image-optimization", "Image optimization", [["image-formats-cdn", "srcset, picture, AVIF/WebP, CDN", 20]]),
    ],
  },
  {
    slug: "accessibility-seo",
    title: "Accessibility & SEO",
    description: "ARIA, keyboard nav, Lighthouse, structured data — sab users tak pahunche.",
    category: "Frontend",
    difficulty: "Intermediate",
    estHours: 8,
    topicsCount: 4,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-emerald-500 to-cyan-500",
    roadmapSlugs: ["senior-frontend-engineer"],
    topics: [
      topic("aria-roles", "ARIA roles", [["aria-landmark-widget", "Landmark, widget, document structure", 22]]),
      topic("keyboard-nav", "Keyboard navigation", [["tabindex-focus-trap", "tabindex, focus trap, skip links", 20]]),
      topic("lighthouse", "Lighthouse", [["audits-scoring", "Audits, scoring, fixing", 20]]),
      topic("structured-data", "Structured data", [["jsonld-schema", "JSON-LD, schema.org", 18]]),
    ],
  },
  {
    slug: "pwa-fundamentals",
    title: "Progressive Web Apps",
    description: "Service workers, caching strategies, offline support, web manifest.",
    category: "Frontend",
    difficulty: "Intermediate",
    estHours: 8,
    topicsCount: 4,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-cyan-500",
    roadmapSlugs: ["senior-frontend-engineer"],
    topics: [
      topic("service-workers", "Service workers", [["sw-lifecycle", "Lifecycle, registration, scope", 24]]),
      topic("caching", "Caching", [["cache-strategies", "Cache API, network-first, cache-first, SWR", 24]]),
      topic("offline-support", "Offline support", [["offline-pages-sync", "Offline pages, background sync", 20]]),
      topic("web-manifest", "Web manifest", [["manifest-icons", "Icons, display modes, install prompt", 16]]),
    ],
  },
  {
    slug: "frontend-deployment",
    title: "Frontend Deployment",
    description: "Build process, static hosting, environment configs.",
    category: "Frontend",
    difficulty: "Beginner",
    estHours: 6,
    topicsCount: 3,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-cyan-500 to-blue-500",
    roadmapSlugs: ["senior-frontend-engineer"],
    topics: [
      topic("build-process", "Build process", [["bundling-minify", "Bundling, minification, tree-shaking", 20]]),
      topic("static-hosting", "Static hosting", [["vercel-netlify-s3", "Vercel, Netlify, S3+CloudFront", 18]]),
      topic("env-configs", "Environment configs", [["build-runtime-vars", "Build-time vs runtime vars, secrets", 18]]),
    ],
  },

  // =====================================================================
  // DATABASE (2)
  // =====================================================================
  {
    slug: "database-sql",
    title: "SQL (Deep)",
    description: "CRUD, joins, indexing, transactions, advanced SQL, database design — SQL mastery.",
    category: "Database",
    difficulty: "Intermediate",
    estHours: 18,
    topicsCount: 6,
    progressPct: 0,
    hasPractice: true,
    iconAccent: "from-amber-500 to-orange-500",
    roadmapSlugs: ["java-full-stack", "data-engineer"],
    topics: [
      topic("crud", "CRUD basics", [["crud-statements", "SELECT, INSERT, UPDATE, DELETE", 18]]),
      topic("joins", "Joins", [["join-types", "INNER, LEFT, RIGHT, FULL, CROSS, SELF", 22]]),
      topic("indexing", "Indexing", [["index-types", "B-tree, hash, composite, covering, partial", 24]]),
      topic("transactions", "Transactions (ACID)", [["acid-isolation", "Isolation levels, anomalies", 24]]),
      topic("advanced-sql", "Advanced SQL", [
        ["subqueries", "Subqueries (correlated, scalar)", 20],
        ["views", "Views (regular vs materialized)", 18],
        ["stored-procedures", "Stored procedures", 18],
        ["triggers", "Triggers", 16],
      ]),
      topic("db-design", "Database design", [
        ["normalization", "Normalization (1NF, 2NF, 3NF, BCNF) & denormalization", 24],
        ["er-diagrams", "ER diagrams", 18],
        ["schema-design", "Schema design (PK, FK, constraints)", 22],
        ["query-optimization", "Query optimization (EXPLAIN, plans)", 24],
      ]),
    ],
  },
  {
    slug: "database-nosql",
    title: "NoSQL",
    description: "Document model, MongoDB, CAP theorem.",
    category: "Database",
    difficulty: "Intermediate",
    estHours: 8,
    topicsCount: 3,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-emerald-500 to-cyan-500",
    roadmapSlugs: ["java-full-stack"],
    topics: [
      topic("document-model", "Document model", [["doc-embed-ref", "Schema-less, embedding vs referencing", 22]]),
      topic("mongodb", "MongoDB basics", [["mongo-crud", "CRUD, aggregation, indexes", 24]]),
      topic("cap-theorem", "CAP theorem", [["cap-tradeoffs", "Consistency, Availability, Partition tolerance", 22]]),
    ],
  },

  // =====================================================================
  // DEVOPS (5)
  // =====================================================================
  {
    slug: "git-version-control",
    title: "Git (Version Control)",
    description: "Init, branching, merging, rebase, cherry-pick — Git mastery.",
    category: "DevOps",
    difficulty: "Beginner",
    estHours: 8,
    topicsCount: 3,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-rose-500 to-orange-500",
    roadmapSlugs: ["java-full-stack", "senior-frontend-engineer", "cloud-devops-engineer"],
    topics: [
      topic("git-basics", "Init, clone, commit", [["init-clone-commit", "Basic workflow, .gitignore", 18]]),
      topic("branching-merging", "Branching & merging", [["feature-branches", "Feature branches, fast-forward vs no-ff", 22]]),
      topic("rebase-cherrypick", "Rebase & cherry-pick", [["rebase-interactive", "History rewriting, interactive rebase", 22]]),
    ],
  },
  {
    slug: "cicd-pipelines",
    title: "CI/CD",
    description: "Pipeline stages, build → test → deploy.",
    category: "DevOps",
    difficulty: "Intermediate",
    estHours: 6,
    topicsCount: 2,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-cyan-500 to-blue-500",
    roadmapSlugs: ["cloud-devops-engineer"],
    topics: [
      topic("pipeline-stages", "Pipeline stages", [["stages-overview", "Source → build → test → deploy", 22]]),
      topic("build-test-deploy", "Build → Test → Deploy", [["artifacts-rollback", "Artifacts, environments, rollback", 22]]),
    ],
  },
  {
    slug: "docker-containers",
    title: "Docker",
    description: "Images, Dockerfile, Compose, networking.",
    category: "DevOps",
    difficulty: "Intermediate",
    estHours: 10,
    topicsCount: 4,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-cyan-500 to-blue-500",
    roadmapSlugs: ["cloud-devops-engineer", "java-full-stack"],
    topics: [
      topic("images-containers", "Images & containers", [["images-layers", "Layers, immutability", 22]]),
      topic("dockerfile", "Dockerfile", [["multi-stage", "Multi-stage builds, best practices", 24]]),
      topic("docker-compose", "Docker Compose", [["compose-multi", "Multi-container apps", 20]]),
      topic("volumes-networking", "Volumes & networking", [["volumes-networks", "Persistence, bridge/host/overlay", 22]]),
    ],
  },
  {
    slug: "kubernetes-orchestration",
    title: "Kubernetes",
    description: "Pods, Deployments, Services, Scaling.",
    category: "DevOps",
    difficulty: "Advanced",
    estHours: 14,
    topicsCount: 4,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-blue-500 to-indigo-500",
    roadmapSlugs: ["cloud-devops-engineer"],
    topics: [
      topic("pods", "Pods", [["pod-patterns", "Smallest unit, sidecar/ambassador patterns", 22]]),
      topic("deployments", "Deployments", [["rolling-update", "Replicas, rolling update, rollback", 24]]),
      topic("services", "Services", [["service-types", "ClusterIP, NodePort, LoadBalancer", 22]]),
      topic("scaling", "Scaling", [["hpa", "HPA, cluster autoscaling", 22]]),
    ],
  },
  {
    slug: "server-deployment",
    title: "Server Deployment",
    description: "Server setup, env vars, reverse proxy (NGINX).",
    category: "DevOps",
    difficulty: "Intermediate",
    estHours: 6,
    topicsCount: 3,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-blue-500",
    roadmapSlugs: ["cloud-devops-engineer"],
    topics: [
      topic("server-setup", "Server setup", [["linux-ssh-systemd", "Linux basics, SSH, systemd", 22]]),
      topic("env-vars", "Environment variables", [["dotenv-vault", "dotenv, vault, runtime injection", 18]]),
      topic("reverse-proxy", "Reverse proxy (NGINX)", [["nginx-config", "Load balancing, TLS termination, caching", 24]]),
    ],
  },

  // =====================================================================
  // SYSTEM DESIGN (3)
  // =====================================================================
  {
    slug: "system-design-basics",
    title: "System Design Basics",
    description: "Client-server, API design, monolith vs microservices.",
    category: "System Design",
    difficulty: "Intermediate",
    estHours: 10,
    topicsCount: 3,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-orange-500 to-pink-500",
    roadmapSlugs: ["java-full-stack", "cloud-devops-engineer"],
    topics: [
      topic("client-server", "Client-server architecture", [["client-server-basics", "How client-server actually works", 22]]),
      topic("api-design", "API design", [["rest-best-practices", "REST best practices, versioning, pagination", 24]]),
      topic("monolith-microservices", "Monolith vs Microservices", [["monolith-vs-ms", "Tradeoffs", 24]]),
    ],
  },
  {
    slug: "system-design-advanced",
    title: "System Design Advanced",
    description: "Load balancing, caching (Redis), rate limiting, circuit breaker, sharding, CAP.",
    category: "System Design",
    difficulty: "Advanced",
    estHours: 18,
    topicsCount: 6,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-pink-500",
    roadmapSlugs: ["cloud-devops-engineer", "java-full-stack"],
    topics: [
      topic("load-balancing", "Load balancing", [["lb-algos", "L4 vs L7, RR, least-conn, IP-hash", 24]]),
      topic("caching", "Caching strategies (Redis)", [
        ["cache-patterns", "Cache-aside, write-through, write-behind", 22],
        ["redis-deep", "Redis — data structures, persistence, pub/sub", 26],
      ]),
      topic("rate-limiting", "Rate limiting", [["rate-limit-algos", "Token bucket, leaky bucket, sliding window", 22]]),
      topic("circuit-breaker", "Circuit breaker", [["cb-pattern", "Hystrix-style patterns", 22]]),
      topic("db-sharding", "Database sharding", [["sharding-strategies", "Range, hash, geo, directory", 24]]),
      topic("cap-pacelc", "Consistency vs Availability", [["cap-pacelc-theory", "CAP / PACELC", 22]]),
    ],
  },
  {
    slug: "dbms-complete",
    title: "DBMS Complete (relational, indexes, transactions, CAP)",
    description:
      "End-to-end DBMS — relational model, normalisation, indexes, ACID + isolation, locks + MVCC, joins + planner, CAP/PACELC. Threaded through one Swiggy-Orders schema so concepts compound.",
    category: "Interview Craft",
    difficulty: "Intermediate",
    estHours: 22,
    topicsCount: 9,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-cyan-500",
    roadmapSlugs: [
      "product-company-cracker",
      "service-company-cracker",
      "java-full-stack",
    ],
    topics: [
      topic("dbms-why", "Why DBMS for placement", [
        ["dbms-stakes", "What every Indian product company asks", 18],
      ]),
      topic("relational-model", "Relational model + ER diagrams", [
        ["er-keys", "PK / FK / constraints + Swiggy schema worked example", 26],
      ]),
      topic("normalisation", "Normalisation 1NF → BCNF", [
        ["norm-forms", "1NF / 2NF / 3NF / BCNF with bad-vs-fixed examples", 28],
        ["denormalise", "When to denormalise on purpose", 16],
      ]),
      topic("indexes", "Indexes — B-tree, composite, partial, covering", [
        ["index-btree", "B-tree primer + EXPLAIN ANALYZE walkthrough", 28],
        ["index-types", "Composite / partial / GIN / GiST / BRIN", 24],
        ["index-anti", "When NOT to index", 14],
      ]),
      topic("transactions-acid", "Transactions + ACID", [
        ["acid", "A.C.I.D. letter-by-letter", 22],
        ["isolation", "Isolation levels + 4 anomalies in SQL", 26],
      ]),
      topic("locks-mvcc", "Locks + concurrency", [
        ["pessimistic", "FOR UPDATE / row vs table locks / deadlocks", 22],
        ["mvcc", "MVCC + optimistic concurrency in practice", 20],
      ]),
      topic("joins-optim", "Joins + query optimisation", [
        ["join-types", "INNER / LEFT / RIGHT / FULL / CROSS", 22],
        ["join-algos", "Nested loop / hash / merge join", 22],
        ["query-tuning", "10-point planner-tuning checklist", 20],
      ]),
      topic("cap-pacelc", "CAP + PACELC", [
        ["cap-tradeoffs", "DB classification + Indian product DB choices", 20],
      ]),
      topic("dbms-interview", "Top-30 DBMS interview questions", [
        ["dbms-30", "Q+A table — memorise these", 18],
      ]),
    ],
  },
  {
    slug: "game-dev",
    title: "Game Development (Unity + Unreal)",
    description:
      "Indian game industry track. Unity (C# + MonoBehaviour + prefabs + multiplayer with Mirror) for mobile + casual. Unreal (C++ + Blueprints + UPROPERTY) for AAA. Krafton/MPL/Dream11/Junglee/Nazara hire here.",
    category: "Game Dev",
    difficulty: "Intermediate",
    estHours: 24,
    topicsCount: 13,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-cyan-500",
    roadmapSlugs: ["game-dev-engineer"],
    topics: [
      topic("game-why", "Why Game Dev as a career in India", [
        ["game-careers", "Krafton / MPL / Dream11 / Junglee + salary bands", 22],
      ]),
      topic("unity-csharp", "Unity essentials — C#", [
        ["mono-lifecycle", "MonoBehaviour lifecycle + GameObject + Prefabs", 26],
      ]),
      topic("unity-physics", "Unity — physics + collisions", [
        ["rigidbody-collider", "Rigidbody + Collider + triggers + worked example", 22],
      ]),
      topic("unity-input", "Unity — input + UI", [
        ["new-input-system", "New Input System + Canvas + EventSystem", 18],
      ]),
      topic("unity-anim", "Unity — animations", [
        ["animator-blend", "Animator + state machines + blend trees", 14],
      ]),
      topic("unity-multiplayer", "Unity — multiplayer", [
        ["mirror-photon", "Mirror vs Photon + authoritative server", 22],
      ]),
      topic("unreal-cpp", "Unreal — C++ + Blueprints", [
        ["uobject-actor", "UObject / AActor / APawn / ACharacter + UPROPERTY", 28],
      ]),
      topic("unreal-niagara", "Unreal — Niagara + materials", [
        ["niagara-vfx", "VFX + shader graph basics", 14],
      ]),
      topic("3d-math", "Cross-engine: 3D math + shaders", [
        ["vector-quaternion", "Vectors / matrices / quaternions / shaders", 20],
      ]),
      topic("game-perf", "Performance + optimisation", [
        ["draw-calls", "Draw calls / batching / LOD / mobile compression", 20],
      ]),
      topic("publish", "Publishing", [
        ["steam-store", "Steam / Play / App Store / consoles / WebGL", 16],
      ]),
      topic("game-interview", "Top 30 Game Dev interview Qs", [
        ["game-30", "Q+A table", 16],
      ]),
      topic("game-checklist", "Pre-interview checklist", [
        ["game-pre", "Final ritual", 8],
      ]),
    ],
  },
  {
    slug: "blockchain-web3",
    title: "Blockchain / Web3 Engineer",
    description:
      "Indian Web3: Polygon (unicorn) + CoinDCX + Alephium + Nazara Web3. Ethereum + EVM + Solidity (ERC-20/721/1155) + Hardhat/Foundry + DeFi primitives + security (reentrancy/oracle/MEV) + L2 scaling.",
    category: "Systems",
    difficulty: "Advanced",
    estHours: 22,
    topicsCount: 12,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-cyan-500",
    roadmapSlugs: ["blockchain-engineer"],
    topics: [
      topic("web3-why", "Why Blockchain / Web3 — and the volatility", [
        ["web3-stakes", "Indian Web3 hiring + salary bands + cycles", 22],
      ]),
      topic("blockchain-fund", "Blockchain fundamentals", [
        ["sha-merkle", "Hash / Merkle / PoW / PoS / blocks", 22],
      ]),
      topic("ethereum-evm", "Ethereum + EVM", [
        ["evm-state", "EOA vs contract + gas + EIP-1559", 26],
      ]),
      topic("solidity", "Solidity essentials", [
        ["solidity-syntax", "State / functions / modifiers / inheritance", 26],
        ["erc20-worked", "Worked 60-line ERC-20 contract", 22],
      ]),
      topic("hardhat-foundry", "Hardhat + Foundry tooling", [
        ["hh-foundry", "Hardhat (JS) vs Foundry (Rust) + Ganache", 22],
      ]),
      topic("defi", "DeFi primitives", [
        ["amm-lending", "ERC-20/721/1155 + AMM (Uniswap V2) + lending", 22],
      ]),
      topic("smart-contract-sec", "Smart contract security", [
        ["reentrancy-mev", "Reentrancy + integer overflow + oracle / MEV", 26],
      ]),
      topic("l2", "Layer 2 + scaling", [
        ["l2-rollups", "Polygon / Optimism / Arbitrum / zkEVM", 18],
      ]),
      topic("dapp", "Frontend dApp development", [
        ["ethers-viem", "ethers.js / viem + wagmi + RainbowKit", 16],
      ]),
      topic("regulatory", "Indian regulatory landscape", [
        ["india-tax", "30% tax + 1% TDS + WazirX hack + compliance", 14],
      ]),
      topic("web3-interview", "Top 30 Blockchain / Web3 interview Qs", [
        ["web3-30", "Q+A table", 16],
      ]),
    ],
  },
  {
    slug: "final-layer-closures",
    title: "Salary Negotiation + Accenture/Deloitte + PSU via GATE",
    description:
      "3-in-1 final closures. Salary negotiation deep (research → counter → close + 5 model scripts each). Accenture/Deloitte playbook (separate from Cog/Cap/Wipro). PSU recruitment via GATE deep dive (BHEL/IOCL/ONGC + 11-PSU thresholds).",
    category: "Interview Craft",
    difficulty: "Beginner",
    estHours: 12,
    topicsCount: 12,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-cyan-500",
    roadmapSlugs: [
      "service-company-cracker",
      "off-campus-cracker",
      "gate-cse-cracker",
    ],
    topics: [
      topic("neg-reality", "Negotiation reality for Indian freshers", [
        ["leave-3-5", "Why most leave ₹3-5 LPA on table", 14],
      ]),
      topic("neg-research", "Pre-offer research", [
        ["sources", "LeadIQ / Glassdoor / Levels.fyi / AmbitionBox", 14],
      ]),
      topic("neg-defer", "Defer phase — never speak first", [
        ["3-deflect", "3 deflection scripts", 18],
      ]),
      topic("neg-counter", "Counter phase — the ₹X with data framing", [
        ["3-counter", "3 counter scripts + multi-component", 22],
      ]),
      topic("neg-close", "Close phase + walk-away", [
        ["walk-away", "When to walk + multiple-offer leverage", 14],
      ]),
      topic("acn-test", "Accenture test structure + coding", [
        ["acn-5", "5 worked Accenture coding solutions", 26],
      ]),
      topic("deloitte-test", "Deloitte USI test + 3 case studies", [
        ["dlt-cases", "3 worked consulting cases + service lines", 24],
      ]),
      topic("acn-dlt-hr", "Accenture + Deloitte HR + bonds", [
        ["hr-10", "10 model Q&A + service-line choice", 18],
      ]),
      topic("psu-landscape", "PSU recruitment via GATE — 11 PSUs", [
        ["psu-cutoffs", "BHEL / IOCL / ONGC / SAIL / NTPC + 6 more", 22],
      ]),
      topic("psu-timeline", "PSU application timeline", [
        ["timeline", "GATE result → notifications → interview → offer", 16],
      ]),
      topic("psu-interview", "PSU interview prep + 8 HR Q&A", [
        ["psu-hr-8", "Government-style behavioural", 22],
      ]),
      topic("psu-pros-cons", "PSU pros vs cons + when PSU > product co", [
        ["psu-tradeoff", "Job security vs career velocity", 12],
      ]),
    ],
  },
  {
    slug: "cog-cap-wipro-playbook",
    title: "Cognizant + Capgemini + Wipro WILP Playbook",
    description:
      "3 service-co tests in one subject (~700k aspirants combined). Cognizant GenC + GenC Next, Capgemini Pseudocode + game-based aptitude, Wipro WILP + Elite NLTH. Test structures, coding patterns, communication tests, HR + bond strategy.",
    category: "Interview Craft",
    difficulty: "Beginner",
    estHours: 18,
    topicsCount: 12,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-cyan-500",
    roadmapSlugs: ["service-trio-cracker", "service-company-cracker"],
    topics: [
      topic("cog-genc", "Cognizant GenC + GenC Next", [
        ["genc-structure", "4-section structure + Communication test", 22],
        ["genc-coding", "5 worked Python solutions", 24],
        ["genc-next", "GenC Next differentiator", 14],
      ]),
      topic("cap-pseudo", "Capgemini Pseudocode", [
        ["cap-pseudo-10", "10 worked pseudocode examples", 24],
      ]),
      topic("cap-games", "Capgemini Game-based aptitude", [
        ["cap-8-games", "8 game types + strategy", 20],
      ]),
      topic("cap-coding", "Capgemini Senior Analyst coding", [
        ["cap-3", "3 worked Python solutions", 18],
      ]),
      topic("wipro-wilp", "Wipro WILP", [
        ["wilp-3-essays", "Why-WILP essay framework + 3 model essays", 22],
      ]),
      topic("wipro-nlth", "Wipro Elite NLTH", [
        ["nlth-3", "3 worked Python solutions + bond math", 18],
      ]),
      topic("trio-hr", "Cross-trio HR + bonds", [
        ["bond-strategy", "1-yr / 18-mo / 5-yr bond strategy", 16],
      ]),
      topic("trio-prep", "30-day combined prep cadence", [
        ["trio-cadence", "Week-by-week", 16],
      ]),
      topic("trio-tricky", "Top 30 cross-trio recurring questions", [
        ["trio-30", "Rapid-reference table", 14],
      ]),
      topic("trio-checklist", "Pre-test checklist", [
        ["trio-pre", "Day-before ritual", 10],
      ]),
    ],
  },
  {
    slug: "gate-cse",
    title: "GATE CSE Complete Prep",
    description:
      "200k aspirants/year. Subject-wise weightage + 12-month plan + PSU recruitment thresholds (BHEL/IOCL/ONGC). Opens IIT MTech / IISc / PSU jobs. 80% syllabus overlap with product co interviews.",
    category: "Interview Craft",
    difficulty: "Advanced",
    estHours: 28,
    topicsCount: 14,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-cyan-500",
    roadmapSlugs: ["gate-cse-cracker"],
    topics: [
      topic("gate-unlocks", "What GATE CSE unlocks", [
        ["mtech-psu", "IIT Mtech + NIT/IIIT + PSU + PhD", 22],
      ]),
      topic("gate-structure", "2026 GATE CSE structure", [
        ["gate-marking", "65 Q + marking scheme + negative marking", 22],
      ]),
      topic("gate-roi", "Subject-wise weightage + ROI", [
        ["gate-rom", "Marks-per-prep-hour matrix", 26],
      ]),
      topic("gate-algos", "Algorithms — GATE-specific", [
        ["gate-algo-tactics", "Asymptotic + DP + greedy 4-marker patterns", 20],
      ]),
      topic("gate-dbms", "DBMS — GATE-specific", [
        ["gate-dbms-tactics", "Normalisation + transactions PYQ-heavy", 18],
      ]),
      topic("gate-os", "OS — GATE-specific", [
        ["gate-os-tactics", "Scheduling + paging + sync numericals", 18],
      ]),
      topic("gate-cn", "CN — GATE-specific", [
        ["gate-cn-tactics", "Subnet + sliding-window math", 16],
      ]),
      topic("gate-coa", "COA — GATE-specific", [
        ["gate-coa-tactics", "Pipelining + cache numericals", 18],
      ]),
      topic("gate-comp-toc", "Compiler + TOC — GATE-specific", [
        ["gate-comp-toc", "Parsing + DFA + pumping lemma", 22],
      ]),
      topic("gate-math", "Discrete + Engg Math", [
        ["gate-math-tactics", "Graphs + linear algebra + probability", 18],
      ]),
      topic("gate-aptitude", "General Aptitude (15 marks)", [
        ["ga-cross-link", "Cross-link to aptitude-* subjects", 12],
      ]),
      topic("gate-plan", "12-month prep plan", [
        ["gate-12mo", "Month-by-month cadence + 30 mocks", 22],
      ]),
      topic("psu-recruitment", "PSU recruitment via GATE", [
        ["psu-thresholds", "BHEL / IOCL / ONGC / SAIL / NTPC cutoffs", 18],
      ]),
      topic("gate-checklist", "Top 30 recurring topics + pre-exam checklist", [
        ["gate-30", "Rapid-reference + final ritual", 16],
      ]),
    ],
  },
  {
    slug: "amcat-cocubes-elitmus",
    title: "AMCAT + CoCubes + eLitmus — Off-Campus Tests",
    description:
      "3 off-campus aptitude platforms (~600k combined aspirants). AMCAT (75+ premium pool), CoCubes (Aon percentile), eLitmus (pH score + cryptarithmetic + heavy negative marking). Score-to-company mapping + 30-day combined prep.",
    category: "Interview Craft",
    difficulty: "Beginner",
    estHours: 12,
    topicsCount: 11,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-cyan-500",
    roadmapSlugs: ["off-campus-cracker"],
    topics: [
      topic("amcat-what", "What AMCAT is", [
        ["amcat-score", "amcatScore + company mapping", 18],
      ]),
      topic("amcat-structure", "AMCAT test structure", [
        ["amcat-modules", "English / Quant / Logical / Programming + Domain", 22],
      ]),
      topic("amcat-prog", "Computer Programming module", [
        ["amcat-prog-8", "8 worked example questions", 22],
      ]),
      topic("amcat-domain", "Domain modules — when to pick which", [
        ["amcat-domains", "Java / C++ / DBMS / Networks", 14],
      ]),
      topic("cocubes-what", "What CoCubes is + Aon percentile", [
        ["cocubes-cos", "ZS Associates / Genpact / TCS Digital", 16],
      ]),
      topic("cocubes-structure", "CoCubes test structure + 5 worked Python problems", [
        ["cocubes-5", "Test breakdown + worked solutions", 22],
      ]),
      topic("elitmus-what", "What eLitmus pH Test is", [
        ["elitmus-ph", "pH99+ club + negative-marking math", 22],
      ]),
      topic("elitmus-quant", "eLitmus Quant — CAT-level", [
        ["elitmus-quant-tactics", "PnC / Probability / Geometry tilts", 20],
      ]),
      topic("elitmus-reasoning", "eLitmus Reasoning — cryptarithmetic-heavy", [
        ["cryptarithmetic", "5+ Q every test", 18],
      ]),
      topic("elitmus-strategy", "eLitmus negative-marking strategy", [
        ["blank-vs-guess", "Decision matrix", 14],
      ]),
      topic("compare-3", "3-platform comparison + 30-day plan", [
        ["3-platform", "Difficulty / hiring volume / fees + week-by-week", 18],
      ]),
    ],
  },
  {
    slug: "embedded-iot",
    title: "Embedded / IoT Engineer",
    description:
      "Hardware-startup wave + chip companies + PSU. C/C++ for embedded + microcontrollers (STM32/ESP32) + RTOS (FreeRTOS) + protocols (UART/SPI/I2C/CAN/MQTT) + IoT cloud (AWS IoT) + bootloader + OTA. Ola Electric, Ather, Mahindra, Boat hire here.",
    category: "Systems",
    difficulty: "Advanced",
    estHours: 30,
    topicsCount: 12,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-cyan-500",
    roadmapSlugs: ["embedded-iot-engineer"],
    topics: [
      topic("emb-why", "Why Embedded / IoT", [
        ["emb-careers", "Hardware startups + chip cos + PSU + ISRO", 20],
      ]),
      topic("c-cpp-embedded", "C / C++ for embedded", [
        ["volatile-isr", "volatile + ISR rules + bit manipulation", 26],
      ]),
      topic("microcontrollers", "Microcontrollers", [
        ["stm32-esp32", "8-bit vs 32-bit ARM Cortex-M + STM32 + ESP32", 26],
        ["mcu-blink", "GPIO blink in HAL", 16],
      ]),
      topic("protocols", "Communication protocols", [
        ["uart-spi-i2c", "UART / SPI / I2C / CAN / MQTT", 28],
        ["i2c-worked", "Worked I2C BME280 sensor read", 18],
      ]),
      topic("rtos", "RTOS — FreeRTOS", [
        ["rtos-tasks", "Tasks / queues / semaphores / mutex", 22],
        ["producer-consumer", "Worked producer-consumer with FreeRTOS", 18],
      ]),
      topic("linux-embedded", "Linux on embedded", [
        ["yocto-uboot", "Yocto / Buildroot / device tree / U-Boot", 18],
      ]),
      topic("iot-cloud", "IoT cloud", [
        ["aws-iot", "AWS IoT Core + ESP32 MQTT publish", 22],
      ]),
      topic("sensors", "Sensors + actuators", [
        ["pwm-servo", "Common sensors + PWM motor control", 14],
      ]),
      topic("emb-test", "Embedded testing + debugging", [
        ["jtag-swd", "Unity / CMock + JTAG / SWD + logic analyser", 16],
      ]),
      topic("ota", "Production deployment + OTA", [
        ["bootloader-ota", "Bootloader + OTA + code signing", 16],
      ]),
      topic("emb-interview", "Top 30 Embedded / IoT interview Qs", [
        ["emb-30", "Q+A table", 18],
      ]),
    ],
  },
  {
    slug: "compiler-toc",
    title: "Compiler Design + Theory of Computation",
    description:
      "Final Layer-0 closure. 6-phase compilation (lexical → parsing → SDT → IR → optimisation → code-gen) + TOC (regular languages, FA, CFG, PDA, Turing machines, decidability, P/NP/NPC). GATE 15 marks + MS/Adobe/Google interview asks.",
    category: "Foundations",
    difficulty: "Advanced",
    estHours: 22,
    topicsCount: 13,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-cyan-500",
    roadmapSlugs: ["gate-cse-cracker"],
    topics: [
      topic("compiler-overview", "What compilers do", [
        ["6-phases", "6-phase model + worked example", 22],
      ]),
      topic("lexical", "Lexical Analysis", [
        ["regex-fa", "Regex → NFA → DFA + Hopcroft minimisation", 24],
      ]),
      topic("syntax", "Syntax Analysis", [
        ["ll1-lr", "LL(1) + SLR / CLR / LALR head-to-head", 28],
        ["first-follow", "FIRST / FOLLOW + parse table", 22],
      ]),
      topic("semantic", "Semantic Analysis + SDT", [
        ["sdt", "Synthesised vs inherited attributes", 18],
      ]),
      topic("ir-opt", "Intermediate Code + Optimisation", [
        ["tac-dag", "TAC / DAG / loop optimisation", 18],
      ]),
      topic("codegen", "Code Generation", [
        ["reg-alloc", "Graph-colouring register allocation", 12],
      ]),
      topic("regular", "Regular Languages + Finite Automata", [
        ["dfa-nfa", "DFA / NFA / ε-NFA + pumping lemma", 26],
      ]),
      topic("cfl-pda", "Context-Free Languages + Pushdown Automata", [
        ["cfg-pda", "CFG / PDA / CNF / pumping lemma for CFLs", 26],
      ]),
      topic("turing", "Turing Machines + Decidability", [
        ["halting", "TM variants + Halting problem + Rice's theorem", 24],
      ]),
      topic("chomsky", "Chomsky Hierarchy", [
        ["hierarchy", "Type 0/1/2/3 + diagram", 14],
      ]),
      topic("complexity", "Computational Complexity", [
        ["np-completeness", "P / NP / NP-hard / NPC + Cook-Levin", 22],
      ]),
      topic("comp-toc-interview", "Top 25 Compiler + TOC interview Qs", [
        ["comp-toc-25", "Q+A table", 16],
      ]),
      topic("comp-toc-checklist", "Pre-exam checklist", [
        ["comp-toc-pre", "Final ritual", 8],
      ]),
    ],
  },
  {
    slug: "backend-py-go",
    title: "Backend Engineer (Python + Go)",
    description:
      "FastAPI / Django (Python) + gin / fiber / chi (Go). When Python wins, when Go wins. REST + gRPC, JWT, async + goroutines, DB integration, deployment. Distinct from Node/MERN.",
    category: "Web Development",
    difficulty: "Intermediate",
    estHours: 30,
    topicsCount: 13,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-cyan-500",
    roadmapSlugs: ["backend-engineer", "product-company-cracker"],
    topics: [
      topic("backend-why", "Why Python AND Go for backend", [
        ["pygo-stakes", "When each wins + Indian product co stack", 22],
      ]),
      topic("fastapi", "Python — FastAPI deep", [
        ["fastapi-typing", "Path / query / body / DI / async", 28],
        ["fastapi-worked", "50-line FastAPI service with auth + DB", 24],
      ]),
      topic("django", "Python — Django when CRUD-heavy", [
        ["django-drf", "DRF + Celery + admin panel", 20],
      ]),
      topic("go-essentials", "Go — language essentials", [
        ["goroutines", "Goroutines + channels + interfaces", 26],
        ["go-context", "Context propagation + 60-line HTTP server", 22],
      ]),
      topic("go-frameworks", "Go — gin / fiber / chi", [
        ["go-routers", "Router comparison + middleware chain", 22],
      ]),
      topic("rest-grpc", "REST + gRPC across both languages", [
        ["grpc-codegen", "gRPC .proto + cross-language code-gen", 22],
      ]),
      topic("auth-patterns", "Auth patterns", [
        ["py-go-jwt", "JWT in FastAPI + gin + refresh rotation", 22],
      ]),
      topic("db-integration", "Database integration", [
        ["sqlalchemy-pgx", "SQLAlchemy 2.0 + GORM / sqlx / pgx", 22],
      ]),
      topic("async-comparison", "Async + concurrency comparison", [
        ["asyncio-goroutines", "asyncio vs goroutines + race detector", 20],
      ]),
      topic("deployment", "Production deployment", [
        ["py-go-deploy", "gunicorn / static binary / Cloud Run", 18],
      ]),
      topic("testing", "Testing", [
        ["pytest-testify", "pytest + httpx / testify + httptest", 18],
      ]),
      topic("interview", "Top 30 Python/Go backend interview Qs", [
        ["pygo-30", "Q+A table", 18],
      ]),
    ],
  },
  {
    slug: "cross-platform-mobile",
    title: "Cross-Platform Mobile (Flutter + React Native)",
    description:
      "Flutter (Dart + Riverpod + Bloc + go_router) and React Native (Hermes + Fabric + Zustand + Redux Toolkit). When each wins vs native. Cross-link to android-kotlin.",
    category: "Mobile",
    difficulty: "Intermediate",
    estHours: 28,
    topicsCount: 14,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-cyan-500",
    roadmapSlugs: ["flutter-rn-developer"],
    topics: [
      topic("native-vs-cross", "Native vs Cross-Platform", [
        ["decision-matrix", "When Flutter / RN / native each wins", 22],
      ]),
      topic("dart", "Flutter — Dart essentials", [
        ["dart-null", "Null safety + async + records (Dart 3)", 22],
      ]),
      topic("widgets", "Flutter — widget architecture", [
        ["widget-tree", "Widget / Element / Render tree + Counter", 24],
      ]),
      topic("flutter-state", "Flutter — state management", [
        ["riverpod-bloc", "Riverpod + Bloc + worked TodoList", 26],
      ]),
      topic("flutter-nav", "Flutter — Navigation + Routing", [
        ["go-router", "go_router + type-safe routes", 16],
      ]),
      topic("flutter-net-persist", "Flutter — networking + persistence", [
        ["dio-drift", "dio + drift + Hive + shared_preferences", 22],
      ]),
      topic("rn-basics", "React Native — basics + new architecture", [
        ["hermes-fabric", "Hermes + Fabric + JSI", 22],
      ]),
      topic("rn-state", "React Native — state management", [
        ["zustand-redux", "Zustand + Redux Toolkit + TodoList", 22],
      ]),
      topic("expo", "React Native — Expo vs vanilla CLI", [
        ["expo-cli", "When to graduate from Expo", 16],
      ]),
      topic("native-modules", "Native modules / platform channels", [
        ["method-channel", "Flutter MethodChannel + RN TurboModules", 18],
      ]),
      topic("mobile-testing", "Testing", [
        ["flutter-rn-tests", "flutter_test + Detox e2e", 16],
      ]),
      topic("mobile-deploy", "Deployment to Play Store + App Store", [
        ["fastlane-ota", "Fastlane + Expo OTA + CodePush controversy", 16],
      ]),
      topic("interview", "Top 30 cross-platform interview Qs", [
        ["xplat-30", "Q+A table", 16],
      ]),
      topic("checklist", "Pre-interview checklist", [
        ["xplat-pre", "Day-before ritual", 10],
      ]),
    ],
  },
  {
    slug: "devsecops-appsec",
    title: "DevSecOps / Application Security",
    description:
      "Highest-paid + lowest-supply track in Indian tech. OWASP Top 10 + threat modelling (STRIDE) + SAST/DAST/SCA + container/K8s security + supply chain (SLSA / cosign / SBOM) + IAM + JWT pitfalls + incident response.",
    category: "Interview Craft",
    difficulty: "Advanced",
    estHours: 32,
    topicsCount: 12,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-cyan-500",
    roadmapSlugs: ["devsecops-engineer"],
    topics: [
      topic("appsec-why", "Why AppSec / DevSecOps as a career", [
        ["appsec-stakes", "Salary bands + Indian product co teams", 24],
      ]),
      topic("owasp-top10", "OWASP Top 10 (2021)", [
        ["a01-a05", "A01–A05 with code samples", 28],
        ["a06-a10", "A06–A10 with case studies", 26],
      ]),
      topic("stride", "Threat modelling — STRIDE", [
        ["stride-payment", "Threat-model a Razorpay-style flow", 22],
      ]),
      topic("sast-dast", "SAST + DAST + SCA", [
        ["scan-tools", "SonarQube / ZAP / Snyk + CI integration", 22],
      ]),
      topic("secrets", "Secret scanning + management", [
        ["vault-gitleaks", "gitleaks / Vault / rotation strategies", 18],
      ]),
      topic("k8s-security", "Container + K8s security", [
        ["pss-rbac", "Image scanning + PSS + NetworkPolicy + RBAC", 26],
      ]),
      topic("supply-chain", "Supply chain security", [
        ["slsa-cosign", "SLSA + cosign + SBOM + SolarWinds case", 22],
      ]),
      topic("iam", "IAM + zero trust", [
        ["aws-iam", "AWS IAM JSON + SSO + zero-trust intro", 20],
      ]),
      topic("jwt-pitfalls", "OAuth / OIDC / JWT pitfalls", [
        ["jwt-attacks", "alg=none + key confusion + rotation", 18],
      ]),
      topic("incident-response", "Incident response", [
        ["ir-6phase", "6-phase IR + CERT-In 6-hour rule", 18],
      ]),
      topic("interview", "Top 30 AppSec interview Qs", [
        ["appsec-30", "Q+A table", 18],
      ]),
    ],
  },
  {
    slug: "discrete-math-oop",
    title: "Discrete Math + Advanced OOP",
    description:
      "Foundation closure. Set theory + logic + combinatorics + graph theory + number theory (GATE-needed) + 4 OOP pillars deep + SOLID applied + UML + GoF design patterns survey.",
    category: "Foundations",
    difficulty: "Intermediate",
    estHours: 26,
    topicsCount: 13,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-cyan-500",
    roadmapSlugs: ["product-company-cracker", "service-company-cracker"],
    topics: [
      topic("set-theory", "Set theory", [
        ["sets-ops", "Subsets / power set / De Morgan's", 22],
      ]),
      topic("logic", "Propositional + Predicate Logic", [
        ["logic-rules", "Truth tables + inference rules + ∀ / ∃", 26],
      ]),
      topic("combinatorics", "Combinatorics deep", [
        ["pigeonhole", "Stirling / pigeonhole / inclusion-exclusion / Catalan", 24],
      ]),
      topic("graph-theory", "Graph theory", [
        ["graphs-types", "Definitions + types + Euler/Hamilton + colouring", 26],
      ]),
      topic("number-theory", "Number theory", [
        ["gcd-rsa", "GCD + modular arithmetic + Sieve + RSA intro", 22],
      ]),
      topic("relations", "Relations + Functions", [
        ["equiv-bij", "Equivalence relations + bijective + Hasse", 18],
      ]),
      topic("oop-pillars", "The 4 OOP pillars — deep", [
        ["pillars-4", "Encapsulation / abstraction / inheritance / polymorphism", 22],
      ]),
      topic("solid-applied", "SOLID — applied with code", [
        ["lsp-square-rect", "5 SOLID principles + Square-Rectangle violation", 28],
      ]),
      topic("uml", "UML notation", [
        ["uml-class-seq", "Class / sequence / state diagrams", 18],
      ]),
      topic("gof-creational", "GoF Creational patterns", [
        ["singleton-factory", "Singleton / Factory / Builder / Prototype", 22],
      ]),
      topic("gof-structural", "GoF Structural patterns", [
        ["adapter-decorator", "Adapter / Decorator / Facade / Proxy / Composite", 22],
      ]),
      topic("gof-behavioural", "GoF Behavioural patterns", [
        ["observer-state", "Strategy / Observer / State / Iterator / CoR", 22],
      ]),
      topic("composition", "Composition over inheritance", [
        ["composition-rule", "When inheritance still wins", 14],
      ]),
    ],
  },
  {
    slug: "mock-interview-comm",
    title: "Mock Interviews + GD + English Communication",
    description:
      "Layer-2 finisher. Mock interview rubric + 8-week cadence + 4 mock types + 6 platforms (Pramp/Interviewing.io/InterviewBit/Topmate). GD format + 4 personas + 10 topics. English communication for tech (5 model emails, 30 power verbs, pronunciation).",
    category: "Interview Craft",
    difficulty: "Beginner",
    estHours: 10,
    topicsCount: 12,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-cyan-500",
    roadmapSlugs: [
      "service-company-cracker",
      "product-company-cracker",
      "off-campus-cracker",
    ],
    topics: [
      topic("mock-why", "Why mocks beat solo prep", [
        ["mock-stakes", "1:1 explained-out-loud ratio + tier-2/3 reality", 14],
      ]),
      topic("mock-types", "4 mock-interview types", [
        ["mock-4-types", "DSA / system design / LLD / behavioural", 18],
      ]),
      topic("mock-rubric", "The mock rubric", [
        ["rubric-matrix", "Communication 40% / Approach 30% / Code 20% / Confidence 10%", 22],
      ]),
      topic("mock-platforms", "Where to find mock partners", [
        ["6-platforms", "Pramp / Interviewing.io / InterviewBit / Topmate / Discord", 18],
      ]),
      topic("mock-cadence", "8-week mock cadence", [
        ["cadence-8wk", "Week-by-week ramp", 14],
      ]),
      topic("gd-format", "GD format basics", [
        ["gd-rules", "8-12 candidates / 2-min think + 15-min discuss", 18],
      ]),
      topic("gd-personas", "4 GD personas", [
        ["initiator-closer", "Initiator / Aggregator / Pacifier / Closer", 18],
      ]),
      topic("gd-topics", "10 sample GD topics", [
        ["gd-tech-social", "Tech / social / current-affairs / abstract", 20],
      ]),
      topic("comm-presentation", "Technical presentation skills", [
        ["tell-tell-tell", "Tell-tell-tell rule + code-walkthrough cadence", 14],
      ]),
      topic("comm-emails", "Formal email writing", [
        ["5-emails", "5 model emails + subject-line formulas", 18],
      ]),
      topic("comm-vocab", "Interview vocabulary + pronunciation", [
        ["power-verbs", "30 power verbs + 15 pronunciation gotchas", 16],
      ]),
      topic("comm-checklist", "Pre-interview checklist", [
        ["pre-checklist", "Voice warm-up + breathing + slow down", 8],
      ]),
    ],
  },
  {
    slug: "data-engineer",
    title: "Data Engineer (Spark / Airflow / dbt / Kafka)",
    description:
      "Modern data stack — SQL deep, warehousing (Snowflake/BigQuery/Databricks), Spark, Airflow, dbt medallion, Kafka streaming, data quality + lineage. Distinct from Data Analyst (analytics) and ML Engineer (modeling).",
    category: "Data & ML",
    difficulty: "Advanced",
    estHours: 30,
    topicsCount: 12,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-cyan-500",
    roadmapSlugs: ["data-engineer"],
    topics: [
      topic("de-why", "Why Data Engineering — vs DA / MLE / Backend", [
        ["de-roles", "Indian product co teams + salary bands", 22],
      ]),
      topic("modern-stack", "The modern data stack", [
        ["stack-arch", "Sources → ingestion → lake → transform → warehouse", 24],
      ]),
      topic("sql-de", "SQL deep for DE", [
        ["window-fns", "Window functions + recursive CTEs", 28],
        ["sql-perf", "Performance + materialised views + dialects", 22],
      ]),
      topic("warehouses", "Data warehouses + lakehouses", [
        ["star-snowflake", "Star / snowflake / SCD types 1-3", 26],
        ["lakehouse", "Snowflake / BigQuery / Databricks + Delta/Iceberg/Hudi", 22],
      ]),
      topic("spark", "Apache Spark", [
        ["spark-internals", "RDD → DataFrame + lazy + DAG + partitioning", 28],
        ["pyspark-3", "3 worked PySpark examples", 22],
      ]),
      topic("airflow", "Workflow orchestration — Airflow", [
        ["airflow-dag", "DAG mental model + Operators + worked DAG", 26],
      ]),
      topic("dbt", "dbt — the analytics-engineering layer", [
        ["dbt-medallion", "Models / tests / snapshots / medallion + worked example", 22],
      ]),
      topic("kafka", "Streaming — Kafka", [
        ["kafka-deliv", "Topics / partitions / delivery guarantees + producer/consumer", 24],
      ]),
      topic("data-quality", "Data quality + observability", [
        ["dq-tests", "dbt tests / Great Expectations / lineage", 18],
      ]),
      topic("cost", "Production deployment + cost control", [
        ["cost-aware", "Snowflake credits / BQ slots / partition pruning", 16],
      ]),
      topic("interview", "Top 30 Data Engineer interview questions", [
        ["de-30", "Q+A table", 18],
      ]),
    ],
  },
  {
    slug: "qa-sdet",
    title: "QA / SDET",
    description:
      "Underrated entry point. Manual QA + Playwright/Cypress automation + API testing + k6 perf + mobile (Appium) + test infrastructure (the SDET role) + CI integration. The QA → SDET → SDE upgrade ladder.",
    category: "Interview Craft",
    difficulty: "Beginner",
    estHours: 22,
    topicsCount: 11,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-cyan-500",
    roadmapSlugs: ["qa-sdet-cracker"],
    topics: [
      topic("qa-why", "Why QA/SDET — vs manual QA", [
        ["qa-ladder", "Salary ladder + Indian product co teams", 20],
      ]),
      topic("manual", "Manual QA fundamentals", [
        ["test-design", "BVA / EP / decision tables + 5 worked test cases", 22],
      ]),
      topic("ui-automation", "Automation testing — UI", [
        ["playwright", "Selenium / Playwright / Cypress + worked Playwright", 26],
      ]),
      topic("api-testing", "API testing", [
        ["postman-newman", "Postman / REST Assured / pytest + supertest", 22],
      ]),
      topic("perf-testing", "Performance testing", [
        ["k6", "JMeter vs k6 + percentiles + worked k6 script", 22],
      ]),
      topic("mobile-testing", "Mobile testing", [
        ["appium", "Appium / Espresso / XCUITest + cloud labs", 18],
      ]),
      topic("test-infra", "Test infrastructure (the SDET role)", [
        ["sdet-infra", "Factories / Docker / parallelism / flake detection", 26],
      ]),
      topic("ci-integration", "CI/CD integration", [
        ["gh-actions", "GitHub Actions / test pyramid / yml worked example", 18],
      ]),
      topic("career-path", "QA → SDET → SDE upgrade ladder", [
        ["upgrade-path", "2-yr SDET-to-SDE path + portfolio play", 18],
      ]),
      topic("interview", "Top 30 QA/SDET interview questions", [
        ["qa-30", "Q+A table", 16],
      ]),
      topic("checklist", "Pre-interview checklist", [
        ["qa-pre", "Day-before ritual", 10],
      ]),
    ],
  },
  {
    slug: "off-campus-playbook",
    title: "Off-Campus Drive Playbook",
    description:
      "Tier-3 college students whose colleges have weak/no placement cells. LinkedIn cold-outreach, recruiter messages, ATS hacks, referral plays, naukri/instahyre/hirist tactics, year-by-year strategy.",
    category: "Interview Craft",
    difficulty: "Beginner",
    estHours: 12,
    topicsCount: 11,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-cyan-500",
    roadmapSlugs: ["off-campus-cracker"],
    topics: [
      topic("oc-why", "Why off-campus IS the campus", [
        ["oc-mindset", "Tier-3 reality + the 40% off-campus stat", 18],
      ]),
      topic("year-by-year", "Year-by-year strategy", [
        ["year-1-2", "1st-2nd year foundation + first hackathon", 22],
        ["year-3-4", "3rd-4th year intern push + offer conversion", 24],
      ]),
      topic("linkedin", "LinkedIn cold-outreach playbook", [
        ["dm-scripts", "5 model cold-DM scripts + 3-message framework", 28],
      ]),
      topic("referrals", "Referrals — highest-conversion path", [
        ["ref-3", "3 referral request scripts + give-before-ask", 18],
      ]),
      topic("ats-hacks", "ATS hacks", [
        ["ats-keywords", "Keyword stuffing the right way + bad-vs-good bullets", 18],
      ]),
      topic("job-boards", "Job board strategy", [
        ["boards-rank", "LinkedIn / Instahyre / Naukri / Cutshort / direct careers page", 22],
      ]),
      topic("cold-email", "The cold email", [
        ["email-3", "3 model cold emails + subject-line formulas", 18],
      ]),
      topic("hackathon-job", "Hackathon path to job", [
        ["sih", "SIH / Devfolio / MLH + LinkedIn-post template", 16],
      ]),
      topic("oc-interview", "Off-campus interview prep", [
        ["oc-bar", "Higher DSA bar + earlier system-design", 16],
      ]),
      topic("rejection", "Rejection handling + tracking", [
        ["funnel", "100 → 10 → 3 → 1 funnel + tracking sheet", 14],
      ]),
    ],
  },
  {
    slug: "faang-india-prep",
    title: "FAANG India Internship + Fresher Prep",
    description:
      "Top-1% path. Google STEP + Amazon WoW + Microsoft Engage + Meta MUE + Stripe Pathfinders + DEShaw/Two Sigma/Citadel quant intern. Eligibility, timing, OAs, behavioural prep, India hiring quirks.",
    category: "Interview Craft",
    difficulty: "Advanced",
    estHours: 16,
    topicsCount: 12,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-cyan-500",
    roadmapSlugs: ["off-campus-cracker"],
    topics: [
      topic("faang-landscape", "FAANG India fresher landscape", [
        ["salary-deltas", "Salary deltas + FAANG-adjacent set", 22],
      ]),
      topic("google-step", "Google STEP", [
        ["step-essays", "Eligibility + 3 model essay answers + interview structure", 26],
      ]),
      topic("amazon-wow", "Amazon WoW + SDE Intern", [
        ["amzn-lp", "16 Leadership Principles → 5 dominant + 5 STAR LP answers", 24],
      ]),
      topic("ms-engage", "Microsoft Engage", [
        ["engage-rubric", "Capstone rubric + 2-step ladder", 22],
      ]),
      topic("other-programs", "Meta / Apple / LinkedIn / Stripe / Adobe / quant", [
        ["other-7", "7 program-specific tactics", 22],
      ]),
      topic("dsa-faang", "DSA prep specific to FAANG India", [
        ["dsa-topic-freq", "Topic frequency + time budget", 20],
      ]),
      topic("sd-intern", "System design at intern level", [
        ["sd-altitude", "URL shortener / chat / cache at the right altitude", 18],
      ]),
      topic("behavioural-faang", "Behavioural prep", [
        ["star-8", "8 STAR answers across company value systems", 26],
      ]),
      topic("strategy", "Application strategy + timing", [
        ["12mo-calendar", "12-month application calendar + reapplication", 18],
      ]),
      topic("rejection-fixes", "Common rejection reasons + fixes", [
        ["fixes", "OA / behavioural / resume / timing", 16],
      ]),
      topic("interview-25", "Top 25 FAANG India intern questions", [
        ["faang-25", "Rapid-reference table", 16],
      ]),
      topic("checklist", "Pre-application checklist", [
        ["pre-app", "Final checklist", 10],
      ]),
    ],
  },
  {
    slug: "hackathons-bip-freelancing",
    title: "Hackathons + Build-in-Public + Freelancing",
    description:
      "Layer-4 finishers. Hackathon strategy (Devfolio/SIH/MLH + how to win + LinkedIn post), build-in-public (LinkedIn + X cadence), freelancing while studying (Upwork/Topmate/PeoplePerHour + SOW + Indian tax basics).",
    category: "Portfolio",
    difficulty: "Beginner",
    estHours: 8,
    topicsCount: 12,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-cyan-500",
    roadmapSlugs: ["portfolio-builder"],
    topics: [
      topic("hack-why", "Why hackathons beat 100 LeetCode", [
        ["hack-leverage", "SIH offer + LinkedIn signal", 14],
      ]),
      topic("hack-types", "5 hackathon types", [
        ["devfolio-sih", "Devfolio / SIH / college fests / company / private", 18],
      ]),
      topic("pre-hack", "Pre-hack 7-day prep", [
        ["team-scaffold", "Team formation + scaffolds + cloud credits", 18],
      ]),
      topic("during-hack", "During-hack 48hr playbook", [
        ["48hr", "Hour-by-hour schedule + demo-first rule", 22],
      ]),
      topic("pitch", "Pitch + judging", [
        ["pitch-3min", "3-min pitch structure + Indian-judge framing", 16],
      ]),
      topic("bip-why", "Why Build-in-Public is hiring leverage", [
        ["bip-stakes", "LinkedIn India engineering community", 16],
      ]),
      topic("bip-content", "What to post + cadence", [
        ["post-types", "5 post categories + 1-3/week + tech-career split", 22],
      ]),
      topic("li-vs-x", "LinkedIn vs X (Twitter)", [
        ["cross-post", "Audience deltas + cross-post strategy", 16],
      ]),
      topic("freelance-why", "Why freelancing as a student", [
        ["freelance-leverage", "Real-money portfolio + business thinking", 14],
      ]),
      topic("freelance-platforms", "Where to find work", [
        ["upwork-topmate", "Upwork / Topmate / PeoplePerHour / Cutshort / direct DMs", 22],
      ]),
      topic("pricing-sow", "Pricing + SOW + first contract", [
        ["sow-template", "Pricing bands + milestone payments + SOW template", 22],
      ]),
      topic("tax", "Indian-specific tax + paperwork", [
        ["pan-itr-gst", "PAN / ITR / GST + invoice template", 14],
      ]),
    ],
  },
  {
    slug: "cpp-mastery",
    title: "C / C++ Mastery",
    description:
      "Pointers + memory + STL + OOP + smart pointers + templates + move semantics + modern C++17/20. The DSA-primary language for Indian contest culture (Codeforces / CodeChef / ICPC).",
    category: "Languages",
    difficulty: "Intermediate",
    estHours: 30,
    topicsCount: 14,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-cyan-500",
    roadmapSlugs: ["product-company-cracker"],
    topics: [
      topic("cpp-why", "Why C++ for DSA + systems", [
        ["cpp-stakes", "Indian contest culture + when C++ wins", 18],
      ]),
      topic("compilation", "Compilation model", [
        ["gpp-flow", "g++ pipeline + headers + include guards", 16],
      ]),
      topic("pointers", "Pointers + References", [
        ["pointer-arith", "Pointer arithmetic + null + dereferencing", 22],
        ["pointer-bugs", "Common pointer bugs + 3 worked examples", 22],
      ]),
      topic("memory", "Memory model", [
        ["stack-heap", "Stack vs heap + new/delete + RAII", 22],
      ]),
      topic("stl-containers", "STL Containers", [
        ["stl-seq", "vector / array / list / deque", 22],
        ["stl-set-map", "set / map / unordered_set / unordered_map", 22],
        ["stl-adapters", "stack / queue / priority_queue / bitset", 18],
      ]),
      topic("stl-algorithms", "STL Algorithms", [
        ["stl-sort", "sort / partial_sort / stable_sort", 18],
        ["stl-search", "lower_bound / upper_bound / binary search", 20],
        ["stl-dsa-5", "5 worked DSA examples using STL", 22],
      ]),
      topic("oop-cpp", "Object-Oriented C++", [
        ["rule-of-3-5", "Rule of 0/3/5 + virtual destructors", 24],
        ["polymorphism", "Inheritance + vtable + override/final", 22],
      ]),
      topic("smart-ptrs", "Smart Pointers", [
        ["unique-shared", "unique_ptr / shared_ptr / weak_ptr + cycles", 20],
      ]),
      topic("templates", "Templates + Generics", [
        ["template-spec", "Templates + specialisation + concepts (C++20)", 22],
      ]),
      topic("move-semantics", "Move Semantics + Rvalue Refs", [
        ["std-move", "std::move + std::forward + RVO", 18],
      ]),
      topic("modern-cpp", "Modern C++ (17/20/23)", [
        ["modern-features", "auto / structured bindings / optional / ranges", 18],
      ]),
      topic("dsa-patterns", "DSA-specific patterns", [
        ["fast-io", "Fast I/O + custom hash + PBDS ordered_set", 18],
      ]),
      topic("interview", "Top 30 C++ interview questions", [
        ["cpp-30", "Q+A table", 16],
      ]),
    ],
  },
  {
    slug: "ml-engineer",
    title: "ML Engineer / Data Scientist",
    description:
      "Math foundations + classical ML (regression, trees, GBM, SVM) + DL intro + training pipeline + evaluation metrics + MLOps. Distinct from Data Analyst (analytics) and GenAI (LLMs).",
    category: "Data & ML",
    difficulty: "Advanced",
    estHours: 32,
    topicsCount: 12,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-cyan-500",
    roadmapSlugs: ["ml-engineer", "genai-developer"],
    topics: [
      topic("mle-why", "Why ML Engineering — vs DA / GenAI", [
        ["mle-roles", "Indian product co teams + salary bands", 22],
      ]),
      topic("math", "Math foundations (just enough)", [
        ["math-linalg", "Linear algebra + calculus", 24],
        ["math-prob-stats", "Probability + statistics + A/B testing", 24],
      ]),
      topic("data-prep", "Data preparation + EDA", [
        ["pandas-eda", "Pandas walkthrough + missing values + outliers", 22],
        ["feature-eng", "Encoding + scaling + leakage prevention", 22],
      ]),
      topic("classical-ml", "Classical ML algorithms", [
        ["linear-models", "Linear / logistic regression", 22],
        ["trees", "Decision trees / RF / XGBoost / LightGBM", 24],
        ["clustering", "K-Means / DBSCAN + SVM kernel trick", 18],
      ]),
      topic("deep-learning", "Deep Learning intro", [
        ["mlp-cnn-rnn", "MLP / CNN / RNN — when each wins", 22],
      ]),
      topic("training", "Training pipeline", [
        ["loss-optim", "Loss / optimisers / regularisation", 22],
      ]),
      topic("evaluation", "Evaluation metrics", [
        ["clf-metrics", "Precision / recall / F1 / ROC-AUC", 24],
        ["confusion-matrix", "Confusion matrix walkthrough", 18],
      ]),
      topic("cv-tuning", "CV + hyperparameter tuning", [
        ["k-fold-optuna", "K-fold / Optuna / leakage in CV", 18],
      ]),
      topic("mlops", "MLOps + productionising", [
        ["serving", "FastAPI / MLflow / Feast / drift monitoring", 24],
      ]),
      topic("business", "Business framing", [
        ["cost-sensitive", "Translating KPIs + cost-sensitive thresholds", 18],
      ]),
      topic("interview", "Top 30 ML interview questions", [
        ["mle-30", "Q+A table", 18],
      ]),
    ],
  },
  {
    slug: "infosys-sp-playbook",
    title: "Infosys SP / Power Programmer Playbook",
    description:
      "Volume #2 after TCS NQT. SP (8 LPA) + PP (11.25 LPA) tier-specific strategy on top of aptitude. Pseudocode round, HackerEarth coding patterns, technical-flavoured HR, 90-day prep plan.",
    category: "Interview Craft",
    difficulty: "Beginner",
    estHours: 16,
    topicsCount: 10,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-cyan-500",
    roadmapSlugs: ["infosys-sp-cracker", "service-company-cracker"],
    topics: [
      topic("inf-tiers", "Infosys SE / SP / PP tiers", [
        ["inf-tiers-eligibility", "Salary bands + eligibility + when to attempt", 22],
      ]),
      topic("inf-structure", "Test structure", [
        ["inf-5sections", "Logical + Quant + Verbal + Pseudocode + Coding", 22],
      ]),
      topic("pseudocode", "Pseudocode round — secret weapon", [
        ["pseudo-10", "10 worked pseudocode examples + traps", 28],
      ]),
      topic("inf-coding", "Coding round (SP)", [
        ["sp-5", "5 worked Python solutions on HackerEarth", 28],
      ]),
      topic("pp-coding", "Coding round (PP)", [
        ["pp-3", "3 worked PP-level problems (BFS / DP / strings)", 24],
      ]),
      topic("inf-tilts", "Quant + Logical + Verbal — Infosys tilts", [
        ["inf-aptitude", "30-question rapid drill + cross-refs", 18],
      ]),
      topic("inf-hr", "Infosys HR Round", [
        ["inf-hr-8", "Technical-flavoured HR + 8 model Q&A", 20],
      ]),
      topic("inf-plan", "90-day prep plan", [
        ["inf-week-by-week", "Week-by-week + mocks", 18],
      ]),
      topic("inf-tricky", "Top 25 recurring questions", [
        ["inf-rapid-table", "Rapid-reference table", 14],
      ]),
      topic("inf-checklist", "Pre-test checklist", [
        ["inf-pre-test", "Day-before ritual", 10],
      ]),
    ],
  },
  {
    slug: "capstone-bank",
    title: "20-Project Capstone Bank",
    description:
      "Portfolio-grade project ideas — 20 capstones across MERN / Backend / Mobile / Data-ML / DevOps / Systems / GenAI. Each has stack, build outline, time estimate, resume bullet, gotcha. Built for shipping, not learning.",
    category: "Portfolio",
    difficulty: "Intermediate",
    estHours: 12,
    topicsCount: 10,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-cyan-500",
    roadmapSlugs: ["portfolio-builder"],
    topics: [
      topic("why-projects", "Why capstones beat coding contests", [
        ["projects-recruiter", "GitHub + deployed link > LeetCode rating", 18],
      ]),
      topic("quality-bars", "5 quality bars every capstone meets", [
        ["five-bars", "Hosted + README + auth + non-trivial + quantified", 18],
      ]),
      topic("mern-projects", "MERN / Web track — 5 projects", [
        ["mern-5", "Whiteboard / Splitwise / Mess / Notes-AI / RZP-fake", 28],
      ]),
      topic("backend-projects", "Backend-heavy track — 4 projects", [
        ["backend-4", "URL shortener / rate limiter / leaderboard / OAuth2", 24],
      ]),
      topic("mobile-projects", "Mobile track — 3 projects", [
        ["mobile-3", "Recipe app / college food / period tracker", 22],
      ]),
      topic("data-projects", "Data / ML track — 3 projects", [
        ["data-3", "IPL predictor / resume-JD matcher / news summariser", 22],
      ]),
      topic("devops-projects", "DevOps / Infra — 2 projects", [
        ["devops-2", "K8s 3-tier + GitHub Actions CI/CD", 18],
      ]),
      topic("systems-projects", "Systems / Low-level — 2 projects", [
        ["systems-2", "Mini-Redis + Build your own Git", 18],
      ]),
      topic("ai-project", "AI / GenAI — 1 project", [
        ["ai-1", "RAG chatbot for your college FAQ", 14],
      ]),
      topic("ship-cadence", "Ship 3 projects in 90 days", [
        ["readme-template", "Build cadence + README template + resume bullets", 20],
      ]),
    ],
  },
  {
    slug: "open-source-guide",
    title: "Open Source Contribution Guide",
    description:
      "OSS beats LeetCode-only. GSoC / MLH Fellowship / LFX Mentorship / Hacktoberfest paths, finding good first issues, PR workflow, code review handling, the 6-month maintainer trajectory.",
    category: "Portfolio",
    difficulty: "Beginner",
    estHours: 10,
    topicsCount: 10,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-cyan-500",
    roadmapSlugs: ["portfolio-builder"],
    topics: [
      topic("oss-why", "Why OSS beats LeetCode-only", [
        ["oss-recruiter", "GitHub heatmap as a hiring signal", 18],
      ]),
      topic("programs", "4 flagship programs", [
        ["gsoc", "GSoC + MLH Fellowship + LFX + Hacktoberfest", 26],
      ]),
      topic("find-issues", "Finding good first issues", [
        ["repo-checklist", "Is-this-repo-alive 7-point checklist", 22],
      ]),
      topic("pr-workflow", "PR-writing workflow", [
        ["fork-pr", "Fork → branch → conventional commits → PR", 24],
      ]),
      topic("code-review", "Handling code review", [
        ["review-respond", "Thank-then-fix-or-explain framework", 20],
      ]),
      topic("maintainer", "6-month maintainer reputation", [
        ["maintainer-trajectory", "Good-first-issue → feature → triage", 20],
      ]),
      topic("oss-resume", "OSS on resume + LinkedIn", [
        ["oss-bullets", "5 bad-vs-good resume bullets + Featured trick", 20],
      ]),
      topic("repo-recs", "Repo recommendations by track", [
        ["repos-by-track", "Web / Python / Mobile / AI / DevOps", 22],
      ]),
      topic("30-day-plan", "30-day first-PR plan", [
        ["first-pr-30", "Week-by-week from setup to merge", 18],
      ]),
      topic("oss-checklist", "Pre-PR checklist", [
        ["pre-pr", "Final-look ritual", 10],
      ]),
    ],
  },
  {
    slug: "tcs-nqt-playbook",
    title: "TCS NQT Complete Playbook",
    description:
      "TCS-specific strategy on top of aptitude basics. Foundation + Advanced sections, section-by-section ROI, hands-on coding patterns (Python), email writing, HR round, 60-day prep plan.",
    category: "Interview Craft",
    difficulty: "Beginner",
    estHours: 18,
    topicsCount: 13,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-cyan-500",
    roadmapSlugs: ["tcs-nqt-cracker", "service-company-cracker"],
    topics: [
      topic("nqt-what", "What TCS NQT actually is", [
        ["nqt-history", "NQT vs NQTm vs NQT-IT, eligibility, score thresholds", 22],
      ]),
      topic("nqt-structure", "The full test structure", [
        ["nqt-foundation", "Foundation section — Q/time/sec-per-Q breakdown", 22],
        ["nqt-advanced", "Advanced section + score-to-shortlist mapping", 18],
      ]),
      topic("nqt-numerical", "Numerical — TCS-specific strategy", [
        ["nqt-num-traps", "Topic frequency + 5 unique TCS traps", 20],
      ]),
      topic("nqt-verbal", "Verbal — TCS-specific strategy", [
        ["nqt-verbal-50", "50-word recurring vocabulary", 20],
      ]),
      topic("nqt-reasoning", "Reasoning — TCS-specific strategy", [
        ["nqt-reason-ds", "DS + arrangement-puzzle ROI", 20],
      ]),
      topic("nqt-plq", "Programming Logic Questions (PLQ)", [
        ["nqt-plq-10", "10 worked output-prediction examples", 22],
      ]),
      topic("nqt-coding", "Hands-on Coding Round", [
        ["nqt-coding-5", "5 worked Python solutions + edge cases", 28],
      ]),
      topic("nqt-advanced", "Advanced Coding Round", [
        ["nqt-adv-3", "3 worked Advanced problems (DP, sliding window, BFS)", 26],
      ]),
      topic("nqt-email", "Email Writing", [
        ["nqt-email-5", "5 model emails + 10 auto-fail mistakes", 20],
      ]),
      topic("nqt-hr", "TCS HR Round", [
        ["nqt-hr-8", "8 model Q&A + the 1.5-yr bond strategy", 20],
      ]),
      topic("nqt-plan", "60-day prep plan", [
        ["nqt-week-by-week", "Week-by-week + 17-mock schedule", 20],
      ]),
      topic("nqt-tricky", "Top 30 trickiest questions", [
        ["nqt-rapid-table", "Rapid-reference table", 16],
      ]),
      topic("nqt-checklist", "Pre-test checklist", [
        ["nqt-pre-test", "Result-day + day-before ritual", 12],
      ]),
    ],
  },
  {
    slug: "nodejs-backend",
    title: "Node.js + Express + Backend",
    description:
      "Event loop deep-dive, async patterns, Express fundamentals, REST API design, JWT/session auth, Zod validation, DB integration (Postgres/Mongo), production deployment. The MERN backend half.",
    category: "Web Development",
    difficulty: "Intermediate",
    estHours: 28,
    topicsCount: 11,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-cyan-500",
    roadmapSlugs: ["mern-stack-developer", "product-company-cracker"],
    topics: [
      topic("node-why", "Why Node.js for backend", [
        ["node-stakes", "Event loop premise + when Node wins/loses", 20],
      ]),
      topic("event-loop", "The event loop deep-dive", [
        ["loop-phases", "libuv + 6 phases + microtasks", 26],
        ["loop-quiz", "setTimeout vs setImmediate vs Promise ordering", 18],
      ]),
      topic("async-patterns", "Async patterns", [
        ["promise-async", "Callbacks → Promises → async/await", 22],
        ["promise-combinators", "all / allSettled / race / any", 20],
      ]),
      topic("express-fundamentals", "Express fundamentals", [
        ["middleware", "Middleware chain + ordering recipe", 24],
        ["routing", "Routing + req/res shape", 20],
      ]),
      topic("rest-design", "REST API design", [
        ["rest-status", "Status codes + idempotency + pagination", 22],
      ]),
      topic("auth", "Authentication + Authorization", [
        ["jwt-session", "JWT vs session + refresh tokens", 26],
      ]),
      topic("validation-errors", "Validation + Error handling", [
        ["zod-errors", "Zod schemas + centralised error middleware", 20],
      ]),
      topic("db-integration", "Database integration", [
        ["pg-mongo", "Postgres (Drizzle/Prisma) + MongoDB", 22],
      ]),
      topic("testing", "Testing", [
        ["test-vitest", "Vitest + supertest + msw + DB strategies", 20],
      ]),
      topic("deploy", "Production deployment", [
        ["pm2-vercel", "PM2 / Docker / Vercel + observability", 22],
      ]),
      topic("interview", "Top 30 Node/Express interview questions", [
        ["node-30", "Q+A table", 18],
      ]),
    ],
  },
  {
    slug: "python-mastery",
    title: "Python Mastery",
    description:
      "Pythonic idioms, data structures, comprehensions + generators, decorators, OOP + dunders, asyncio, type hints, stdlib essentials, packaging, pytest. For DSA + ML + scripting + TCS coding round.",
    category: "Languages",
    difficulty: "Intermediate",
    estHours: 26,
    topicsCount: 12,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-cyan-500",
    roadmapSlugs: [
      "tcs-nqt-cracker",
      "service-company-cracker",
      "genai-developer",
    ],
    topics: [
      topic("python-why", "Why Python — and when not", [
        ["python-stakes", "When Python wins / loses + the GIL", 18],
      ]),
      topic("idioms", "Pythonic idioms", [
        ["pythonic", "f-strings, walrus, slicing grammar, EAFP", 22],
      ]),
      topic("data-structures", "Built-in data structures", [
        ["containers", "list / tuple / set / dict + Big-O", 24],
        ["collections", "defaultdict / Counter / deque / heapq / bisect", 20],
      ]),
      topic("comprehensions", "Comprehensions + Generators", [
        ["generators", "list/set/dict comp + yield + generator pipelines", 22],
      ]),
      topic("functions-decorators", "Functions + Decorators", [
        ["decorators", "args/kwargs + decorators-with-args + functools", 24],
      ]),
      topic("oop-dunders", "OOP + Dunder methods", [
        ["mro-dunders", "MRO + dataclass + ABCs + dunders", 28],
        ["money-class", "Worked example: Money class arithmetic", 18],
      ]),
      topic("async-python", "Async Python", [
        ["asyncio", "asyncio + Semaphore + bounded concurrency", 22],
      ]),
      topic("typing", "Type hints + mypy", [
        ["typing-strict", "Generics + Protocol + mypy strict", 20],
      ]),
      topic("stdlib", "Stdlib essentials", [
        ["stdlib-pathlib", "pathlib / argparse / re / datetime / logging", 22],
      ]),
      topic("packaging", "Packaging + virtualenv", [
        ["uv-poetry", "venv / poetry / uv + pyproject.toml + PyPI", 18],
      ]),
      topic("pytest", "Testing with pytest", [
        ["pytest-fixtures", "Fixtures + parametrize + mocking", 18],
      ]),
      topic("interview", "Top 30 Python interview questions", [
        ["python-30", "Q+A table", 16],
      ]),
    ],
  },
  {
    slug: "android-kotlin",
    title: "Android Development with Kotlin",
    description:
      "Modern Android stack — Kotlin essentials, Jetpack Compose, ViewModel + StateFlow (UDF), Room DB, Retrofit, Navigation, Hilt DI, Coroutines + Flow, testing, Play Store deployment.",
    category: "Mobile",
    difficulty: "Intermediate",
    estHours: 32,
    topicsCount: 14,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-cyan-500",
    roadmapSlugs: ["android-developer"],
    topics: [
      topic("android-why", "Why Android (and Kotlin)", [
        ["android-stakes", "India hiring bands at Swiggy/Zomato/PhonePe/CRED", 20],
      ]),
      topic("kotlin-essentials", "Kotlin essentials for Android", [
        ["kotlin-null", "Null safety + scope functions + sealed classes", 26],
        ["kotlin-coroutines", "Coroutines + Flow primer", 22],
      ]),
      topic("project-gradle", "Project structure + Gradle", [
        ["gradle-kts", "Gradle KTS + version catalog + ProGuard/R8", 18],
      ]),
      topic("lifecycle", "Activities, Fragments, Lifecycle", [
        ["activity-lifecycle", "Activity + Fragment lifecycle + config changes", 26],
      ]),
      topic("compose", "Jetpack Compose", [
        ["compose-recomp", "Composables + recomposition + state hoisting", 28],
        ["compose-effects", "remember / Effect APIs / modifier order", 22],
        ["compose-counter", "Worked Counter screen", 18],
      ]),
      topic("viewmodel-state", "State management + ViewModel", [
        ["udf", "Unidirectional data flow + StateFlow", 24],
        ["todo-vm", "Worked TodoList feature", 22],
      ]),
      topic("navigation", "Navigation Compose", [
        ["nav-typesafe", "Type-safe routes + deep links", 18],
      ]),
      topic("room", "Persistence — Room", [
        ["room-relations", "Worked recipe DB with relations + migrations", 24],
      ]),
      topic("retrofit", "Networking — Retrofit + OkHttp", [
        ["retrofit-interceptors", "Interface + interceptors + error handling", 20],
      ]),
      topic("coroutines-flow", "Coroutines + Flow deep-dive", [
        ["dispatchers", "Dispatchers + cold vs hot flows + collectAsStateWithLifecycle", 24],
      ]),
      topic("hilt", "Hilt DI", [
        ["hilt-modules", "@HiltAndroidApp + @Module + @Singleton", 18],
      ]),
      topic("testing", "Testing", [
        ["android-tests", "Unit (JUnit + MockK) + Compose UI + Espresso", 16],
      ]),
      topic("playstore", "Play Store deployment", [
        ["aab-rollout", "Signing + AAB + phased rollout", 14],
      ]),
    ],
  },
  {
    slug: "aptitude-logical",
    title: "Aptitude — Logical Reasoning",
    description:
      "The silent filter — coding-decoding, series, blood relations, syllogisms (Venn-diagram method), seating arrangement, puzzles, data sufficiency, cubes & dice. Slow-vs-fast worked examples throughout.",
    category: "Interview Craft",
    difficulty: "Beginner",
    estHours: 14,
    topicsCount: 11,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-cyan-500",
    roadmapSlugs: ["service-company-cracker"],
    topics: [
      topic("logical-why", "Why Logical Reasoning is the silent filter", [
        ["logical-stakes", "TCS NQT structure + 80-sec budget reality", 16],
      ]),
      topic("coding-decoding", "Coding-Decoding", [
        ["cd-shifts", "Letter shifts + position-based + symbol substitution", 22],
      ]),
      topic("series", "Number / Letter Series", [
        ["series-patterns", "AP / GP / alternating / square-based", 20],
      ]),
      topic("blood-rel", "Blood Relations", [
        ["br-graph", "Directed-graph approach + photo + 3-gen problems", 22],
      ]),
      topic("direction", "Direction Sense", [
        ["dir-coords", "Coordinate-plane technique + bearing", 20],
      ]),
      topic("syllogisms", "Syllogisms", [
        ["syll-venn", "Venn-diagram 3-circle trick + decoder", 22],
      ]),
      topic("seating", "Seating Arrangement", [
        ["seat-linear", "Linear / circular / square — 5-min worked example", 26],
      ]),
      topic("puzzles", "Puzzle Sets", [
        ["puzzle-grid", "Comparison + attribute matching + scheduling", 22],
      ]),
      topic("statement", "Statement & Conclusion / Assumption", [
        ["stmt-decoder", "Definitely follows vs may follow", 18],
      ]),
      topic("data-sufficiency", "Data Sufficiency", [
        ["ds-5option", "5-option framework + 3 worked examples", 18],
      ]),
      topic("cubes-dice", "Cubes & Dice", [
        ["cubes-painted", "Painted-cube small-cubes + dice rotation", 18],
      ]),
    ],
  },
  {
    slug: "aptitude-verbal",
    title: "Aptitude — Verbal",
    description:
      "RC techniques, sentence correction (subject-verb, modifier, parallelism, idioms), para jumbles, cloze, synonyms/antonyms by Latin/Greek roots, critical reasoning, 100-word vocab table.",
    category: "Interview Craft",
    difficulty: "Beginner",
    estHours: 12,
    topicsCount: 9,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-cyan-500",
    roadmapSlugs: ["service-company-cracker"],
    topics: [
      topic("verbal-why", "Why verbal kills tier-2/3 placements", [
        ["verbal-stakes", "TCS NQT verbal — 5 traps that tank scores", 16],
      ]),
      topic("rc", "Reading Comprehension", [
        ["rc-pass-types", "Passage + question types + 3-pass technique", 26],
        ["rc-worked", "Worked Swiggy passage with 5 questions", 22],
      ]),
      topic("sentence-correction", "Sentence Correction", [
        ["sc-sva", "Subject-verb agreement + tense consistency", 24],
        ["sc-modifier", "Modifier placement + parallelism", 22],
        ["sc-idioms", "Idiom-preposition trap + comparatives", 20],
      ]),
      topic("para-jumbles", "Para Jumbles + Completion", [
        ["pj-ladder", "Opener detection + transition-word ladder", 20],
      ]),
      topic("cloze", "Sentence Completion / Cloze", [
        ["cloze-cues", "Context + valence cues", 18],
      ]),
      topic("syn-ant", "Synonyms / Antonyms by roots", [
        ["roots-table", "Latin / Greek root shortcuts", 20],
      ]),
      topic("critical", "Critical Reasoning", [
        ["cr-types", "Assumption / strengthen / weaken / inference", 22],
      ]),
      topic("vocab", "100-word vocabulary table", [
        ["vocab-100", "Most-asked words at TCS NQT / Infosys SP", 22],
      ]),
      topic("idioms", "One-word substitution + Idioms", [
        ["idioms-60", "Top 60 of each, table format", 16],
      ]),
    ],
  },
  {
    slug: "os-complete",
    title: "Operating Systems Complete",
    description:
      "Process vs Thread, CPU scheduling (FCFS → CFS), synchronisation (mutex/semaphore/monitor), deadlock, virtual memory + page replacement, file systems, I/O. Linux internals + Indian product-co war stories.",
    category: "Interview Craft",
    difficulty: "Intermediate",
    estHours: 24,
    topicsCount: 9,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-cyan-500",
    roadmapSlugs: [
      "service-company-cracker",
      "product-company-cracker",
      "java-full-stack",
    ],
    topics: [
      topic("os-why", "Why OS matters for placement + production", [
        ["os-stakes", "Production moments OS knowledge decides outcomes", 20],
      ]),
      topic("process-thread", "Process vs Thread", [
        ["proc-pcb", "Address space, PCB, fork/exec/wait", 24],
        ["thread-models", "Kernel vs user threads, M:N, Linux clone()", 24],
      ]),
      topic("scheduling", "CPU Scheduling", [
        ["sched-classic", "FCFS / SJF / SRTF / Priority / RR / MLFQ", 26],
        ["cfs-internals", "Linux CFS — vruntime + red-black tree", 22],
      ]),
      topic("sync", "Synchronisation", [
        ["race-cond", "Race conditions + bank-balance worked example", 24],
        ["mutex-sem", "Mutex / semaphore / monitor + classic problems", 28],
      ]),
      topic("deadlock", "Deadlock", [
        ["deadlock-4", "4 conditions + Banker's algorithm worked example", 26],
      ]),
      topic("memory", "Virtual Memory", [
        ["paging", "Paging / TLB / multi-level page tables", 26],
        ["page-replace", "FIFO / LRU / Clock + Belady's anomaly", 22],
      ]),
      topic("filesystems", "File Systems", [
        ["fs-inode", "ext4 inode / FAT / journaling / allocation strategies", 22],
      ]),
      topic("io", "I/O Systems", [
        ["io-async", "Polling / interrupts / DMA / epoll / io_uring", 18],
      ]),
    ],
  },
  {
    slug: "networks-complete",
    title: "Computer Networks Complete",
    description:
      "OSI / TCP-IP, IP addressing + subnetting math, TCP vs UDP (3-way handshake + congestion control), HTTP 1/2/3, DNS, TLS, sockets, load balancing. Indian product-co latency war stories throughout.",
    category: "Interview Craft",
    difficulty: "Intermediate",
    estHours: 22,
    topicsCount: 11,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-cyan-500",
    roadmapSlugs: [
      "service-company-cracker",
      "product-company-cracker",
      "cloud-devops-engineer",
    ],
    topics: [
      topic("net-why", "Why Networks decide production outcomes", [
        ["net-stakes", "CDN / TLS / DNS production stories", 18],
      ]),
      topic("osi-tcpip", "OSI 7 + TCP/IP 4 layers", [
        ["layer-mapping", "Side-by-side mapping + modern stack", 22],
      ]),
      topic("phys-link", "Physical + Data Link", [
        ["mac-arp", "MAC / ARP / Ethernet / switches", 16],
      ]),
      topic("ip-subnet", "IP addressing + subnetting", [
        ["ipv4-cidr", "Classful → CIDR + subnet math", 24],
        ["subnet-worked", "Worked /16 → /18 split", 22],
        ["ipv6-nat", "IPv6 + NAT + private ranges", 18],
      ]),
      topic("tcp-udp", "TCP vs UDP", [
        ["tcp-3way", "3-way handshake + sliding window", 24],
        ["congestion", "Slow start / AIMD / fast retransmit / fast recovery", 24],
        ["tcp-states", "TCP states + when UDP wins + QUIC", 22],
      ]),
      topic("http", "HTTP versions + REST/gRPC/WS", [
        ["http-versions", "HTTP/1 / 2 / 3 — what changed", 22],
        ["rest-vs-grpc", "REST / gRPC / GraphQL / WebSocket comparison", 22],
        ["status-codes", "Status-code interview hot-zone", 18],
      ]),
      topic("dns", "DNS", [
        ["dns-records", "Recursive / iterative + record types + TTL", 22],
      ]),
      topic("tls", "TLS / SSL", [
        ["tls-handshake", "TLS 1.2 vs 1.3 handshake + certs + mTLS", 24],
      ]),
      topic("sockets", "Sockets programming", [
        ["sockets-poll", "select / poll / epoll progression", 20],
      ]),
      topic("load-balancing", "Load balancing + reverse proxies", [
        ["lb-l4-l7", "L4 vs L7 + HAProxy / nginx / cloud LBs", 22],
      ]),
    ],
  },
  {
    slug: "resume-behavioural",
    title: "Resume + LinkedIn + Behavioural STAR",
    description:
      "ATS-friendly 1-pager rules, X-by-Y-Z quantification (10 bad-vs-good rewrites), section-by-section template, LinkedIn optimisation, STAR method deep-dive, top 20 behavioural Qs with example answers, salary-negotiation cheatsheet.",
    category: "Interview Craft",
    difficulty: "Beginner",
    estHours: 10,
    topicsCount: 10,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-cyan-500",
    roadmapSlugs: [
      "service-company-cracker",
      "product-company-cracker",
      "java-full-stack",
    ],
    topics: [
      topic("resume-truth", "The brutal truth about resume + HR", [
        ["resume-stakes", "ATS rejects 75% before a human sees it", 18],
      ]),
      topic("ats-rules", "ATS-friendly 1-pager rules", [
        ["ats-12", "12 concrete formatting rules", 22],
      ]),
      topic("xyz-framework", "Quantification framework (X-by-Y-Z)", [
        ["xyz-bullets", "10 bad-vs-good rewrites across role types", 26],
      ]),
      topic("section-template", "Section-by-section template", [
        ["section-header", "Header / Summary / Experience / Skills / Education", 26],
        ["fresher-sample", "Complete fresher resume sample", 22],
      ]),
      topic("linkedin", "LinkedIn optimisation", [
        ["linkedin-220", "Custom URL + 220-char headline + About + Featured", 24],
        ["linkedin-recos", "Recommendations script + Open-to-work toggle", 18],
      ]),
      topic("hr-round", "The HR / Behavioural round", [
        ["hr-3qs", "Three big questions + Indian-specific quirks", 22],
      ]),
      topic("star-method", "STAR method deep-dive", [
        ["star-5", "5 worked STAR answers — leadership/conflict/failure", 26],
      ]),
      topic("top20-behavioural", "Top 20 behavioural questions", [
        ["behavioural-20", "STAR-formatted answers", 28],
      ]),
      topic("salary-neg", "Salary negotiation", [
        ["neg-5rules", "5-rule cheatsheet for the Indian market", 18],
      ]),
      topic("checklist-final", "Pre-interview checklist", [
        ["pre-checklist", "30-min pre-call ritual", 12],
      ]),
    ],
  },
  {
    slug: "aptitude-quant",
    title: "Aptitude — Quantitative",
    description:
      "The gateway subject — TCS NQT, Infosys SP, AMCAT, eLitmus all gate on this. Number system → percentages → P&L → ratios → averages → time/work → TSD → SI/CI → P&C → probability.",
    category: "Interview Craft",
    difficulty: "Beginner",
    estHours: 16,
    topicsCount: 11,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-cyan-500",
    roadmapSlugs: ["service-company-cracker"],
    topics: [
      topic("apt-why", "Why aptitude is the gate", [
        ["apt-tcs-nqt", "TCS NQT structure + 80-sec/question reality", 16],
      ]),
      topic("number-system", "Number system", [
        ["divisibility", "Divisibility rules + HCF/LCM", 22],
        ["remainders", "Remainder theorems + last-digit cyclicity", 22],
      ]),
      topic("percentages", "Percentages", [
        ["pct-basics", "Successive percentages + multiplication trick", 20],
      ]),
      topic("profit-loss", "Profit, Loss, Discount", [
        ["pl-mp-cp", "CP / SP / MP, false weight, discount stacking", 22],
      ]),
      topic("ratio-mix", "Ratio + Proportion + Mixture", [
        ["alligation", "Alligation rule + partnership", 22],
      ]),
      topic("averages", "Averages + age problems", [
        ["weighted-avg", "Weighted average + replacement", 20],
      ]),
      topic("time-work", "Time + Work", [
        ["work-rate", "Efficiency, alternating days, pipes & cisterns", 22],
      ]),
      topic("tsd", "Time, Speed, Distance", [
        ["tsd-trains", "Trains, boats & streams, relative speed", 26],
      ]),
      topic("si-ci", "Simple + Compound Interest", [
        ["si-ci-tricks", "Half-yearly compounding + shortcuts", 18],
      ]),
      topic("perm-comb", "Permutations + Combinations", [
        ["pnc-circular", "Circular + repetition + identical objects", 20],
      ]),
      topic("probability", "Probability", [
        ["prob-cond", "Conditional + dice/coin/cards", 18],
      ]),
    ],
  },
  {
    slug: "lld-design",
    title: "Low-Level Design (LLD) for Interviews",
    description:
      "Master the 4-step LLD framework. Worked examples — Parking Lot, Splitwise, BookMyShow — plus SOLID + 6 essential design patterns.",
    category: "Interview Craft",
    difficulty: "Intermediate",
    estHours: 14,
    topicsCount: 10,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-cyan-500",
    roadmapSlugs: ["product-company-cracker", "java-full-stack"],
    topics: [
      topic("lld-vs-hld", "LLD vs HLD", [
        ["lld-decoder", "Tell HLD and LLD apart in 60 seconds", 18],
      ]),
      topic("lld-framework", "The 4-step LLD framework", [
        ["lld-step-1", "Step 1 — Requirements clarification", 22],
        ["lld-step-2", "Step 2 — Identify entities", 22],
        ["lld-step-3", "Step 3 — Class diagram + relationships", 24],
        ["lld-step-4", "Step 4 — Code skeleton + key methods", 22],
      ]),
      topic("lld-principles", "SOLID + composition over inheritance", [
        ["solid-applied", "SOLID applied to LLD problems", 24],
      ]),
      topic("lld-patterns", "6 patterns for 80% of problems", [
        ["pattern-strategy", "Strategy + Factory", 22],
        ["pattern-state", "State + Observer", 22],
        ["pattern-other", "Singleton + Decorator", 22],
      ]),
      topic("lld-parking", "Worked example: Parking Lot", [
        ["parking-design", "End-to-end design walkthrough", 30],
      ]),
      topic("lld-splitwise", "Worked example: Splitwise", [
        ["splitwise-design", "Strategy pattern + balance bookkeeping", 30],
      ]),
      topic("lld-bookmyshow", "Worked example: BookMyShow", [
        ["bms-design", "State machine + concurrent seat booking", 32],
      ]),
      topic("lld-pitfalls", "Common pitfalls", [
        ["lld-pitfalls", "8 anti-patterns interviewers flag instantly", 18],
      ]),
      topic("lld-practice", "30-problem practice ladder", [
        ["lld-practice-list", "Ordered top-30 LLD problem set", 16],
      ]),
      topic("lld-checklist", "Final interview checklist", [
        ["lld-checklist-item", "Pre-interview 60-second checklist", 12],
      ]),
    ],
  },
  {
    slug: "messaging-systems",
    title: "Messaging Systems",
    description: "Pub/Sub, Message queues, Apache Kafka, RabbitMQ.",
    category: "System Design",
    difficulty: "Advanced",
    estHours: 12,
    topicsCount: 4,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-indigo-500 to-purple-500",
    roadmapSlugs: ["cloud-devops-engineer"],
    topics: [
      topic("pub-sub", "Pub/Sub", [["pubsub-basics", "Publish-Subscribe pattern", 20]]),
      topic("message-queues", "Message queues", [["mq-patterns", "Queue patterns, work distribution", 22]]),
      topic("kafka", "Apache Kafka", [["kafka-deep", "Topics, partitions, consumer groups, exactly-once", 26]]),
      topic("rabbitmq", "RabbitMQ", [["rabbit-deep", "Exchanges, queues, bindings, routing keys", 24]]),
    ],
  },

  // =====================================================================
  // CLOUD (2)
  // =====================================================================
  {
    slug: "cloud-fundamentals",
    title: "Cloud Fundamentals",
    description: "Cloud basics, IaaS/PaaS/SaaS, load balancing, auto-scaling, CDN, multi-region.",
    category: "Cloud",
    difficulty: "Beginner",
    estHours: 10,
    topicsCount: 3,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-cyan-500 to-blue-500",
    roadmapSlugs: ["cloud-devops-engineer"],
    topics: [
      topic("cloud-basics", "Cloud computing basics", [["cloud-vs-onprem", "On-prem vs cloud, regions vs AZs", 22]]),
      topic("iaas-paas-saas", "IaaS, PaaS, SaaS", [["service-models", "Service models comparison", 20]]),
      topic("cloud-core-concepts", "Core concepts", [
        ["cloud-lb", "Load balancing", 18],
        ["cloud-autoscale", "Auto-scaling", 18],
        ["cloud-cdn", "CDN", 16],
        ["multi-region", "Multi-region deployment", 20],
      ]),
    ],
  },
  {
    slug: "cloud-platforms",
    title: "Cloud Platforms (AWS + GCP)",
    description: "AWS (IAM, EC2, S3, VPC, RDS, Lambda) + GCP (IAM, GCE, GCS, BigQuery).",
    category: "Cloud",
    difficulty: "Intermediate",
    estHours: 16,
    topicsCount: 2,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-amber-500 to-orange-500",
    roadmapSlugs: ["cloud-devops-engineer"],
    topics: [
      topic("aws", "Amazon Web Services", [
        ["aws-iam", "IAM — users, roles, policies", 20],
        ["aws-ec2", "EC2 — instances, AMIs, security groups", 22],
        ["aws-s3", "S3 — buckets, lifecycle, encryption", 22],
        ["aws-vpc", "VPC — subnets, route tables, NAT", 22],
        ["aws-rds", "RDS — managed databases", 18],
        ["aws-lambda", "Lambda — serverless functions", 20],
      ]),
      topic("gcp", "Google Cloud Platform", [
        ["gcp-iam", "IAM — projects, service accounts", 18],
        ["gcp-compute", "Compute Engine", 18],
        ["gcp-gcs", "Google Cloud Storage", 18],
        ["gcp-bigquery", "BigQuery", 22],
        ["gcp-functions", "Cloud Functions", 18],
      ]),
    ],
  },

  // =====================================================================
  // MONITORING (1)
  // =====================================================================
  {
    slug: "monitoring-observability",
    title: "Monitoring & Observability",
    description: "Centralized logging, metrics, alerting — ELK, Prometheus, Grafana.",
    category: "Monitoring",
    difficulty: "Intermediate",
    estHours: 10,
    topicsCount: 4,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-emerald-500 to-cyan-500",
    roadmapSlugs: ["cloud-devops-engineer"],
    topics: [
      topic("centralized-logging", "Centralized logging", [["structured-logs", "Structured logs, levels, retention", 22]]),
      topic("metrics-collection", "Metrics collection", [["counters-gauges-histograms", "Counters, gauges, histograms; cardinality", 24]]),
      topic("alerting", "Alerting", [["slo-sli-fatigue", "SLO/SLI, alert fatigue", 22]]),
      topic("monitoring-tools", "Tools", [
        ["elk-stack", "ELK Stack (ES + Logstash + Kibana)", 22],
        ["prometheus", "Prometheus", 22],
        ["grafana", "Grafana", 18],
      ]),
    ],
  },

  // =====================================================================
  // TESTING (1)
  // =====================================================================
  {
    slug: "software-testing",
    title: "Software Testing",
    description: "Unit, integration, E2E, mocking — testing pyramid.",
    category: "Testing",
    difficulty: "Intermediate",
    estHours: 8,
    topicsCount: 4,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-rose-500 to-orange-500",
    roadmapSlugs: ["java-full-stack", "senior-frontend-engineer"],
    topics: [
      topic("unit-testing", "Unit testing", [["unit-fundamentals", "Pure functions, fast feedback", 20]]),
      topic("integration-testing", "Integration testing", [["integration-basics", "Multiple components together", 22]]),
      topic("e2e-testing", "End-to-end testing", [["e2e-tools", "Browser-based, Playwright/Cypress", 22]]),
      topic("mocking", "Mocking", [["mocks-stubs-spies", "Stubs, spies, mocks — when to use what", 22]]),
    ],
  },

  // =====================================================================
  // ENGINEERING PRACTICES (2)
  // =====================================================================
  {
    slug: "clean-code-solid",
    title: "Clean Code & SOLID",
    description: "Naming, functions, comments + SOLID principles deeply.",
    category: "Engineering",
    difficulty: "Intermediate",
    estHours: 10,
    topicsCount: 2,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-cyan-500",
    roadmapSlugs: ["java-full-stack", "senior-frontend-engineer"],
    topics: [
      topic("clean-code", "Clean Code", [["clean-principles", "Naming, functions, comments, error handling", 24]]),
      topic("solid", "SOLID principles", [
        ["srp", "S — Single Responsibility", 18],
        ["ocp", "O — Open/Closed", 18],
        ["lsp", "L — Liskov Substitution", 20],
        ["isp", "I — Interface Segregation", 18],
        ["dip", "D — Dependency Inversion", 22],
      ]),
    ],
  },
  {
    slug: "design-patterns",
    title: "Design Patterns",
    description: "Singleton, Factory, Observer, Strategy — production se examples.",
    category: "Engineering",
    difficulty: "Intermediate",
    estHours: 8,
    topicsCount: 4,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-pink-500 to-violet-500",
    roadmapSlugs: ["java-full-stack"],
    topics: [
      topic("singleton", "Singleton", [["singleton-pattern", "When valid, when smell", 22]]),
      topic("factory", "Factory", [["factory-pattern", "Factory + Abstract Factory", 22]]),
      topic("observer", "Observer", [["observer-pattern", "Observer in real frameworks", 22]]),
      topic("strategy", "Strategy", [["strategy-pattern", "Plug-and-play algorithms", 22]]),
    ],
  },

  // =====================================================================
  // GEN AI DEVELOPER ROADMAP — Top 2% path (21 subjects across 9 phases)
  // =====================================================================
  // Phase 0 — Foundations
  {
    slug: "genai-math",
    title: "Mathematics for Gen AI",
    description: "Linear algebra, calculus, probability, info theory — Gen AI ka mathematical bedrock.",
    category: "Data & ML",
    difficulty: "Intermediate",
    estHours: 40,
    topicsCount: 4,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-fuchsia-500",
    roadmapSlugs: ["genai-developer"],
    topics: [
      topic("linear-algebra", "Linear Algebra", [
        ["vectors-norms", "Vectors, vector spaces, norms (L1, L2, cosine)", 22],
        ["matrices", "Matrices: multiplication, transpose, inverse, rank", 22],
        ["tensor-ops", "Tensor operations (broadcasting, reshape, einsum)", 20],
        ["eigen", "Eigenvalues, eigenvectors, eigendecomposition", 22],
        ["svd", "Singular Value Decomposition (SVD) — used in LoRA", 22],
        ["matrix-calculus", "Matrix calculus", 22],
      ]),
      topic("calculus", "Calculus", [
        ["derivatives", "Derivatives, partial derivatives", 18],
        ["chain-rule", "Chain rule (engine of backprop)", 20],
        ["gradients-jacobians", "Gradients, Jacobians, Hessians", 22],
        ["taylor-series", "Taylor series approximations", 18],
        ["multivariable-opt", "Multivariable optimization", 22],
      ]),
      topic("probability", "Probability & Statistics", [
        ["random-vars", "Random variables, PDFs, CDFs", 20],
        ["distributions", "Common distributions (Gaussian, Bernoulli, Categorical, Dirichlet)", 22],
        ["bayes", "Bayes' theorem & Bayesian thinking", 22],
        ["mle-map", "MLE & MAP", 22],
        ["sampling", "Sampling: Monte Carlo, importance, MCMC", 24],
        ["kl-cross-entropy", "KL divergence, cross-entropy, Jensen-Shannon", 24],
      ]),
      topic("info-theory", "Information Theory", [
        ["entropy", "Entropy, conditional entropy", 20],
        ["cross-entropy-likelihood", "Cross-entropy & relationship to likelihood", 20],
        ["perplexity", "Perplexity (the standard LLM metric)", 18],
        ["mutual-info", "Mutual information", 18],
      ]),
    ],
  },
  {
    slug: "genai-programming",
    title: "Programming Mastery for AI",
    description: "Advanced Python, async, type hints, packaging, testing, DSA just-enough — production-grade engineering.",
    category: "Data & ML",
    difficulty: "Intermediate",
    estHours: 30,
    topicsCount: 3,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-emerald-500 to-cyan-500",
    roadmapSlugs: ["genai-developer"],
    topics: [
      topic("advanced-python", "Advanced Python", [
        ["type-hints", "Type hints (typing, Generic, Protocol, TypedDict)", 22],
        ["async-await", "Async/await, asyncio, concurrent.futures", 24],
        ["decorators-context-managers", "Decorators, context managers, descriptors", 22],
        ["generators-iterators", "Generators, iterators, itertools", 20],
        ["pydantic-v2", "Pydantic v2 — validation in LLM stacks", 22],
        ["dataclasses", "Dataclasses, attrs", 18],
        ["memory-profiling", "Memory management, profiling (cProfile, memray)", 22],
        ["mp-vs-threading-asyncio", "Multiprocessing vs multithreading vs asyncio", 22],
      ]),
      topic("se-tools", "Software Engineering Tools", [
        ["git-deep", "Git deep — rebase, cherry-pick, bisect, hooks", 22],
        ["linux-bash", "Linux/Bash — pipes, awk, sed, grep, xargs", 22],
        ["docker-for-ai", "Docker + Compose for AI workloads", 22],
        ["package-managers", "uv, poetry, pip-tools", 18],
        ["testing", "pytest, hypothesis, pytest-asyncio", 22],
        ["lint-format", "ruff, mypy, pre-commit", 18],
        ["task-runners", "Make, justfile, task runners", 16],
      ]),
      topic("dsa-just-enough", "DSA — Just Enough", [
        ["core-ds", "Arrays, hashmaps, trees, graphs, heaps", 22],
        ["big-o", "Big-O analysis", 18],
        ["dp-basics", "Dynamic programming basics", 22],
        ["trie", "Trie (used in tokenizers)", 20],
        ["ann-algos", "Approximate Nearest Neighbor — HNSW, IVF", 24],
      ]),
    ],
  },
  // Phase 1 — Classical ML & Deep Learning
  {
    slug: "genai-classical-ml",
    title: "Classical Machine Learning",
    description: "Supervised, unsupervised, evaluation metrics — neev jo har ML system me chalti hai.",
    category: "Data & ML",
    difficulty: "Intermediate",
    estHours: 20,
    topicsCount: 3,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-amber-500 to-orange-500",
    roadmapSlugs: ["genai-developer"],
    topics: [
      topic("supervised", "Supervised Learning", [
        ["linreg-logreg", "Linear & logistic regression (derive from scratch)", 22],
        ["trees-boosting", "Decision trees, random forests, XGBoost, LightGBM", 24],
        ["svm-knn", "SVMs (concept), k-NN", 20],
        ["bias-variance", "Bias-variance tradeoff, regularization (L1, L2, dropout)", 22],
        ["splits-cv", "Train/val/test splits, cross-validation", 18],
      ]),
      topic("unsupervised", "Unsupervised Learning", [
        ["kmeans-dbscan", "K-means, DBSCAN, hierarchical clustering", 22],
        ["pca-tsne-umap", "PCA, t-SNE, UMAP — visualize embeddings", 22],
        ["autoencoders", "Autoencoders", 20],
      ]),
      topic("eval-metrics", "Evaluation Metrics", [
        ["classification-metrics", "Accuracy, precision, recall, F1, ROC-AUC, PR-AUC", 22],
        ["regression-metrics", "MSE, MAE, R²", 18],
        ["metric-choice", "Why metric choice matters more than model choice", 18],
      ]),
    ],
  },
  {
    slug: "genai-deep-learning",
    title: "Deep Learning Fundamentals",
    description: "Neural nets, optimization, regularization, PyTorch mastery, classic architectures.",
    category: "Data & ML",
    difficulty: "Intermediate",
    estHours: 30,
    topicsCount: 5,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-pink-500 to-rose-500",
    roadmapSlugs: ["genai-developer"],
    topics: [
      topic("neural-nets", "Neural Networks", [
        ["perceptron-mlp", "Perceptron, MLPs, universal approximation", 20],
        ["activations", "Activations (ReLU, GELU, SiLU, SwiGLU)", 22],
        ["forward-backward", "Forward & backward propagation manually", 24],
        ["loss-functions", "Loss functions — MSE, cross-entropy, contrastive, triplet", 22],
      ]),
      topic("optimization", "Optimization", [
        ["sgd-momentum", "SGD, momentum, Nesterov", 20],
        ["adam-adamw-lion", "Adam, AdamW, Lion", 22],
        ["lr-schedules", "Learning rate schedules — cosine, warmup, one-cycle", 20],
        ["grad-clip-fp16", "Gradient clipping, mixed precision (fp16, bf16)", 22],
        ["batch-size", "Batch size dynamics", 18],
      ]),
      topic("regularization", "Regularization & Stability", [
        ["dropout-norm", "Dropout, layer norm, batch norm, RMS norm", 22],
        ["weight-decay", "Weight decay", 16],
        ["label-smoothing", "Label smoothing", 16],
        ["residuals", "Residual connections — why they matter", 22],
        ["vanishing-exploding", "Vanishing/exploding gradients", 20],
      ]),
      topic("pytorch", "PyTorch Mastery", [
        ["tensors-autograd", "Tensors, autograd, nn.Module", 24],
        ["dataloaders", "DataLoaders, custom datasets", 20],
        ["training-loops", "Training loops (write your own first)", 22],
        ["gpu-cuda", "GPU/CUDA basics, .to(device), pinned memory", 22],
        ["torch-compile", "torch.compile, FlashAttention", 22],
        ["checkpoints", "Saving/loading checkpoints, state_dict", 16],
        ["ddp", "Distributed training intro (DDP)", 22],
      ]),
      topic("architectures", "Classic Architectures", [
        ["cnns", "CNNs — just enough to understand inductive bias", 20],
        ["rnns-lstms", "RNNs, LSTMs, GRUs — history, why they failed", 22],
        ["seq2seq", "Encoder-decoder seq2seq — bridge to transformers", 22],
      ]),
    ],
  },
  // Phase 2 — Transformers & LLM Internals
  {
    slug: "genai-transformers",
    title: "Transformers & LLM Internals",
    description: "Attention, transformer block, tokenization, RoPE, modern archs, pretraining, inference internals — top 2% ka core.",
    category: "Data & ML",
    difficulty: "Advanced",
    estHours: 50,
    topicsCount: 7,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-cyan-500",
    roadmapSlugs: ["genai-developer"],
    topics: [
      topic("attention", "Attention Mechanism", [
        ["self-attention", "Self-attention from first principles (Q, K, V)", 26],
        ["scaled-dot-product", "Scaled dot-product (why √d_k)", 24],
        ["multi-head", "Multi-head attention", 26],
        ["causal-masked", "Causal/masked vs bidirectional", 22],
        ["cross-attention", "Cross-attention", 20],
        ["attention-complexity", "O(n²) complexity — the bottleneck", 22],
      ]),
      topic("transformer-block", "Transformer Block", [
        ["layer-norm", "Layer norm — pre-norm vs post-norm", 22],
        ["ffn-swiglu", "FFN with SwiGLU", 22],
        ["residuals-tx", "Residual connections in transformers", 18],
        ["encoder-decoder-variants", "Encoder, decoder, encoder-decoder variants", 22],
        ["aiayn-paper", "Reading 'Attention is All You Need' line by line", 26],
      ]),
      topic("tokenization", "Tokenization", [
        ["char-word-subword", "Character vs word vs subword", 20],
        ["bpe", "Byte-Pair Encoding (BPE)", 22],
        ["wordpiece-sentencepiece", "WordPiece, SentencePiece, Unigram", 22],
        ["tiktoken", "Tiktoken, tokenizers library", 18],
        ["vocab-tradeoffs", "Vocab size vs sequence length", 20],
        ["tokenization-quirks", "Numbers, code, multilingual quirks", 22],
      ]),
      topic("positional-encodings", "Positional Encodings", [
        ["sinusoidal", "Sinusoidal (original)", 20],
        ["learned-pos", "Learned positional embeddings", 18],
        ["rope", "RoPE — Llama/Mistral/Qwen", 24],
        ["alibi", "ALiBi", 20],
        ["length-extrapolation", "Why position matters for length extrapolation", 20],
      ]),
      topic("modern-archs", "Modern LLM Architectures", [
        ["gpt-family", "GPT family (decoder-only)", 22],
        ["bert-roberta", "BERT, RoBERTa — for embeddings", 22],
        ["t5", "T5, FLAN-T5 — encoder-decoder", 20],
        ["llama-family", "Llama, Llama 2, Llama 3 details", 24],
        ["mistral-mixtral", "Mistral, Mixtral — sliding window, MoE", 24],
        ["qwen-deepseek", "Qwen, DeepSeek, Phi, Gemma", 22],
        ["moe", "Mixture of Experts — sparse vs dense", 24],
        ["ssm", "State Space Models (Mamba, RWKV)", 22],
      ]),
      topic("pretraining", "Pre-training Concepts", [
        ["clm-objective", "Causal language modeling", 22],
        ["mlm", "Masked language modeling (BERT-style)", 22],
        ["data-curation", "Data curation, dedup, quality filtering", 22],
        ["scaling-laws", "Chinchilla scaling laws", 22],
        ["compute-flops", "Compute budgets, FLOPS calculation", 20],
        ["curriculum", "Curriculum learning", 18],
      ]),
      topic("inference-internals", "Inference Internals", [
        ["kv-cache", "KV cache — single most important optimization", 26],
        ["prefill-decode", "Prefill vs decode phase", 22],
        ["sampling-strategies", "Greedy, beam, top-k, top-p, temperature, min-p", 24],
        ["spec-decoding", "Speculative decoding", 22],
        ["continuous-batching", "Continuous batching", 22],
        ["paged-attention", "PagedAttention (vLLM)", 22],
      ]),
    ],
  },
  // Phase 3 — LLM Application Development
  {
    slug: "genai-llm-apis",
    title: "Working with LLM APIs",
    description: "OpenAI, Anthropic, Gemini, OSS providers, local inference, prompt engineering, structured outputs.",
    category: "Data & ML",
    difficulty: "Intermediate",
    estHours: 18,
    topicsCount: 3,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-cyan-500 to-blue-500",
    roadmapSlugs: ["genai-developer"],
    topics: [
      topic("provider-apis", "Provider APIs", [
        ["openai-api", "OpenAI API (chat, responses, structured outputs)", 22],
        ["claude-api", "Anthropic Claude API (messages, tool use, thinking)", 22],
        ["gemini-api", "Google Gemini API", 18],
        ["oss-providers", "Together, Replicate, Groq, Fireworks", 18],
        ["local-inference", "Ollama, LM Studio, llama.cpp", 22],
        ["streaming", "Streaming responses (SSE, async generators)", 22],
        ["token-counting", "Token counting, context management", 18],
      ]),
      topic("prompt-engineering", "Prompt Engineering (Real)", [
        ["zero-few-cot", "Zero-shot, few-shot, chain-of-thought", 22],
        ["self-consistency-tot", "Self-consistency, tree-of-thought", 22],
        ["react", "ReAct (Reasoning + Acting)", 20],
        ["role-system-prompts", "Role/system prompts, persona conditioning", 20],
        ["xml-json-md", "XML tags vs JSON vs Markdown structuring", 18],
        ["chaining-decomposition", "Prompt chaining and decomposition", 22],
        ["prompt-versioning", "Prompt versioning and A/B testing", 20],
      ]),
      topic("structured-outputs", "Structured Outputs & Function Calling", [
        ["json-mode", "JSON mode, JSON Schema enforcement", 20],
        ["pydantic-instructor", "Pydantic + Instructor library", 20],
        ["function-tool-calling", "OpenAI function calling, Claude tool use", 24],
        ["constrained-decoding", "Outlines, Guidance, lm-format-enforcer", 22],
        ["parsing-failures", "Handling parsing failures and retries", 18],
      ]),
    ],
  },
  {
    slug: "genai-rag",
    title: "Retrieval-Augmented Generation (RAG)",
    description: "Embeddings, vector DBs, chunking, reranking, advanced RAG patterns (Self-RAG, GraphRAG, Agentic RAG), evaluation.",
    category: "Data & ML",
    difficulty: "Advanced",
    estHours: 25,
    topicsCount: 4,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-blue-500 to-indigo-500",
    roadmapSlugs: ["genai-developer"],
    topics: [
      topic("embeddings", "Embedding Models", [
        ["embedding-intuition", "What embeddings are (geometrically & semantically)", 22],
        ["popular-embedders", "Sentence-Transformers, BGE, E5, Voyage, OpenAI ada", 22],
        ["matryoshka", "Matryoshka embeddings", 20],
        ["domain-finetuning", "Domain-specific fine-tuning of embeddings", 22],
        ["similarity-metrics", "Cosine, dot product, Euclidean — when each", 18],
      ]),
      topic("vector-dbs", "Vector Databases", [
        ["ann-deep", "HNSW, IVF, ScaNN — ANN deep dive", 24],
        ["popular-vdbs", "Pinecone, Weaviate, Qdrant, Milvus, Chroma, pgvector, LanceDB", 22],
        ["index-tradeoffs", "Recall vs latency vs memory", 22],
        ["hybrid-search", "Hybrid search (vector + BM25)", 22],
        ["metadata-filtering", "Metadata filtering", 18],
      ]),
      topic("rag-pipeline", "RAG Pipeline Components", [
        ["doc-loaders", "Document loaders (PDF, HTML, code, DOCX)", 22],
        ["chunking", "Chunking strategies (fixed, recursive, semantic, agentic)", 24],
        ["parent-child", "Parent-child / small-to-big retrieval", 22],
        ["query-transforms", "HyDE, multi-query, query rewriting", 24],
        ["reranking", "Cohere Rerank, BGE Reranker, LLM-as-reranker", 22],
        ["context-compression", "Context compression and summarization", 20],
        ["citations", "Citation and source attribution", 20],
      ]),
      topic("advanced-rag", "Advanced RAG Patterns", [
        ["self-rag-crag", "Self-RAG, Corrective RAG (CRAG)", 24],
        ["graphrag", "GraphRAG (Microsoft)", 22],
        ["agentic-rag", "Agentic RAG", 22],
        ["multi-hop", "Multi-hop retrieval", 22],
        ["long-context-vs-rag", "Long-context vs RAG tradeoffs", 22],
        ["rag-eval", "Evaluation: RAGAS, TruLens (faithfulness, relevance, precision/recall)", 24],
      ]),
    ],
  },
  {
    slug: "genai-frameworks",
    title: "LLM Frameworks (Use Critically)",
    description: "LangChain, LlamaIndex, Haystack, DSPy — when each helps, when each hurts. Build raw before frameworks.",
    category: "Data & ML",
    difficulty: "Intermediate",
    estHours: 12,
    topicsCount: 1,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-fuchsia-500 to-pink-500",
    roadmapSlugs: ["genai-developer"],
    topics: [
      topic("frameworks-overview", "Frameworks Overview", [
        ["langchain", "LangChain — when it helps, when it hurts", 22],
        ["llamaindex", "LlamaIndex — strong for RAG/indexing", 22],
        ["haystack", "Haystack", 18],
        ["dspy", "DSPy — programming with LLMs", 24],
        ["raw-vs-framework", "Build raw before frameworks — why", 20],
      ]),
    ],
  },
  // Phase 4 — AI Agents
  {
    slug: "genai-agent-foundations",
    title: "Agent Foundations",
    description: "ReAct, Reflexion, Plan-and-Execute, tool use, memory systems — agent ka core mental model.",
    category: "Data & ML",
    difficulty: "Advanced",
    estHours: 22,
    topicsCount: 3,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-emerald-500 to-teal-500",
    roadmapSlugs: ["genai-developer"],
    topics: [
      topic("agent-patterns", "Core Agent Patterns", [
        ["react-loop", "ReAct (Reason + Act loop)", 24],
        ["reflexion", "Reflexion (self-critique and retry)", 22],
        ["plan-execute", "Plan-and-Execute", 22],
        ["tot", "Tree of Thoughts", 22],
        ["chain-of-verification", "Chain of Verification", 20],
        ["tool-use-primitive", "Tool use as the central primitive", 22],
      ]),
      topic("tool-use", "Tool Use & Function Calling", [
        ["good-tools", "Designing good tools (names, types, descriptions)", 22],
        ["tool-selection", "Tool selection strategies", 20],
        ["parallel-tool-calls", "Parallel tool calls", 20],
        ["error-recovery", "Error handling and recovery", 22],
        ["tool-result-format", "Tool result formatting", 18],
      ]),
      topic("memory-systems", "Memory Systems", [
        ["short-term-mem", "Short-term (conversation buffer)", 20],
        ["long-term-mem", "Long-term (vector store + summary)", 22],
        ["episodic-semantic", "Episodic vs semantic memory", 22],
        ["mem-consolidation", "Memory consolidation strategies", 22],
        ["memgpt", "MemGPT-style memory hierarchies", 22],
      ]),
    ],
  },
  {
    slug: "genai-multi-agent",
    title: "Multi-Agent Systems",
    description: "Architectures (supervisor-worker, hierarchical, swarm), LangGraph/AutoGen/CrewAI/MCP, specialized agents, evaluation.",
    category: "Data & ML",
    difficulty: "Advanced",
    estHours: 24,
    topicsCount: 4,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-teal-500 to-cyan-500",
    roadmapSlugs: ["genai-developer"],
    topics: [
      topic("architectures", "Architectures", [
        ["single-with-tools", "Single agent with tools", 22],
        ["supervisor-worker", "Supervisor-worker pattern", 22],
        ["hierarchical-agents", "Hierarchical agents", 22],
        ["swarm-p2p", "Swarm/peer-to-peer agents", 22],
        ["hitl", "Human-in-the-loop patterns", 22],
      ]),
      topic("agent-frameworks", "Agent Frameworks", [
        ["langgraph", "LangGraph — graph-based orchestration", 26],
        ["autogen", "AutoGen (Microsoft)", 22],
        ["crewai", "CrewAI", 20],
        ["openai-swarm", "OpenAI Swarm / Agents SDK", 22],
        ["mcp", "Anthropic MCP (Model Context Protocol)", 24],
        ["raw-while-loop", "Build raw with LLM + while loop first", 20],
      ]),
      topic("specialized-agents", "Specialized Agent Types", [
        ["coding-agents", "Coding agents (Claude Code, Cursor, Aider patterns)", 24],
        ["browser-computer-use", "Browser/computer-use agents", 22],
        ["research-agents", "Research agents", 22],
        ["support-agents", "Customer support agents", 20],
        ["data-analysis-agents", "Data analysis agents", 20],
      ]),
      topic("agent-eval", "Agent Evaluation", [
        ["trajectory-eval", "Trajectory evaluation", 22],
        ["task-success", "Task success rate", 18],
        ["cost-per-task", "Cost per successful task", 18],
        ["human-eval-rubrics", "Human eval rubrics", 18],
        ["agent-benchmarks", "SWE-bench, GAIA, AgentBench, WebArena", 22],
      ]),
    ],
  },
  // Phase 5 — Fine-Tuning
  {
    slug: "genai-finetuning",
    title: "Fine-Tuning & Model Customization",
    description: "SFT, LoRA/QLoRA, DPO/IPO/KTO/ORPO, quantization (GPTQ/AWQ/GGUF), model merging — full customization stack.",
    category: "Data & ML",
    difficulty: "Advanced",
    estHours: 30,
    topicsCount: 5,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-orange-500 to-red-500",
    roadmapSlugs: ["genai-developer"],
    topics: [
      topic("sft", "Supervised Fine-Tuning (SFT)", [
        ["full-vs-peft", "Full fine-tuning vs parameter-efficient", 22],
        ["instruction-datasets", "Alpaca, Dolly, OpenOrca, formatting", 22],
        ["chat-templates", "ChatML, Llama, Mistral formats", 20],
        ["hf-trl-sft", "HF transformers + trl SFTTrainer", 22],
        ["axolotl-unsloth", "Axolotl, Unsloth, Llama-Factory", 22],
        ["gpu-memory-math", "GPU memory math, gradient accumulation", 22],
      ]),
      topic("peft", "Parameter-Efficient Fine-Tuning", [
        ["lora", "LoRA — derive mathematically", 26],
        ["qlora", "QLoRA — 4-bit quantized LoRA", 24],
        ["lora-variants", "DoRA, rsLoRA, LoRA+", 22],
        ["adapters-prefix", "Adapters, prefix tuning, prompt tuning", 22],
        ["peft-vs-full", "When PEFT vs full FT", 18],
        ["merge-lora", "Merging LoRA adapters", 20],
      ]),
      topic("preference-opt", "Preference Optimization", [
        ["rlhf", "RLHF pipeline — SFT → reward model → PPO", 26],
        ["dpo", "DPO — modern standard", 24],
        ["ipo-kto-orpo", "IPO, KTO, ORPO, SimPO", 22],
        ["constitutional-ai", "Constitutional AI (Anthropic)", 22],
        ["reward-hacking", "Reward hacking — how to avoid", 22],
      ]),
      topic("quantization", "Quantization & Optimization", [
        ["gptq-awq", "Post-training: GPTQ, AWQ, SmoothQuant", 24],
        ["gguf", "GGUF format (llama.cpp ecosystem)", 22],
        ["bitsandbytes", "bitsandbytes (8-bit, 4-bit)", 20],
        ["qat", "Quantization-Aware Training", 22],
        ["distillation", "Knowledge distillation", 22],
        ["pruning-sparsity", "Pruning, sparsity", 20],
      ]),
      topic("model-merging", "Model Merging (Underrated)", [
        ["linear-slerp", "Linear merging, SLERP", 22],
        ["ties-dare", "TIES merging, DARE", 22],
        ["mergekit", "mergekit library", 20],
        ["why-merging", "Why merged models often outperform", 20],
      ]),
    ],
  },
  // Phase 6 — Multimodal
  {
    slug: "genai-vlm",
    title: "Vision-Language Models",
    description: "CLIP, LLaVA, GPT-4V, Claude Vision, Qwen-VL, document AI — vision + LLM stacks.",
    category: "Data & ML",
    difficulty: "Advanced",
    estHours: 14,
    topicsCount: 2,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-purple-500 to-violet-500",
    roadmapSlugs: ["genai-developer"],
    topics: [
      topic("vlm-fundamentals", "VLM Fundamentals", [
        ["clip", "CLIP — contrastive vision-language", 22],
        ["llava", "LLaVA architecture (vision encoder + projector + LLM)", 24],
        ["frontier-vlms", "GPT-4V, Claude vision, Gemini vision", 22],
        ["oss-vlms", "Qwen-VL, Llama 3.2 Vision, Pixtral", 22],
        ["doc-ai", "Document AI — ColPali, Nougat", 22],
      ]),
      topic("vlm-use-cases", "Use Cases", [
        ["ocr-extraction", "OCR + structured extraction", 22],
        ["vqa", "Visual question answering", 20],
        ["ui-understanding", "UI understanding (computer-use agents)", 22],
        ["video-understanding", "Video understanding", 22],
      ]),
    ],
  },
  {
    slug: "genai-diffusion",
    title: "Diffusion Models & Image Generation",
    description: "DDPM, latent diffusion, Stable Diffusion / FLUX, ControlNet, LoRA for diffusion, ComfyUI.",
    category: "Data & ML",
    difficulty: "Advanced",
    estHours: 18,
    topicsCount: 2,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-pink-500 to-purple-500",
    roadmapSlugs: ["genai-developer"],
    topics: [
      topic("diffusion-theory", "Diffusion Theory", [
        ["forward-reverse", "Forward and reverse diffusion processes", 24],
        ["ddpm-ddim", "DDPM, DDIM", 24],
        ["score-based", "Score-based models", 22],
        ["cfg", "Classifier-free guidance", 22],
        ["latent-diffusion", "Latent diffusion (Stable Diffusion)", 24],
        ["flow-matching", "Flow matching, rectified flow (SD3, FLUX)", 24],
      ]),
      topic("practical-image-gen", "Practical Image Generation", [
        ["sd-sdxl-flux", "Stable Diffusion / SDXL / FLUX usage", 22],
        ["controlnet-ipadapter", "ControlNet, IP-Adapter", 22],
        ["lora-diffusion", "LoRA training for diffusion", 22],
        ["comfyui-diffusers", "ComfyUI, Diffusers library", 20],
        ["image-prompting", "Prompt engineering for images", 20],
      ]),
    ],
  },
  {
    slug: "genai-audio-video",
    title: "Audio & Video Models",
    description: "Whisper, TTS (ElevenLabs, F5), voice cloning, audio diffusion, Sora/Veo/HunyuanVideo.",
    category: "Data & ML",
    difficulty: "Advanced",
    estHours: 12,
    topicsCount: 2,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-rose-500 to-pink-500",
    roadmapSlugs: ["genai-developer"],
    topics: [
      topic("audio-models", "Audio Models", [
        ["whisper", "Whisper (ASR)", 22],
        ["tts", "TTS — ElevenLabs, OpenAI TTS, Coqui, F5-TTS", 22],
        ["voice-cloning", "Voice cloning", 20],
        ["s2s", "Speech-to-speech models", 22],
        ["audio-diffusion", "Audio diffusion (AudioLDM, MusicGen)", 22],
      ]),
      topic("video-gen", "Video Generation", [
        ["frontier-video", "Sora, Veo, Runway, Pika (conceptual)", 22],
        ["oss-video", "Open-source — Mochi, HunyuanVideo, LTX", 22],
        ["consistency-challenges", "Animation and consistency challenges", 20],
      ]),
    ],
  },
  // Phase 7 — Production / MLOps
  {
    slug: "genai-backend",
    title: "Backend Engineering for AI",
    description: "FastAPI deeply, async DB, streaming (SSE/WebSocket), queues (Celery/Temporal/Inngest), Postgres+pgvector+Redis.",
    category: "Data & ML",
    difficulty: "Advanced",
    estHours: 18,
    topicsCount: 3,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-cyan-500 to-emerald-500",
    roadmapSlugs: ["genai-developer"],
    topics: [
      topic("apis", "APIs", [
        ["fastapi-deep", "FastAPI deeply (DI, background tasks, websockets)", 24],
        ["async-db", "Async DB (SQLAlchemy 2.0, asyncpg)", 22],
        ["streaming-resp", "Streaming (SSE, WebSocket) for tokens", 22],
        ["rate-limit-auth", "Rate limiting, auth (JWT, OAuth, API keys)", 22],
        ["pydantic-io", "Pydantic for I/O contracts", 18],
      ]),
      topic("databases-ai", "Databases for AI", [
        ["pg-pgvector", "PostgreSQL + pgvector — your default", 22],
        ["redis-ai", "Redis (cache, queue, semantic cache)", 22],
        ["sqlite-edge", "SQLite for local/edge", 18],
      ]),
      topic("queues-workflows", "Queues & Async Workflows", [
        ["celery-rq-dramatiq", "Celery, RQ, Dramatiq", 22],
        ["temporal-inngest", "Temporal, Inngest (durable agent workflows)", 22],
        ["brokers", "Redis, RabbitMQ, Kafka", 20],
      ]),
    ],
  },
  {
    slug: "genai-serving",
    title: "LLM Serving & Inference",
    description: "vLLM, TGI, Triton, SGLang, llama.cpp, Ollama — serving frameworks + inference optimizations (FlashAttention, spec decoding, prefix caching).",
    category: "Data & ML",
    difficulty: "Advanced",
    estHours: 18,
    topicsCount: 2,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-purple-500",
    roadmapSlugs: ["genai-developer"],
    topics: [
      topic("serving-frameworks", "Serving Frameworks", [
        ["vllm", "vLLM — PagedAttention, continuous batching (industry standard)", 26],
        ["tgi", "TGI (HF Text Generation Inference)", 22],
        ["triton-trt", "NVIDIA Triton, TensorRT-LLM", 22],
        ["sglang", "SGLang", 22],
        ["llama-cpp-ollama", "llama.cpp, Ollama for local/edge", 20],
        ["lmdeploy", "LMDeploy", 18],
      ]),
      topic("inference-opt", "Inference Optimization", [
        ["cont-batching-deep", "Continuous batching deep dive", 24],
        ["spec-medusa-eagle", "Speculative decoding, Medusa, EAGLE", 24],
        ["flash-attention", "FlashAttention 2/3", 24],
        ["prefix-caching", "Prefix caching", 22],
        ["tp-pp", "Tensor parallelism, pipeline parallelism", 24],
        ["fp8-int4-inf", "Quantization for inference (FP8, INT4)", 22],
      ]),
    ],
  },
  {
    slug: "genai-llmops",
    title: "LLMOps & Observability",
    description: "LangSmith/Langfuse/Helicone, OpenTelemetry, evals (Promptfoo/DeepEval/Inspect/Ragas), cost & latency optimization.",
    category: "Data & ML",
    difficulty: "Advanced",
    estHours: 16,
    topicsCount: 3,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-amber-500 to-yellow-500",
    roadmapSlugs: ["genai-developer"],
    topics: [
      topic("tracing-monitoring", "Tracing & Monitoring", [
        ["langsmith-langfuse", "LangSmith, Langfuse, Helicone, Phoenix, Braintrust", 22],
        ["otel-llm", "OpenTelemetry for LLMs", 22],
        ["token-cost-tracking", "Token usage tracking, cost attribution", 20],
        ["latency-profiling", "TTFT, TPS, p50/p95/p99", 22],
        ["error-alerting", "Error tracking and alerting", 18],
      ]),
      topic("eval-systems", "Evaluation Systems", [
        ["evals-before-models", "Build evals BEFORE models — most important lesson", 24],
        ["llm-as-judge", "LLM-as-a-judge (with bias awareness)", 22],
        ["ref-vs-refless", "Reference-based vs reference-free", 20],
        ["eval-frameworks", "Promptfoo, DeepEval, Inspect AI, Ragas", 22],
        ["golden-datasets", "Golden datasets and continuous eval", 22],
        ["human-eval-pipelines", "Human eval pipelines", 20],
      ]),
      topic("cost-latency", "Cost & Latency Optimization", [
        ["semantic-cache", "Semantic caching (GPTCache, Redis)", 22],
        ["prompt-cache-native", "Prompt caching (Anthropic, OpenAI native)", 22],
        ["model-routing", "Model routing — cheap first, escalate", 20],
        ["batching-strats", "Batching strategies", 18],
        ["distill-smaller", "Distillation to smaller models", 20],
        ["llmlingua", "Prompt compression (LLMLingua)", 20],
      ]),
    ],
  },
  {
    slug: "genai-cloud-infra",
    title: "Cloud & Infrastructure for AI",
    description: "AWS Bedrock/SageMaker, GCP Vertex, Azure AI Foundry, Modal/Replicate/RunPod, Docker for ML, Kubernetes, KServe/Ray Serve, CI/CD for AI.",
    category: "Data & ML",
    difficulty: "Advanced",
    estHours: 18,
    topicsCount: 3,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-blue-500 to-cyan-500",
    roadmapSlugs: ["genai-developer"],
    topics: [
      topic("cloud-platforms-ai", "Cloud Platforms", [
        ["aws-ai", "AWS (Bedrock, SageMaker, EC2 GPU, Lambda)", 22],
        ["gcp-ai", "GCP (Vertex AI, Cloud Run, GKE)", 22],
        ["azure-ai", "Azure (AI Foundry, OpenAI Service)", 22],
        ["gpu-on-demand", "Modal, Replicate, RunPod, Lambda Labs", 22],
      ]),
      topic("containers-orchestration", "Containerization & Orchestration", [
        ["docker-ml", "Docker for ML (CUDA images, multi-stage)", 22],
        ["k8s-basics-ai", "Kubernetes basics (pods, deployments, services)", 22],
        ["gpu-operators", "GPU operators (NVIDIA on K8s)", 22],
        ["kserve-ray", "KServe, Ray Serve", 22],
      ]),
      topic("cicd-ai", "CI/CD for AI", [
        ["actions-pipelines", "GitHub Actions / GitLab CI", 20],
        ["eval-gated-deploys", "Eval-gated deployments", 22],
        ["canary-ab", "A/B testing and canary releases for prompts/models", 22],
        ["feature-flags-ai", "Feature flags (LaunchDarkly, Unleash) for prompt versions", 20],
      ]),
    ],
  },
  {
    slug: "genai-safety",
    title: "Safety, Security & Alignment",
    description: "Prompt injection, jailbreaks, OWASP for LLMs, guardrails (NeMo/Llama Guard), PII redaction, red teaming, hallucination detection.",
    category: "Data & ML",
    difficulty: "Advanced",
    estHours: 14,
    topicsCount: 3,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-red-500 to-rose-500",
    roadmapSlugs: ["genai-developer"],
    topics: [
      topic("llm-security", "LLM Security", [
        ["prompt-injection", "Prompt injection (direct, indirect)", 24],
        ["jailbreaking", "Jailbreaking patterns", 22],
        ["data-exfil", "Data exfiltration via tool use", 22],
        ["output-filtering", "Output filtering", 20],
        ["guardrails", "NeMo Guardrails, Llama Guard, Guardrails AI", 22],
        ["owasp-llm", "OWASP Top 10 for LLMs", 22],
      ]),
      topic("privacy-ai", "Privacy", [
        ["pii", "PII detection and redaction (Presidio)", 22],
        ["dp", "Differential privacy basics", 22],
        ["onprem-airgap", "On-prem and air-gapped deployments", 20],
        ["data-residency", "Data residency", 18],
      ]),
      topic("responsible-ai", "Responsible AI", [
        ["bias-detection", "Bias detection and mitigation", 22],
        ["red-teaming", "Red teaming", 22],
        ["model-cards", "Model cards, system cards", 18],
        ["watermarking", "Watermarking", 18],
        ["hallucination-detection", "Hallucination detection", 22],
      ]),
    ],
  },
  // Phase 8 — Specialization & Mastery
  {
    slug: "genai-specialization",
    title: "Pick Your Specialization",
    description: "Agent Engineer / RAG Architect / Fine-tuning Specialist / Inference Engineer / Multimodal / Eval Engineer — choose your moat.",
    category: "Data & ML",
    difficulty: "Advanced",
    estHours: 12,
    topicsCount: 1,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-fuchsia-500 to-violet-500",
    roadmapSlugs: ["genai-developer"],
    topics: [
      topic("specialization-paths", "Specialization Paths", [
        ["path-agent", "Path A — Agent Engineer", 22],
        ["path-rag", "Path B — RAG / Search Architect", 22],
        ["path-finetune", "Path C — Fine-Tuning / Model Specialist", 22],
        ["path-inference", "Path D — Inference / Performance Engineer", 22],
        ["path-multimodal", "Path E — Multimodal Specialist", 22],
        ["path-eval", "Path F — Applied Research / Eval Engineer", 22],
      ]),
    ],
  },
  {
    slug: "genai-top2-habits",
    title: "Top 2% Habits",
    description: "Read papers weekly, OSS contributions, public building, stay on the frontier — habits that compound into mastery.",
    category: "Data & ML",
    difficulty: "Advanced",
    estHours: 10,
    topicsCount: 4,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-yellow-500 to-orange-500",
    roadmapSlugs: ["genai-developer"],
    topics: [
      topic("read-papers", "Read Papers Weekly", [
        ["paper-method", "Skim → re-read → implement → write", 22],
        ["foundational-papers", "Foundational papers (AIAYN, GPT-3, Llama, DPO, LoRA, FlashAttention, ReAct, GraphRAG)", 26],
      ]),
      topic("oss-contrib", "Open Source Contributions", [
        ["targets", "Targets — HF, vLLM, LangChain, DSPy, Unsloth, Axolotl", 22],
        ["strategy", "Strategy — docs → bug fixes → features", 22],
      ]),
      topic("public-building", "Public Building", [
        ["build-stack", "GitHub, blog, X, LinkedIn, HuggingFace, YouTube", 22],
      ]),
      topic("frontier", "Stay on the Frontier", [
        ["follow", "Follow on X, newsletters, communities, conferences", 22],
      ]),
    ],
  },

  // =====================================================================
  // DATA ANALYST TOP 2% ROADMAP — 16 subjects across 9 phases
  // Markdown content lives in `content/<slug>.md`
  // =====================================================================
  // Phase 0 — Foundations
  {
    slug: "da-business-fundamentals",
    title: "Business & Data Fundamentals",
    description:
      "Business models, unit economics, AARRR funnel, North Star metrics, types of analysis, data structure — analyst ka business brain.",
    category: "Data & ML",
    difficulty: "Beginner",
    estHours: 18,
    topicsCount: 3,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-emerald-500 to-cyan-500",
    roadmapSlugs: ["data-analyst-top2"],
    topics: [
      topic("business-models", "How Businesses Make Money", [
        ["business-models-types", "Business models — SaaS, marketplace, ads, e-commerce", 22],
        ["unit-economics", "Unit economics — CAC, LTV, payback, contribution margin", 24],
        ["aarrr-funnel", "AARRR funnel — Acquisition, Activation, Retention, Revenue, Referral", 22],
        ["north-star-metrics", "North Star Metrics & guardrails", 20],
        ["pnl-basics", "P&L 101 — revenue, COGS, gross margin, OpEx, EBITDA", 20],
      ]),
      topic("types-of-analysis", "Types of Analysis", [
        ["descriptive-vs-diagnostic", "Descriptive vs diagnostic vs predictive vs prescriptive", 20],
        ["exploratory-vs-confirmatory", "Exploratory vs confirmatory analysis", 18],
      ]),
      topic("data-structure", "Data Types & Structure", [
        ["structured-unstructured", "Structured, semi-structured, unstructured data", 18],
        ["oltp-vs-olap", "OLTP vs OLAP — when which", 20],
        ["star-snowflake-schema", "Star schema, snowflake schema, fact vs dimension", 22],
        ["cardinality-granularity", "Cardinality, granularity, primary/foreign keys", 18],
      ]),
    ],
  },
  {
    slug: "da-statistics-foundations",
    title: "Statistics for Analysts",
    description:
      "Descriptive stats, probability, distributions, hypothesis testing, correlation vs causation — top-2% analyst ka math moat.",
    category: "Data & ML",
    difficulty: "Intermediate",
    estHours: 30,
    topicsCount: 4,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-fuchsia-500",
    roadmapSlugs: ["data-analyst-top2"],
    topics: [
      topic("descriptive-stats", "Descriptive Statistics", [
        ["mean-median-mode", "Mean, median, mode, weighted averages", 18],
        ["variance-std", "Variance, standard deviation, IQR", 20],
        ["percentiles-quartiles", "Percentiles, quartiles, deciles", 18],
        ["skewness-kurtosis", "Skewness, kurtosis — when mean lies", 20],
      ]),
      topic("probability", "Probability & Distributions", [
        ["sample-space-bayes", "Sample space, conditional probability, Bayes' theorem", 22],
        ["distributions-da", "Normal, Binomial, Poisson, Exponential, Log-normal, Power law", 24],
        ["clt-lln", "Central Limit Theorem & Law of Large Numbers", 22],
      ]),
      topic("inferential-stats", "Inferential Statistics", [
        ["sampling-bias", "Population vs sample, sampling techniques, bias types", 22],
        ["confidence-intervals", "Standard error & confidence intervals", 22],
        ["hypothesis-testing", "Hypothesis testing — null/alternate, p-values, type I/II", 24],
        ["common-tests", "t-test, z-test, chi-square, ANOVA, Mann-Whitney", 24],
        ["multiple-testing", "Multiple testing problem — Bonferroni, FDR", 20],
      ]),
      topic("correlation-causation", "Correlation vs Causation", [
        ["pearson-spearman", "Pearson, Spearman, Kendall correlation", 20],
        ["confounders-simpsons", "Confounders, lurking variables, Simpson's paradox", 22],
      ]),
    ],
  },
  // Phase 1 — SQL Mastery
  {
    slug: "da-sql-mastery",
    title: "SQL Mastery for Analysts",
    description:
      "Core → window functions → cohort analysis → funnels → performance → multi-dialect (Postgres / BigQuery / Snowflake). #1 analyst skill.",
    category: "Data & ML",
    difficulty: "Intermediate",
    estHours: 50,
    topicsCount: 5,
    progressPct: 0,
    hasPractice: true,
    iconAccent: "from-cyan-500 to-blue-500",
    roadmapSlugs: ["data-analyst-top2"],
    topics: [
      topic("sql-core", "Core SQL", [
        ["select-where-orderby", "SELECT, WHERE, ORDER BY, LIMIT", 18],
        ["joins-deep", "JOINs — INNER, LEFT, RIGHT, FULL, CROSS, SELF", 22],
        ["group-by-having", "GROUP BY, HAVING — common pitfalls", 20],
        ["subqueries", "Subqueries — correlated vs uncorrelated", 22],
        ["set-operations", "UNION, INTERSECT, EXCEPT", 18],
        ["case-coalesce", "CASE WHEN, COALESCE, NULLIF, IFNULL", 18],
      ]),
      topic("sql-intermediate", "Intermediate SQL", [
        ["window-functions", "Window functions — ROW_NUMBER, RANK, LAG, LEAD, SUM OVER", 28],
        ["window-frames", "ROWS BETWEEN / RANGE BETWEEN — frame mastery", 24],
        ["ctes-recursive", "CTEs (WITH clauses) and recursive CTEs", 22],
        ["pivot-unpivot", "Pivoting and unpivoting in SQL", 20],
        ["string-date-funcs", "String, date/time functions, regex", 20],
        ["json-array", "JSON / array functions (Postgres, BigQuery, Snowflake)", 22],
      ]),
      topic("sql-advanced-patterns", "Advanced SQL Patterns", [
        ["cohort-sql", "Cohort retention analysis in pure SQL", 28],
        ["funnel-sql", "Funnel analysis with drop-off rates", 26],
        ["sessionization", "Sessionization — gap-based session detection", 24],
        ["running-totals-mom-yoy", "Running totals, moving averages, YoY/MoM growth", 22],
        ["gaps-islands", "Gaps and islands problem", 24],
        ["dedup-strategies", "De-duplication strategies", 20],
        ["scd-types", "Slowly Changing Dimensions (SCD Type 1, 2, 3)", 22],
      ]),
      topic("sql-performance", "SQL Performance", [
        ["explain-analyze", "EXPLAIN / EXPLAIN ANALYZE — read query plans", 22],
        ["indexes-deep", "Indexes — B-tree, hash, partial, covering", 22],
        ["query-optimization", "Query optimization — predicate pushdown, no SELECT *", 22],
        ["partitioning-clustering", "Partitioning, clustering, materialized views", 22],
      ]),
      topic("sql-dialects", "Multi-dialect SQL", [
        ["postgres-bigquery-snowflake", "Postgres vs BigQuery vs Snowflake — syntax that bites", 22],
      ]),
    ],
  },
  // Phase 2 — Python for Analytics
  {
    slug: "da-python-analytics",
    title: "Python for Analytics",
    description:
      "Pandas + NumPy + cleaning + EDA + visualization. Production-grade analytics Python — not ML, but the analyst's daily driver.",
    category: "Data & ML",
    difficulty: "Intermediate",
    estHours: 40,
    topicsCount: 5,
    progressPct: 0,
    hasPractice: true,
    iconAccent: "from-yellow-500 to-orange-500",
    roadmapSlugs: ["data-analyst-top2"],
    topics: [
      topic("python-core", "Core Python for Analysts", [
        ["python-basics-da", "Data types, control flow, comprehensions", 18],
        ["functions-lambdas", "Functions, lambdas, *args/**kwargs", 18],
        ["file-io-error", "File I/O, error handling, virtual envs (uv/venv)", 18],
        ["type-hints-da", "Type hints — typing, TypedDict for clean code", 18],
      ]),
      topic("pandas-mastery", "Pandas Mastery", [
        ["pandas-series-df", "Series, DataFrames, Index — the data model", 22],
        ["pandas-io", "Read/write — CSV, Excel, Parquet, SQL, JSON", 18],
        ["pandas-indexing", ".loc, .iloc, boolean masks, .query()", 22],
        ["pandas-groupby", "GroupBy mechanics — split-apply-combine", 24],
        ["pandas-merge", "Merge, join, concat — when to use each", 22],
        ["pandas-pivot-melt", "Pivot, melt, stack, unstack, crosstab", 22],
        ["pandas-time-series", "Time series — resample, rolling, shift", 24],
        ["pandas-apply-trap", "Apply, map, transform — and when NOT to use them", 22],
        ["pandas-memory", "Memory optimization — dtypes, categoricals", 20],
        ["polars-intro", "Polars — modern, faster Pandas alternative", 20],
      ]),
      topic("numpy-core", "NumPy Essentials", [
        ["numpy-broadcasting", "ndarrays, broadcasting, vectorization", 20],
        ["numpy-aggregations", "Aggregations and reductions", 18],
      ]),
      topic("data-cleaning", "Data Cleaning", [
        ["missing-data", "Missing data — detect, impute, KNN, ffill/bfill", 22],
        ["duplicates-fuzzy", "Duplicates and near-duplicates (rapidfuzz)", 20],
        ["outliers-detection", "Outliers — IQR, z-score, Isolation Forest", 20],
        ["dates-encoding", "Date parsing nightmares, encoding strategies", 20],
      ]),
      topic("eda-viz", "EDA & Visualization", [
        ["eda-strategy", "Univariate, bivariate, multivariate EDA", 22],
        ["matplotlib-seaborn", "Matplotlib + Seaborn for analysts", 22],
        ["plotly-interactive", "Plotly Express for interactive viz", 18],
      ]),
    ],
  },
  // Phase 3 — Visualization & BI
  {
    slug: "da-excel-mastery",
    title: "Excel — The Analyst's Hidden Superpower",
    description:
      "VLOOKUP/XLOOKUP, pivots, Power Query, Power Pivot + DAX, dynamic arrays. 80% of business decisions still happen in spreadsheets.",
    category: "Data & ML",
    difficulty: "Beginner",
    estHours: 18,
    topicsCount: 3,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-emerald-500 to-cyan-500",
    roadmapSlugs: ["data-analyst-top2"],
    topics: [
      topic("excel-formulas", "Lookup & Aggregation Formulas", [
        ["vlookup-xlookup", "VLOOKUP, INDEX-MATCH, XLOOKUP", 20],
        ["sumifs-countifs", "SUMIFS, COUNTIFS, AVERAGEIFS", 18],
        ["dynamic-arrays", "FILTER, SORT, UNIQUE, SEQUENCE, dynamic arrays", 20],
      ]),
      topic("excel-pivot-powerquery", "Pivot Tables & Power Query", [
        ["pivot-tables", "Pivot tables and pivot charts — analyst staple", 22],
        ["power-query-m", "Power Query (M language) for cleaning", 22],
      ]),
      topic("excel-powerpivot-dax", "Power Pivot + DAX", [
        ["power-pivot", "Power Pivot — relationships, measures", 22],
        ["dax-basics", "DAX basics — CALCULATE, time intelligence", 26],
      ]),
    ],
  },
  {
    slug: "da-bi-tools",
    title: "BI Tools — Tableau & Power BI",
    description:
      "Master one BI tool deeply. Data modeling, calculated fields, LOD/DAX, dashboards, performance — analyst ka public-facing artifact.",
    category: "Data & ML",
    difficulty: "Intermediate",
    estHours: 30,
    topicsCount: 4,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-blue-500 to-indigo-500",
    roadmapSlugs: ["data-analyst-top2"],
    topics: [
      topic("bi-fundamentals", "BI Fundamentals", [
        ["pick-your-tool", "Pick your tool — Tableau vs Power BI vs Looker", 18],
        ["data-modeling-bi", "Data modeling — joins vs blends vs relationships", 22],
      ]),
      topic("tableau-deep", "Tableau Deep Dive", [
        ["calculated-fields", "Calculated fields, parameters, sets", 22],
        ["lod-expressions", "LOD expressions — FIXED, INCLUDE, EXCLUDE", 26],
        ["tableau-dashboards", "Dashboards, actions, story points", 22],
        ["tableau-performance", "Performance optimization & extracts", 20],
      ]),
      topic("powerbi-deep", "Power BI Deep Dive", [
        ["powerbi-modeling", "Star schema enforced, relationships", 22],
        ["dax-advanced", "DAX deeply — CALCULATE, FILTER, iterators (SUMX), variables", 28],
        ["powerbi-rls", "Row-level security, gateways, refresh", 20],
      ]),
      topic("looker-studio", "Looker / Looker Studio", [
        ["lookml-basics", "LookML basics — explores, views, dashboards", 22],
      ]),
    ],
  },
  {
    slug: "da-data-storytelling",
    title: "Data Storytelling & Visualization",
    description:
      "Chart selection, Tufte's principles, pyramid principle, dashboard design, executive communication. Insights > information.",
    category: "Data & ML",
    difficulty: "Intermediate",
    estHours: 16,
    topicsCount: 3,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-pink-500 to-rose-500",
    roadmapSlugs: ["data-analyst-top2"],
    topics: [
      topic("viz-principles", "Visualization Principles", [
        ["chart-selection", "Chart selection — bar, line, scatter, sankey, waterfall", 22],
        ["pre-attentive", "Pre-attentive attributes — color, size, position", 20],
        ["tufte-principles", "Tufte's data-ink ratio, chartjunk, small multiples", 22],
        ["color-accessibility", "Color theory & accessibility", 18],
      ]),
      topic("dashboard-design", "Dashboard Design", [
        ["audience-first", "Audience-first design — exec vs operator", 22],
        ["five-second-test", "5-second test, F-pattern, hierarchy", 20],
        ["kitchen-sink", "Avoiding the kitchen-sink dashboard", 18],
      ]),
      topic("insight-communication", "Insight Communication", [
        ["pyramid-principle", "The Pyramid Principle (McKinsey method)", 24],
        ["scqa-framework", "SCQA framework — Situation, Complication, Question, Answer", 20],
        ["amazon-six-pager", "Amazon-style 6-pagers, executive summaries", 22],
      ]),
    ],
  },
  // Phase 4 — A/B Testing & Causal Inference
  {
    slug: "da-ab-testing",
    title: "A/B Testing & Experimentation",
    description:
      "Hypothesis design, MDE, power analysis, CUPED, SRM, network effects. The skill that separates senior analysts from juniors.",
    category: "Data & ML",
    difficulty: "Advanced",
    estHours: 36,
    topicsCount: 4,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-pink-500",
    roadmapSlugs: ["data-analyst-top2"],
    topics: [
      topic("experimentation-foundations", "Foundations of Experimentation", [
        ["why-experiments", "Why experiments — correlation vs causation", 22],
        ["primary-secondary-guardrail", "Primary, secondary, guardrail metrics, OEC", 22],
        ["power-mde", "Power analysis & Minimum Detectable Effect (MDE)", 28],
      ]),
      topic("experiment-design", "Experiment Design", [
        ["randomization-units", "Randomization — user, session, cluster level", 22],
        ["aa-tests", "A/A tests — and why you must run them", 20],
        ["multi-arm-bandits", "Multi-arm experiments & bandits", 22],
        ["sequential-testing", "Sequential testing & the peeking problem", 22],
      ]),
      topic("experiment-analysis", "Analysis of Experiments", [
        ["frequentist-bayesian", "Frequentist vs Bayesian — interpretation", 24],
        ["cuped-variance", "CUPED — variance reduction technique", 26],
        ["heterogeneous-effects", "Heterogeneous treatment effects (HTE)", 22],
        ["srm-checks", "SRM (Sample Ratio Mismatch) checks", 22],
        ["network-interference", "Network effects & interference (marketplace)", 24],
      ]),
      topic("experimentation-pitfalls", "Common Pitfalls", [
        ["peeking-multiple", "Peeking, early stopping, multiple comparisons", 22],
        ["novelty-primacy", "Novelty effects, primacy effects, winner's curse", 22],
      ]),
    ],
  },
  {
    slug: "da-causal-inference",
    title: "Causal Inference",
    description:
      "DiD, PSM, RDD, IV, DAGs, synthetic control. The real top-2% skill — answer causal questions even when you can't run an experiment.",
    category: "Data & ML",
    difficulty: "Advanced",
    estHours: 30,
    topicsCount: 3,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-purple-500 to-pink-500",
    roadmapSlugs: ["data-analyst-top2"],
    topics: [
      topic("causal-foundations", "Why Causal Inference?", [
        ["potential-outcomes", "Potential outcomes (Rubin) & counterfactuals", 24],
        ["when-no-experiment", "When you can't run an experiment", 20],
      ]),
      topic("causal-methods", "Causal Methods", [
        ["did-method", "Difference-in-Differences (DiD)", 26],
        ["psm-method", "Propensity Score Matching", 26],
        ["rdd-method", "Regression Discontinuity Design (RDD)", 24],
        ["iv-method", "Instrumental Variables (IV)", 22],
        ["synthetic-control", "Synthetic Control method", 22],
        ["dags-pearl", "DAGs (Pearl) — backdoor & frontdoor criteria", 26],
      ]),
      topic("causal-tools", "Causal Tooling", [
        ["dowhy-econml", "DoWhy, EconML, CausalML — production tooling", 22],
      ]),
    ],
  },
  // Phase 5 — Predictive Analytics
  {
    slug: "da-ml-for-analysts",
    title: "ML for Analysts",
    description:
      "Regression, trees, XGBoost, SHAP — analyst ke practical use cases — churn, LTV, forecasting, segmentation. Interpretation > deployment.",
    category: "Data & ML",
    difficulty: "Advanced",
    estHours: 28,
    topicsCount: 5,
    progressPct: 0,
    hasPractice: true,
    iconAccent: "from-orange-500 to-red-500",
    roadmapSlugs: ["data-analyst-top2"],
    topics: [
      topic("regression-da", "Regression Models", [
        ["linear-regression", "Linear regression — assumptions, interpretation", 24],
        ["multicollinearity", "Multiple regression, multicollinearity, VIF", 22],
        ["logistic-regression", "Logistic regression — coefficient interpretation", 24],
        ["regularization", "Regularization — Ridge, Lasso, Elastic Net", 22],
      ]),
      topic("trees-boosting", "Tree-Based Models", [
        ["decision-trees", "Decision trees — for understanding", 20],
        ["random-forest", "Random Forests", 22],
        ["xgb-lgb-cb", "XGBoost, LightGBM, CatBoost — analyst go-to", 26],
        ["shap-importance", "SHAP values & feature importance", 24],
      ]),
      topic("model-evaluation", "Model Evaluation", [
        ["train-val-test", "Train/val/test, cross-validation, time-series CV", 22],
        ["classification-metrics", "Precision, Recall, F1, ROC-AUC, lift, gain", 22],
        ["regression-metrics", "MAE, MSE, RMSE, MAPE, R²", 18],
      ]),
      topic("analyst-use-cases", "Practical Use Cases", [
        ["churn-modeling", "Customer churn prediction", 24],
        ["ltv-modeling", "Lifetime Value (LTV) modeling", 22],
        ["forecasting", "Forecasting — Prophet, ARIMA, exponential smoothing", 24],
        ["segmentation-rfm", "Customer segmentation — RFM, K-means", 22],
        ["anomaly-detection", "Anomaly detection", 20],
      ]),
      topic("when-not-ml", "When NOT to Use ML", [
        ["ml-vs-sql", "When SQL gets you 90% there", 18],
      ]),
    ],
  },
  // Phase 6 — Modern Data Stack
  {
    slug: "da-data-warehousing",
    title: "Data Warehousing & Modeling",
    description:
      "Snowflake, BigQuery, Redshift, Databricks — cloud DWH internals. Kimball methodology, star schema, fact/dim. Analytics engineering.",
    category: "Data & ML",
    difficulty: "Intermediate",
    estHours: 22,
    topicsCount: 3,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-blue-500 to-cyan-500",
    roadmapSlugs: ["data-analyst-top2"],
    topics: [
      topic("cloud-dwh", "Cloud Data Warehouses", [
        ["snowflake-arch", "Snowflake — virtual warehouses, micro-partitions", 24],
        ["bigquery-arch", "BigQuery — slots, partitioning, clustering", 22],
        ["redshift-databricks", "Redshift, Databricks lakehouse — when to use what", 22],
      ]),
      topic("dimensional-modeling", "Dimensional Modeling (Kimball)", [
        ["star-vs-snowflake-schema", "Star vs snowflake schema", 22],
        ["fact-table-types", "Fact tables — transactional, snapshot, accumulating", 24],
        ["conformed-dims", "Conformed & slowly changing dimensions", 22],
        ["obt-vs-normalized", "One Big Table (OBT) vs normalized debate", 20],
      ]),
      topic("etl-elt", "ETL / ELT Concepts", [
        ["etl-vs-elt", "ETL vs ELT — why ELT won", 22],
        ["batch-streaming", "Batch vs streaming, idempotency, data contracts", 22],
      ]),
    ],
  },
  {
    slug: "da-dbt-modeling",
    title: "dbt + Analytics Engineering",
    description:
      "dbt models, sources, seeds, Jinja, macros, tests, docs, exposures — analytics engineering ka modern foundation.",
    category: "Data & ML",
    difficulty: "Intermediate",
    estHours: 18,
    topicsCount: 3,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-orange-500 to-pink-500",
    roadmapSlugs: ["data-analyst-top2"],
    topics: [
      topic("dbt-fundamentals", "dbt Fundamentals", [
        ["why-dbt", "Why dbt changed analytics engineering", 22],
        ["models-sources-seeds", "Models, sources, seeds — building blocks", 24],
        ["staging-marts", "staging → intermediate → marts layering", 24],
      ]),
      topic("dbt-power-features", "Jinja, Macros & Tests", [
        ["jinja-macros", "Jinja templating & reusable macros", 22],
        ["tests-generic-singular", "Tests — generic and singular, data quality", 22],
        ["docs-exposures", "Documentation, exposures, lineage", 20],
      ]),
      topic("orchestration-git", "Orchestration & Git for Analysts", [
        ["airflow-prefect-dagster", "Airflow, Prefect, Dagster — awareness level", 20],
        ["git-for-analysts", "Git — branching, PRs, code review for analysts", 22],
        ["notebook-best-practices", "Notebook best practices — reproducibility, papermill", 20],
      ]),
    ],
  },
  // Phase 7 — Domain Expertise
  {
    slug: "da-product-analytics",
    title: "Product Analytics",
    description:
      "Funnels, retention curves, DAU/MAU, power user curves, feature adoption. Amplitude / Mixpanel / PostHog stack. Pick your domain.",
    category: "Data & ML",
    difficulty: "Advanced",
    estHours: 22,
    topicsCount: 3,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-cyan-500 to-emerald-500",
    roadmapSlugs: ["data-analyst-top2"],
    topics: [
      topic("product-metrics", "Product Metrics", [
        ["funnels-retention", "Funnels, retention curves, cohorts", 24],
        ["dau-wau-mau", "DAU/WAU/MAU, stickiness ratios", 20],
        ["engagement-depth", "Engagement — depth, breadth, frequency", 22],
        ["power-user-curve", "Power user curves, L7/L28", 22],
      ]),
      topic("feature-analysis", "Feature & North Star Analysis", [
        ["feature-adoption", "Feature adoption analysis", 22],
        ["product-north-star", "North Star Metrics for products", 22],
      ]),
      topic("product-tools", "Product Analytics Tools", [
        ["amplitude-mixpanel-posthog", "Amplitude vs Mixpanel vs PostHog — pick & ship", 22],
      ]),
    ],
  },
  {
    slug: "da-marketing-finance-analytics",
    title: "Marketing & Finance Analytics",
    description:
      "Attribution, MMM, incrementality, SaaS metrics (MRR, ARR, NRR), variance analysis, scenario planning. Two domains in one.",
    category: "Data & ML",
    difficulty: "Advanced",
    estHours: 22,
    topicsCount: 3,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-amber-500 to-orange-500",
    roadmapSlugs: ["data-analyst-top2"],
    topics: [
      topic("marketing-attribution", "Marketing Attribution", [
        ["attribution-models", "Last-click, first-click, multi-touch attribution", 24],
        ["mmm-models", "Media Mix Modeling (MMM)", 24],
        ["incrementality-geo", "Incrementality testing, geo experiments", 24],
        ["cac-ltv-channel", "CAC, LTV, payback by channel", 22],
      ]),
      topic("finance-saas-metrics", "Finance & SaaS Metrics", [
        ["mrr-arr-nrr", "MRR, ARR, NRR, GRR, churn, expansion", 22],
        ["variance-analysis", "Variance analysis — budget vs actual", 22],
        ["forecasting-fpa", "Forecasting — revenue, headcount, costs", 22],
      ]),
      topic("scenario-planning", "Scenario & Sensitivity Planning", [
        ["scenario-sensitivity", "Scenario planning, sensitivity analysis", 22],
      ]),
    ],
  },
  // Phase 8 — Communication, Influence & Habits
  {
    slug: "da-stakeholder-influence",
    title: "Stakeholder Management & Influence",
    description:
      "Translate ambiguous questions, pyramid principle, memo writing, exec presentations. Top 2% analyst = most influential, not most technical.",
    category: "Data & ML",
    difficulty: "Advanced",
    estHours: 14,
    topicsCount: 3,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-pink-500 to-rose-500",
    roadmapSlugs: ["data-analyst-top2"],
    topics: [
      topic("stakeholder-mgmt", "Working with Business Leaders", [
        ["five-whys", "5 Whys — translate ambiguous → analytical", 22],
        ["pre-analysis-briefing", "Pre-analysis briefing & success criteria", 20],
        ["scope-creep-no", "Managing scope creep, saying no without burning bridges", 20],
      ]),
      topic("storytelling-influence", "Storytelling & Influence", [
        ["pyramid-mastery", "Pyramid Principle — mastery, not exposure", 24],
        ["memo-writing", "Memo writing — Amazon 6-pager style", 22],
        ["quantified-recs", "Quantifying recommendations in ₹ business impact", 22],
      ]),
      topic("presentations", "Executive Presentations", [
        ["exec-vs-deepdive", "Executive vs deep-dive presentations", 22],
        ["tough-questions", "Handling tough questions, live data exploration", 20],
      ]),
    ],
  },
  {
    slug: "da-top2-habits",
    title: "Top 2% Habits & Career",
    description:
      "Public portfolio, blogs, side analyses, mentoring, weekly reading rhythm — habits that compound to top 2%.",
    category: "Data & ML",
    difficulty: "Advanced",
    estHours: 10,
    topicsCount: 3,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-yellow-500 to-orange-500",
    roadmapSlugs: ["data-analyst-top2"],
    topics: [
      topic("working-smart", "Working Smart", [
        ["snippet-library", "Personal SQL/Python snippet library", 18],
        ["templates-docs", "Reusable templates, documentation as multiplier", 20],
      ]),
      topic("career-acceleration", "Career Acceleration", [
        ["public-portfolio", "Public portfolio — GitHub + blog + LinkedIn", 22],
        ["mentoring-leadership", "Mentoring juniors, internal visibility", 20],
        ["specialize-vs-mgmt", "When to specialize vs go management", 18],
      ]),
      topic("frontier-habits", "Top-2% Habits", [
        ["industry-blogs", "Industry blogs — Netflix, Airbnb, Spotify, Uber", 18],
        ["reading-rhythm", "Newsletters & books — weekly reading rhythm", 20],
        ["side-analysis-monthly", "One side analysis per month — public", 20],
      ]),
    ],
  },

  // =====================================================================
  // CYCLE 18 — real-market gaps (HDFC banking, MongoDB deep-dive, GSoC India)
  // =====================================================================
  {
    slug: "hdfc-banking-tech",
    title: "HDFC + Banking Tech Cracker",
    description:
      "Indian bank tech hires ~10k engineers/year — near-zero prep competition. COBOL/JCL/Mainframe + Java/Spring + Oracle stack, BFSI interview rounds, HDFC + ICICI + SBI Tech + FIS + TCS BFSI funnel, 8-week prep.",
    category: "Interview Craft",
    difficulty: "Beginner",
    estHours: 16,
    topicsCount: 13,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-rose-500 to-orange-500",
    roadmapSlugs: ["service-trio-cracker", "service-company-cracker"],
    topics: [
      topic("hdfc-market", "The Indian banking tech market", [
        ["hdfc-volumes", "10k engineers/year + tier-3 reality + salary bands", 22],
      ]),
      topic("hdfc-stack", "What banks actually run", [
        ["hdfc-stack-tour", "Mainframe + Java + Oracle + MQ — transaction journey", 26],
      ]),
      topic("hdfc-funnel", "HDFC Tech / HDB hiring funnel", [
        ["hdfc-stages", "Resume → aptitude → 2 tech → manager → HR", 18],
      ]),
      topic("hdfc-aptitude", "Aptitude + reasoning round", [
        ["hdfc-apt-3", "3 worked questions + 70-75% cutoff", 20],
      ]),
      topic("hdfc-tech1", "Tech round 1 — fundamentals", [
        ["hdfc-tech1-15", "15 likely questions with model answers", 26],
      ]),
      topic("hdfc-tech2", "Tech round 2 — banking + code", [
        ["hdfc-tech2-mix", "Compound interest + window-fn SQL + IMPS flow", 26],
      ]),
      topic("hdfc-cobol", "Should you learn COBOL?", [
        ["hdfc-cobol-take", "30-line worked sample + retire-out arbitrage", 22],
      ]),
      topic("hdfc-mainframe", "Mainframe basics in 200 lines", [
        ["hdfc-jcl-cics", "JCL + CICS + VSAM — recognisable to a banking dev", 22],
      ]),
      topic("hdfc-hr", "Manager / HR round", [
        ["hdfc-hr-10", "10 HR questions + 3-turn salary negotiation", 22],
      ]),
      topic("hdfc-bfsi", "The BFSI ecosystem outside HDFC", [
        ["hdfc-bfsi-list", "TCS BFSI / Infosys Finacle / FIS / Mphasis", 18],
      ]),
      topic("hdfc-day-1", "Tech FAQs HDFC freshers face", [
        ["hdfc-day-1", "TFS not Git, DB2 not Postgres, ServiceNow tickets", 18],
      ]),
      topic("hdfc-plan", "8-week HDFC prep plan", [
        ["hdfc-plan-week", "Week-by-week study + practice + mock cadence", 22],
      ]),
      topic("hdfc-psu-bonus", "PSU bank tech route (bonus)", [
        ["hdfc-psu-bonus", "GATE → PSU bank IT cadre — when this wins", 14],
      ]),
    ],
  },
  {
    slug: "mongodb-deep-dive",
    title: "MongoDB Deep Dive",
    description:
      "BSON + aggregation + indexes (ESR rule) + replica sets + sharding + transactions + schema patterns + Atlas. The Mongo-specific deep that the generic database-nosql subject doesn't reach. Razorpay/Swiggy/PhonePe context throughout.",
    category: "Database",
    difficulty: "Intermediate",
    estHours: 18,
    topicsCount: 16,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-emerald-500 to-cyan-500",
    roadmapSlugs: ["mern-stack-developer", "backend-engineer"],
    topics: [
      topic("mongo-why", "Why MongoDB is interview-asked", [
        ["mongo-context", "Razorpay/Swiggy/PhonePe usage + salary signal", 18],
      ]),
      topic("mongo-bson", "BSON vs JSON", [
        ["mongo-bson-types", "ObjectId / Decimal128 / Date / Binary breakdown", 22],
      ]),
      topic("mongo-crud", "CRUD with mongosh + Node driver", [
        ["mongo-crud-ops", "insert/find/update operators with worked examples", 24],
      ]),
      topic("mongo-query", "Query operators deep-dive", [
        ["mongo-query-ops", "$elemMatch / $expr / $regex / array operators", 24],
      ]),
      topic("mongo-aggregation", "The aggregation pipeline", [
        ["mongo-agg-mom", "8-stage Swiggy MoM revenue per restaurant", 30],
      ]),
      topic("mongo-indexes", "Indexes — ESR rule + types", [
        ["mongo-esr", "Single/compound/multikey/hashed/partial/TTL + explain()", 28],
      ]),
      topic("mongo-schema", "Embedding vs referencing", [
        ["mongo-6-patterns", "6 schema patterns + Razorpay payments walkthrough", 26],
      ]),
      topic("mongo-replica", "Replica sets — HA story", [
        ["mongo-replica-failover", "Election + read preference + failover scenario", 24],
      ]),
      topic("mongo-shard", "Sharding — when 1 box stops being enough", [
        ["mongo-shard-key", "Shard-key choice + zone-based for India regulatory", 26],
      ]),
      topic("mongo-tx", "Transactions", [
        ["mongo-tx-wallet", "Multi-doc wallet transfer with retryable writes", 22],
      ]),
      topic("mongo-perf", "Performance tuning", [
        ["mongo-explain", "explain() + profiler + 5 common pitfalls", 24],
      ]),
      topic("mongo-security", "Security checklist", [
        ["mongo-sec-rbac", "Auth + TLS + RBAC + DPDPA 2023 hooks", 20],
      ]),
      topic("mongo-atlas", "MongoDB Atlas crash course", [
        ["mongo-atlas-tour", "Free tier → cluster → driver code → backups", 22],
      ]),
      topic("mongo-interview", "Common interview questions", [
        ["mongo-12-q", "12 model answers — ObjectId / chunk migration / lookup", 24],
      ]),
      topic("mongo-vs-pg", "Mongo vs Postgres in 2026", [
        ["mongo-vs-pg-table", "Honest comparison + India hiring signal", 18],
      ]),
      topic("mongo-plan", "4-week mastery plan", [
        ["mongo-plan-week", "Week-by-week reading + Atlas labs + design ex", 18],
      ]),
    ],
  },
  {
    slug: "gsoc-india-playbook",
    title: "GSoC + LFX + Outreachy India Playbook",
    description:
      "5 paid mentorship programs that turn into FAANG offers — GSoC + LFX Mentorship + Outreachy + MLH Fellowship + Season of KDE/Docs. Proposal writing, mentor outreach, the 6-month application calendar. Complement to open-source-guide.",
    category: "Portfolio",
    difficulty: "Intermediate",
    estHours: 12,
    topicsCount: 14,
    progressPct: 0,
    hasPractice: false,
    iconAccent: "from-violet-500 to-cyan-500",
    roadmapSlugs: ["off-campus-cracker", "portfolio-builder"],
    topics: [
      topic("gsoc-why", "Why mentorship beats random PRs", [
        ["gsoc-stipend", "$1.5-3k stipend + summer-break alignment + alumni→FAANG", 22],
      ]),
      topic("gsoc-programs", "5 flagship programs in 2026", [
        ["gsoc-compare", "GSoC vs LFX vs Outreachy vs MLH vs Season-of-KDE", 24],
      ]),
      topic("gsoc-deepdive", "GSoC deep-dive", [
        ["gsoc-process", "Org list → proposal → coding → eval (8% selection)", 24],
      ]),
      topic("gsoc-proposal", "The proposal — what wins", [
        ["gsoc-proposal-anatomy", "10-section structure + before/after sample", 30],
      ]),
      topic("gsoc-find-org", "Finding the right org + project", [
        ["gsoc-2-week-lurk", "Read Ideas + lurk Zulip 2 wks + 3 small PRs first", 22],
      ]),
      topic("gsoc-first-pr", "First-PR sequence — 30 days before", [
        ["gsoc-first-pr-30", "Week-by-week from setup to mentor recognition", 22],
      ]),
      topic("gsoc-lfx", "LFX Mentorship — CNCF projects", [
        ["gsoc-lfx-tour", "K8s/Envoy/Argo/Falco + India alumni → FAANG", 22],
      ]),
      topic("gsoc-outreachy", "Outreachy — explicitly inclusive", [
        ["gsoc-outreachy", "$7k stipend + tier-3 woman → Mozilla → Microsoft path", 22],
      ]),
      topic("gsoc-mlh", "MLH Fellowship — paid 12-week internship", [
        ["gsoc-mlh-pods", "Pod structure + Stripe/Coinbase/Meta placements", 20],
      ]),
      topic("gsoc-longtail", "Long-tail programs — lower competition", [
        ["gsoc-longtail-list", "Season of KDE / Docs / Hyperledger / Sovereign Tech", 18],
      ]),
      topic("gsoc-outreach", "Mentor outreach — emails that land", [
        ["gsoc-templates", "4 templates + Hi-FirstName tone calibration", 22],
      ]),
      topic("gsoc-pipeline", "Mentorship → FAANG pipeline", [
        ["gsoc-5-cases", "5 anonymised India case studies", 22],
      ]),
      topic("gsoc-calendar", "6-month application calendar", [
        ["gsoc-month-by-month", "Sept→Aug — research → submit → work + recovery", 22],
      ]),
      topic("gsoc-skip", "When NOT to apply", [
        ["gsoc-skip-criteria", "5-question worksheet — when to wait a season", 16],
      ]),
    ],
  },
];

export const SUBJECTS_BY_SLUG: Record<string, Subject> = Object.fromEntries(
  SUBJECTS.map((s) => [s.slug, s]),
);

export function getSubject(slug: string): Subject | undefined {
  return SUBJECTS_BY_SLUG[slug];
}
