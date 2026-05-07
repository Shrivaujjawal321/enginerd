# Master Plan — Engineering Subjects (Hinglish, IIT-level)

> Yeh master plan hai. 28 naye subjects + 5 retained Java/Spring/MS subjects = 33 total.
> Har subject ka content `content/<slug>.md` me jaayega.
> Progress live `content/_progress.md` me update hoga.

## Writing rules (every agent must follow)

- **Language:** ~60% Hindi-Roman + 40% English. Technical terms English me. "tu/tum" tone, never "aap".
- **Voice:** Senior dev → intern. Formal but warm. Patient, never condescending.
- **Depth:** IIT-level. Beginner samajh sake "what" aur "why", senior engineer ko "how" aur interview answer me bhi naya kuchh mile.
- **Length:** Long, deep, comprehensive. Kuch bhi miss nahi hona chahiye.
- **No emoji** in body content.

## Per-subtopic structure (waterfall, mandatory)

```
### <Subtopic Title>
#### Definition (kya hai?)
   ...full Hinglish paragraph(s)...

#### Why? (kyon zaroori hai?)
   ...problem statement, real-world need...

#### How? (kaise kaam karta hai?)
   ...mechanism + code with Hinglish comments...
   ```language
   // Hinglish comments
   code...
   ```

#### Real-life Example
   ...production scenario + code...
   ```language
   // production-grade code
   ```

#### Diagram
   ```mermaid
   flowchart LR
     ...valid mermaid...
   ```

#### Interview Question
   **Q:** ...realistic, asked in actual interviews...
   **A:** ...detailed Hinglish answer (long), include trade-offs and gotchas...
```

## Hierarchy (waterfall)

```
# <Subject Title>            (H1)
## <Topic Title>              (H2)
### <Subtopic Title>          (H3)
#### Definition / Why / How / Example / Diagram / Interview   (H4)
```

---

## Retained subjects (already have content, NO regeneration)

1. `java-fundamentals` — Core Java
2. `java-collections` — Java Collections & Streams
3. `spring-boot-basics` — Spring Framework + Spring Boot
4. `jpa-and-databases` — JPA & Databases
5. `microservices` — Microservices

---

## New subjects to generate (28)

### Frontend (12)

#### 1. `html-fundamentals` — HTML (Complete)
- **Structure**
  - doctype, head, body
- **Semantic tags**
  - header, nav, section, article, aside, footer, main
- **Text & inline elements**
  - p, span, strong, em, br, hr, abbr, code, kbd
- **Links & navigation**
  - anchor tags, target, rel, internal vs external nav
- **Media**
  - img with alt, audio, video, srcset, picture, lazy loading
- **Lists & tables**
  - ul/ol/dl, table semantics (thead/tbody/tfoot, scope, caption)
- **Forms**
  - Input types (text, email, number, date, file, range, color, etc.)
  - Validation (required, pattern, min/max, custom)
  - Labels & accessibility (label-for, fieldset, legend)
  - Form submission (GET vs POST, multipart, encoding)
- **SEO basics**
  - meta tags, title, description, canonical, og tags
- **Accessibility (ARIA)**
  - roles, aria-label, aria-live, focus management
- **Canvas & SVG**
  - 2D canvas drawing, SVG primitives, when to use which
- **Iframes**
  - sandbox, postMessage, security

#### 2. `css-fundamentals` — CSS (Complete)
- **Selectors & specificity**
  - type, class, id, attribute, pseudo-class, pseudo-element, combinators
  - specificity calculation
- **Box model**
  - content, padding, border, margin, box-sizing
- **Units**
  - px, rem, em, %, vh, vw, ch, fr; when to use which
- **Layout**
  - display types (block, inline, inline-block, none)
  - positioning (static, relative, absolute, fixed, sticky)
  - Flexbox (axis, justify-content, align-items, gap)
  - Grid (grid-template, areas, auto-fit/auto-fill, minmax)
- **Responsive design**
  - Media queries, mobile-first vs desktop-first
  - Container queries (modern)
- **Advanced**
  - Animations & transitions (timing functions, keyframes)
  - Transform (translate, rotate, scale, 3D)
  - CSS variables (custom properties, fallback)
  - BEM methodology
  - SASS/SCSS basics (variables, mixins, nesting, partials)

#### 3. `javascript-deep` — JavaScript (Deep)
- **Basics**
  - Variables (var/let/const), data types, type coercion
  - Operators, control flow
  - Functions (declarations, expressions, arrow, HOF, IIFE)
- **Core concepts**
  - Execution context, call stack
  - Hoisting (var/function/let)
  - Closures (deep)
  - Scope (lexical, block, function, module)
  - `this` keyword (implicit, explicit, default, arrow exception)
- **Objects & arrays**
  - Destructuring (patterns, defaults)
  - Spread/rest
  - Array methods (map, filter, reduce, flat, etc.)
  - Object methods (keys, entries, freeze, assign)
- **Async JS**
  - Event loop (microtask vs macrotask queue)
  - Promises (states, chaining, all/race/any)
  - async/await + error handling
- **Browser APIs**
  - DOM manipulation (query, create, update, remove)
  - Events & delegation
  - Fetch API / AJAX (XHR comparison)
  - Storage (localStorage, sessionStorage, cookies, IndexedDB intro)
- **Module system & tooling**
  - ES Modules (import/export, named vs default)
  - NPM/Yarn (package.json, lockfile, scripts)
  - Bundlers (Webpack vs Vite — concepts)
  - Environment variables

#### 4. `react-complete` — React (Complete)
- **Components**
  - Functional vs class, JSX, fragments, props.children
- **Props & state**
  - Lifting state, prop drilling problem
- **Hooks**
  - useState, useEffect (deps array, cleanup)
  - useContext, useRef
  - useMemo, useCallback (when actually needed)
- **Routing**
  - Client routing, dynamic routes, nested routes
- **State management**
  - Context API (when enough)
  - Redux (store, reducers, actions, middleware, RTK)
- **Advanced**
  - Custom hooks (composition)
  - Error boundaries
  - Code splitting (React.lazy, Suspense)
  - Lazy loading
  - Performance optimization (memo, profiler)

#### 5. `nextjs-modern` — Next.js (Modern, App Router)
- **Rendering modes**
  - SSR, SSG, ISR, RSC vs Client components
- **API routes**
  - Route handlers, dynamic segments, middleware
- **SEO optimization**
  - metadata API, sitemap, robots.txt, OpenGraph

#### 6. `frontend-api-integration` — API Integration
- **REST APIs**
  - Resources, idempotency, status codes
- **HTTP methods**
  - GET, POST, PUT, PATCH, DELETE — semantics
- **Headers & auth**
  - Common headers, Bearer tokens, CORS, cookies
- **Error handling**
  - Network errors, retries, timeouts, exponential backoff
- **Axios vs Fetch**
  - When to use which, interceptors, defaults

#### 7. `frontend-testing` — Testing Frontend
- **Unit testing**
  - Pure functions, mocking
- **Component testing**
  - React Testing Library philosophy (test behavior, not implementation)
- **Snapshot testing**
  - When useful, when dangerous
- **Tools**
  - Jest, Vitest, RTL — comparisons

#### 8. `frontend-security` — Frontend Security
- **XSS prevention**
  - Reflected, stored, DOM XSS; sanitization
- **CSRF basics**
  - SameSite cookies, CSRF tokens
- **Secure storage**
  - localStorage vs httpOnly cookies, what NOT to store
- **Content Security Policy**
  - directives, nonces, hashes

#### 9. `frontend-performance` — Frontend Performance
- **Code splitting**
  - Route-based, component-based
- **Lazy loading**
  - Images, components, data
- **Memoization**
  - React.memo, useMemo, useCallback — actual benefit
- **Image optimization**
  - srcset, picture, modern formats (AVIF/WebP), CDN

#### 10. `accessibility-seo` — Accessibility & SEO
- **ARIA roles**
  - landmark, widget, document structure
- **Keyboard navigation**
  - tabindex, focus trap, skip links
- **Lighthouse**
  - audits, scoring, fixing
- **Structured data**
  - JSON-LD, schema.org

#### 11. `pwa-fundamentals` — Progressive Web Apps
- **Service workers**
  - lifecycle, registration, scope
- **Caching**
  - Cache API, strategies (network-first, cache-first, SWR)
- **Offline support**
  - offline pages, background sync
- **Web manifest**
  - icons, display modes, install prompt

#### 12. `frontend-deployment` — Frontend Deployment
- **Build process**
  - Bundling, minification, tree-shaking
- **Static hosting**
  - Vercel, Netlify, S3+CloudFront
- **Environment configs**
  - Build-time vs runtime vars, secrets handling

---

### Database (2)

#### 13. `database-sql` — SQL (Deep)
- **CRUD basics**
  - SELECT, INSERT, UPDATE, DELETE
- **Joins**
  - INNER, LEFT, RIGHT, FULL, CROSS, SELF
- **Indexing**
  - B-tree, hash, composite, covering, partial
- **Transactions (ACID)**
  - isolation levels, anomalies
- **Advanced SQL**
  - Subqueries (correlated, scalar)
  - Views (materialized vs regular)
  - Stored procedures
  - Triggers
- **Database design**
  - Normalization (1NF, 2NF, 3NF, BCNF) & denormalization
  - ER diagrams
  - Schema design (PK, FK, constraints)
  - Query optimization (EXPLAIN, indexes, query plans)

#### 14. `database-nosql` — NoSQL
- **Document model**
  - Schema-less, embedding vs referencing
- **MongoDB basics**
  - CRUD, aggregation pipeline, indexes
- **CAP theorem**
  - Consistency, Availability, Partition tolerance — pick 2

---

### DevOps (5)

#### 15. `git-version-control` — Git
- **Init, clone, commit**
  - basic workflow, .gitignore
- **Branching & merging**
  - feature branches, fast-forward vs no-ff
- **Rebase & cherry-pick**
  - history rewriting, interactive rebase, conflicts

#### 16. `cicd-pipelines` — CI/CD
- **Pipeline stages**
  - source → build → test → deploy
- **Build → Test → Deploy**
  - artifacts, environments, rollback

#### 17. `docker-containers` — Docker
- **Images & containers**
  - layers, immutability
- **Dockerfile**
  - multi-stage builds, best practices
- **Docker Compose**
  - multi-container apps
- **Volumes & networking**
  - persistence, bridge/host/overlay networks

#### 18. `kubernetes-orchestration` — Kubernetes
- **Pods**
  - smallest unit, multi-container patterns (sidecar, ambassador)
- **Deployments**
  - replicas, rolling update, rollback
- **Services**
  - ClusterIP, NodePort, LoadBalancer
- **Scaling**
  - HPA, cluster autoscaling

#### 19. `server-deployment` — Server Deployment
- **Server setup**
  - Linux basics, SSH, systemd
- **Environment variables**
  - dotenv, vault, runtime injection
- **Reverse proxy (NGINX)**
  - load balancing, TLS termination, caching

---

### System Design (3)

#### 20. `system-design-basics` — System Design Basics
- **Client-server architecture**
- **API design**
  - REST best practices, versioning, pagination
- **Monolith vs Microservices**
  - tradeoffs

#### 21. `system-design-advanced` — System Design Advanced
- **Load balancing**
  - L4 vs L7, algorithms (RR, least-conn, IP-hash)
- **Caching strategies**
  - cache-aside, write-through, write-behind, TTL
  - **Tool: Redis** — data structures, persistence, pub/sub
- **Rate limiting**
  - token bucket, leaky bucket, sliding window
- **Circuit breaker**
  - Hystrix-style patterns
- **Database sharding**
  - range, hash, geo, directory-based
- **Consistency vs Availability**
  - CAP/PACELC

#### 22. `messaging-systems` — Messaging Systems
- **Pub/Sub**
- **Message queues**
- **Apache Kafka**
  - topics, partitions, consumer groups, exactly-once
- **RabbitMQ**
  - exchanges, queues, bindings, routing keys

---

### Cloud (2)

#### 23. `cloud-fundamentals` — Cloud Fundamentals
- **Cloud computing basics**
  - on-prem vs cloud, regions vs AZs
- **IaaS, PaaS, SaaS**
- **Core concepts**
  - Load balancing, Auto-scaling, CDN, Multi-region deployment

#### 24. `cloud-platforms` — Cloud Platforms
- **Amazon Web Services (AWS)**
  - IAM, EC2, S3, VPC, RDS, Lambda
- **Google Cloud Platform (GCP)**
  - IAM, Compute Engine, GCS, BigQuery, Cloud Functions

---

### Monitoring (1)

#### 25. `monitoring-observability` — Monitoring & Logging
- **Centralized logging**
  - structured logs, log levels, retention
- **Metrics collection**
  - counters, gauges, histograms; cardinality
- **Alerting**
  - SLO/SLI, alert fatigue
- **Tools**
  - ELK Stack (Elasticsearch + Logstash + Kibana)
  - Prometheus
  - Grafana

---

### Testing (1)

#### 26. `software-testing` — Software Testing
- **Unit testing**
- **Integration testing**
- **End-to-end testing**
- **Mocking**
  - stubs, spies, mocks — when to use what

---

### Engineering Practices (2)

#### 27. `clean-code-solid` — Clean Code & SOLID
- **Clean Code principles**
  - naming, functions, comments, error handling
- **SOLID principles**
  - S — Single Responsibility
  - O — Open/Closed
  - L — Liskov Substitution
  - I — Interface Segregation
  - D — Dependency Inversion

#### 28. `design-patterns` — Design Patterns
- **Singleton**
- **Factory**
- **Observer**
- **Strategy**

---

## Generation strategy

- 5 batches × 5-7 agents each = 28 agents total
- Each agent runs in background, writes to `content/<slug>.md`
- After every batch, `_progress.md` updated with completion status

## Done criteria (per subject)

- [ ] All topics covered
- [ ] All subtopics covered
- [ ] Each subtopic has all 6 sections (Definition, Why, How, Example, Diagram, Interview)
- [ ] Code snippets compile and have Hinglish comments
- [ ] Mermaid diagrams are valid syntax
- [ ] Length is generous (target: 8000+ words per subject for medium, 15000+ for large like JS/React)
