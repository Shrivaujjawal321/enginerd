# Frontend Deployment

Bhai, deployment basically tumhare local code ko duniya tak pahunchana hai. Localhost pe sab kuch chamak ke chalta hai — production pe pohonchne tak ek lamba safar hai jisme bundling, hosting, env vars, CDN, cache headers, security headers, monitoring — sab kuch aata hai. Frontend deployment ka game samajhna ek senior engineer ke liye non-negotiable hai kyunki agar tumhara JS bundle 4 MB ka hai, tumhara API key client side leak ho raha hai, ya tumhare static assets pe CDN cache nahi laga — toh ya toh user bhaag jayega ya tumhari company ka AWS bill aasman chhu lega.

Is module mein hum teen badi cheezein deeply samjhenge. Pehle, **build process** — yaani Webpack/Vite/esbuild kaise tumhare React/Next/Vue source code ko optimized static assets mein convert karte hain (bundling, minification, tree-shaking ka actual mechanics). Doosra, **static hosting platforms** — Vercel, Netlify, S3+CloudFront, GitHub Pages — kab kaunsa choose karna hai aur kyun. Teesra, **environment configuration** — build-time vs runtime variables ka fundamental difference, secrets ko kaise handle karte hain, `.env` files ka right way to use.

Yeh sab interview mein bhi ghuma ke poocha jata hai. Senior log "tu deploy kaise karta hai" puchhke tumhare overall engineering maturity ko judge karte hain. Toh pakka karke samjho, code likho, aur Mermaid diagrams ko mentally visualize karo.

---

## 1. Build process

Build process matlab tumhare source code (TypeScript, JSX, SCSS, SVG, Markdown, etc.) ko ek aisa output mein convert karna jo browser direct kha sake — yaani plain JS, CSS, HTML, aur optimized assets. Source code mein tum imports likhte ho, JSX likhte ho, modern ES2024 syntax use karte ho — browser woh sab nahi samajhta (especially purane browsers). Bundler ka kaam hai sab kuch ek (ya kuch chunked) JS file mein ghuska ke, transpile karke, minify karke, tree-shake karke, output `dist/` ya `.next/` mein dump karna.

### 1.1 Bundling, minification, tree-shaking

#### Definition

**Bundling** matlab multiple modules (files) ko combine karke fewer output files banana. Tumhare code mein 500 `.tsx` files ho sakti hain — browser har file ke liye separate HTTP request nahi maar sakta (waterfall problem). Bundler dependency graph build karta hai — entry point se shuru karke har `import` statement ko follow karta hai, aur ek (ya code-split) bundle banata hai.

**Minification** matlab whitespace, comments, long variable names hatake JS/CSS file ka size kam karna. `function calculateUserAge(birthYear)` ban jata hai `function a(b)`. CSS mein `background-color: #ffffff` ban jata hai `background:#fff`. Gzip/Brotli compression ke saath milake yeh 70-80% size kam kar deta hai.

**Tree-shaking** matlab dead code elimination — agar tum lodash se sirf `debounce` import kar rahe ho, toh poori lodash library bundle mein nahi jaani chahiye. Bundler ESM (`import`/`export`) ke static analysis se figure karta hai kaun sa code "reachable" hai aur kaun sa nahi. Unreachable code = shake off the tree.

#### Why?

Bhai network slow hai, especially 3G/4G India mein. Har extra KB matlab extra milliseconds load time. Google ka research bolta hai 100ms delay = 1% conversion drop. Agar tumhara JS bundle 2 MB unminified hai, mobile pe parse karne mein 3-4 second lag jayenge — user tab band kar dega.

- **Bundling** = fewer HTTP requests = faster load. (HTTP/2 multiplexing ke baad bhi bundling matters because of parsing/cache efficiency.)
- **Minification** = smaller bytes = faster download + faster parse.
- **Tree-shaking** = sirf wahi code ship karo jo actually use ho raha hai. Especially important hai jab tumhari team 50 dependencies install kar leti hai aur sirf 10% use karti hai.

Aur production cost-wise bhi — CDN bandwidth ka bill bytes ke hisaab se aata hai. 1 MB ka bundle 100k users ko ship karna = 100 GB egress = bill.

#### How?

Common bundlers — Webpack, Vite, esbuild, Rollup, Parcel, Turbopack. Har ek ka apna philosophy hai.

**Webpack** — purana, mature, plugin ecosystem ka king. Slow-ish but configurable to the bone.

```js
// webpack.config.js — yeh classic Webpack 5 setup hai
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin'); // minification ke liye

module.exports = {
  mode: 'production', // production mode automatically minify + tree-shake karta hai
  entry: './src/index.tsx', // entry point — yahan se dependency graph banta hai
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js', // contenthash = cache busting
    clean: true, // har build pe dist clean kar do
  },
  module: {
    rules: [
      // TypeScript ko JS mein convert karne ka loader
      { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },
      // CSS ko JS mein inject karna (chhoti apps ke liye)
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()], // Terser = JS minifier
    usedExports: true, // tree-shaking ke liye — used exports mark karta hai
    sideEffects: false, // bolo Webpack ko ki modules ke side effects nahi hain
    splitChunks: { chunks: 'all' }, // vendor code alag chunk mein daalo
  },
  resolve: { extensions: ['.tsx', '.ts', '.js'] },
};
```

**Vite** — modern, dev mode mein native ESM use karta hai (no bundling in dev = blazing fast HMR). Production build ke liye Rollup ko under the hood use karta hai.

```ts
// vite.config.ts — Vite super clean hai, conventions over configuration
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()], // React Fast Refresh + JSX transform
  build: {
    target: 'es2020', // kaunsi modern syntax preserve karni hai
    minify: 'esbuild', // esbuild = ultra fast minifier (Go mein likha)
    sourcemap: true, // production debugging ke liye source maps
    rollupOptions: {
      output: {
        // manual chunking — vendor code alag rakhna for better caching
        manualChunks: {
          react: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
});
```

**esbuild** — Go mein likha, blazing fast, but plugin ecosystem chhota hai. Use case — chhote tools, libraries, ya jab tumhe build speed sabse zyada chahiye.

```js
// esbuild.config.js — programmatic API
const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/index.tsx'],
  bundle: true,            // sab modules ko ek file mein laana
  minify: true,            // minification on
  treeShaking: true,       // dead code elimination
  splitting: true,         // code-splitting (ESM only)
  format: 'esm',           // output format ESM
  target: ['es2020', 'chrome90', 'firefox90'], // browser targets
  outdir: 'dist',
  sourcemap: 'external',   // alag .map file
  loader: { '.png': 'file', '.svg': 'dataurl' },
}).catch(() => process.exit(1));
```

**Tree-shaking** ka actual mechanics dekho — yeh ESM static imports pe depend karta hai:

```js
// utils.js — named exports rakho, default object mat banao
export function add(a, b) { return a + b; }
export function multiply(a, b) { return a * b; }
export function divide(a, b) { return a / b; } // yeh kahin import nahi ho rahi

// app.js — sirf jo chahiye wohi import karo
import { add } from './utils.js';
console.log(add(2, 3));

// Bundler dekhega: divide aur multiply kahin import nahi hue → drop them.
// Output bundle mein sirf `add` jayega.
```

Common tree-shaking blockers — CommonJS (`require`), side-effects in modules (jaise top-level `console.log` ya global mutation), aur `package.json` mein `"sideEffects": true` declare karna. Modern libraries `"sideEffects": false` declare karti hain ya specific files list karti hain.

#### Real-life Example

Maan le tu ek e-commerce SPA bana raha hai — 200 components, 30 npm packages, lodash, moment, MUI, recharts. Bina optimization ke tera bundle 5 MB ho jata. Ab dekho:

1. **Bundling** se 200 files → 4 chunks (main, vendor, async-routes, polyfills).
2. **Minification** se 5 MB → 1.5 MB.
3. **Tree-shaking** se MUI ke 100 components mein se sirf 20 used = 1.5 MB → 800 KB.
4. **Code-splitting + lazy loading** se initial bundle 800 KB → 250 KB (bakki async load hote hain).
5. **Gzip/Brotli** se 250 KB → 80 KB over the wire.

Pehle 5 MB ka bundle, ab 80 KB. Yeh 60x improvement hai. Yahi reason hai ki Flipkart, Amazon, Myntra jaise sites mobile pe bhi 2-3 second mein load ho jaate hain.

Pro tip — `npx source-map-explorer dist/*.js` chala ke dekho exactly kaun sa module kitna bundle space le raha hai. Aksar `moment.js` (300 KB) ya `lodash` (full) bundle mein chhupke ghus jaate hain. `moment` ko `dayjs` (2 KB) se replace karna ek classic optimization hai.

#### Diagram

```mermaid
flowchart TD
    A[Source Files: .tsx, .css, .svg] --> B[Bundler Entry Point]
    B --> C[Dependency Graph Construction]
    C --> D[Loaders/Transformers: TS->JS, SCSS->CSS]
    D --> E[Tree-Shaking: dead code removal]
    E --> F[Code Splitting: vendor/main/async chunks]
    F --> G[Minification: Terser/esbuild]
    G --> H[Compression: gzip/brotli at CDN]
    H --> I[Hashed Output: main.a3f9.js]
    I --> J[Deploy to CDN/Static Host]
```

#### Interview Q&A

**Q1. Bhai tree-shaking kaise kaam karta hai aur kab fail ho jata hai?**

Tree-shaking ESM ke static structure pe depend karta hai. ESM mein `import`/`export` top-level declarations hain — bundler statically (without running code) figure kar sakta hai kaun sa export use ho raha hai aur kaun sa nahi. Webpack/Rollup `usedExports` mark karte hain, phir minifier (Terser) unused declarations ko drop kar deta hai. Process is do-step — pehle "marking" (which exports are used), phir "elimination" (unused code remove). Yeh sirf production mode mein hota hai by default.

Fail kab hota hai? Pehla — CommonJS imports (`require('./x')`) dynamic hain, statically analyze nahi ho sakte. Doosra — side effects: agar koi module top-level pe `window.foo = bar` kar raha hai ya CSS import kar raha hai, bundler bolta hai "yeh module side effect ke liye import hua hoga, drop nahi karunga". Solution — `package.json` mein `"sideEffects": false` declare karo ya specific files list karo (`["*.css"]`). Teesra — re-exports through namespace (`import * as utils from './utils'`) tree-shaking ko break kar sakte hain kyunki bundler exact usage track nahi kar pata. Best practice — named imports/exports use karo, default exports avoid karo for utilities, aur libraries ke ESM build prefer karo (`module` field in `package.json`).

Real-world bug example — kisi ne `import _ from 'lodash'` likha (CJS default import) instead of `import { debounce } from 'lodash-es'`. Result — poori 70 KB lodash bundle mein. Senior reviewer ne pakda aur `lodash-es` migration karwaya, bundle 50 KB drop hua.

**Q2. Webpack vs Vite vs esbuild — kaunsa use karoge aur kab?**

Webpack mature ecosystem hai — har edge case ke liye loader/plugin available hai. Big enterprise apps jahan custom build pipeline chahiye, micro-frontends, Module Federation use ho raha hai — Webpack still rules. Downside — slow dev startup (poora bundle banta hai), config complex hai, aur HMR hamesha snappy nahi hota. Webpack 5 mein persistent caching aaya jisne dev experience improve kiya, but Vite ke saamne phir bhi slow hai.

Vite ka killer feature hai dev mode — yeh dev server mein bundling karta hi nahi! Browser native ESM use karta hai, on-demand modules serve hote hain, aur HMR sub-100ms hota hai bade projects mein bhi. Production mein Rollup use karta hai — clean, opinionated, modern. React/Vue/Svelte ke liye plugins official hain. Choose Vite for new SPAs and most greenfield projects.

esbuild Go mein likha hai — 10-100x faster than JS-based bundlers. But plugin ecosystem limited hai aur CSS support basic hai. Use case — libraries publish karna, monorepos mein internal tooling, ya jab tumhare CI/CD mein build time critical hai. Tools ke under-the-hood — Vite, tsup, Snowpack — esbuild use karte hain. Direct esbuild use karna tab when you control the entire stack and don't need fancy plugin chains. Senior recommendation — naya project? Vite. Existing Webpack project? Migrate slowly to Turbopack/Rspack (Webpack-compatible, Rust-based, fast). Library publish karna? tsup (built on esbuild).

**Q3. Code-splitting kya hai aur tree-shaking se kaise alag hai?**

Code-splitting matlab tumhare bundle ko multiple chunks mein todna jo on-demand load ho — typically route-based ya component-based. Tree-shaking compile-time pe dead code remove karta hai. Code-splitting runtime pe lazy loading enable karta hai. Dono complementary hain — tree-shaking pehle hota hai (jo unused hai woh bundle mein aaye hi nahi), code-splitting baad mein (jo used hai usse multiple files mein todo for parallelism aur on-demand fetching).

React mein `React.lazy()` aur dynamic `import()` se hota hai. Jab user `/dashboard` route pe nahi gaya, dashboard ka JS download hi nahi hoga. Webpack/Vite automatically dynamic imports ko alag chunks mein convert kar dete hain. Output mein tumhe `main.js`, `dashboard.a3f9.js`, `settings.b2e1.js` jaise files dikhenge. Initial page load fast, subsequent navigation pe small chunk fetch.

Trade-off — bahut zyada split karoge toh waterfall problem (chunk A loads chunk B loads chunk C). Sweet spot — route-level splitting + heavy component-level splitting (e.g., chart libraries, rich text editors). Aur prefetch/preload hints use karo (`<link rel="prefetch">`) jab user hover kare ya idle ho — Next.js yeh automatically karta hai `<Link>` pe.

---

## 2. Static hosting

Static hosting matlab pre-built HTML/CSS/JS files ko ek server (ya CDN) pe daalna jo unhe directly serve kar de. No runtime, no Node.js process, no DB. SSR/SSG/ISR ka bhi yahi base hai — pre-render karke static dump kar do.

### 2.1 Vercel, Netlify, S3+CloudFront, GitHub Pages — kab kaunsa pick karein

#### Definition

- **Vercel** — Next.js ke creators ka platform. Git push karo, deploy automatic, CDN automatic, serverless functions automatic, edge runtime automatic. Magic-level DX.
- **Netlify** — Vercel ka older sibling. Same idea — Git-based deploys, build hooks, serverless functions, forms, identity, A/B testing.
- **S3 + CloudFront** — AWS ka raw building blocks. S3 = object storage (tumhari static files yahan rehti hain), CloudFront = global CDN (S3 ke saamne edge cache layer). Manual setup, but full control + cheap at scale.
- **GitHub Pages** — free static hosting from GitHub. Sirf public repos (free) ya GitHub Pro pe private. Limitations — no custom server logic, no build env variables (well, with Actions you can), 1 GB storage, 100 GB/month bandwidth.

#### Why?

Static hosting matters because static files = fast + cheap + secure. No server to hack, no DB to optimize, no scaling worries (CDN handles it). 90% of frontend deployments either are pure static ya hybrid (static + serverless functions).

Choosing the right platform matters because:
- **DX vs Cost** — Vercel/Netlify amazing DX dete hain but expensive at scale.
- **Vendor lock-in** — Vercel features (image optimization, ISR, middleware) Vercel-specific hain. Migrate karna pain.
- **Compliance** — Enterprise often needs AWS (GovCloud, region control, audit logs).
- **Build limits** — Free tiers pe build minutes limited, concurrent builds limited.

Galat platform choose karne pe — chhota startup AWS pe time waste karega; bada enterprise Vercel pe $50k/month bill khayega.

#### How?

**Vercel deployment** — sabse simple. `vercel.json` (optional) + Git connect.

```json
// vercel.json — Next.js detect ho jata hai automatically, par custom needs ke liye
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["bom1", "sin1"],   // Mumbai aur Singapore mein deploy karo (low latency for India)
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ],
  "redirects": [
    { "source": "/old-blog/:slug", "destination": "/blog/:slug", "permanent": true }
  ]
}
```

CLI se deploy: `vercel --prod`. Done. CDN, SSL, preview URLs per PR — sab automatic.

**Netlify deployment** — `netlify.toml` config:

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"               # Vite/CRA output directory

[build.environment]
  NODE_VERSION = "20"

# Custom redirects (Netlify ka apna DSL)
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

# SPA fallback — saari routes index.html pe serve karo
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

**S3 + CloudFront** — manual but powerful. AWS CLI ya Terraform se:

```bash
# build kar lo pehle
npm run build

# S3 bucket pe upload karo (assuming bucket already exists with static hosting on)
# --delete flag = jo files local mein nahi hain woh S3 se hatao
aws s3 sync ./dist s3://my-frontend-bucket --delete \
  --cache-control "public, max-age=31536000, immutable"   # hashed assets ke liye long cache

# index.html ko alag se short cache ke saath upload karo
aws s3 cp ./dist/index.html s3://my-frontend-bucket/index.html \
  --cache-control "public, max-age=0, must-revalidate"

# CloudFront cache invalidate karo taaki new index.html immediately serve ho
aws cloudfront create-invalidation \
  --distribution-id E1ABCDEF234 \
  --paths "/index.html"
```

CloudFront distribution setup mein critical settings:
- **Origin** = S3 bucket (use OAC — Origin Access Control — bucket public mat banao)
- **Default root object** = `index.html`
- **Custom error response** = 403/404 → `/index.html` with 200 (SPA routing)
- **Cache policy** = `CachingOptimized` for assets
- **Viewer protocol policy** = `Redirect HTTP to HTTPS`

```hcl
# Terraform snippet — production-grade S3+CloudFront setup
resource "aws_s3_bucket" "frontend" {
  bucket = "my-frontend-prod"
}

resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  default_root_object = "index.html"

  origin {
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = "s3-frontend"
    # OAC se bucket ko private rakho
    origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
  }

  default_cache_behavior {
    target_origin_id       = "s3-frontend"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6" # CachingOptimized managed policy
  }

  # SPA fallback — 403 ko index.html bhejo
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  viewer_certificate {
    acm_certificate_arn = var.acm_cert_arn
    ssl_support_method  = "sni-only"
  }
}
```

**GitHub Pages** — GitHub Actions workflow se:

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci && npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: ./dist }
      - id: deployment
        uses: actions/deploy-pages@v4
```

#### Real-life Example

**Scenario 1 — Early-stage startup, Next.js app, 5 devs, traffic 10k/month:** Vercel. Free tier pura cover karega. Preview deployments per PR = code review ka game-changer. ISR, image optimization, edge functions out-of-the-box. DX optimization karo, premature infra optimization mat karo.

**Scenario 2 — Vue SPA, marketing site, marketing team content updates karta hai via CMS:** Netlify. Built-in form handling, identity, split testing. Webhook se Contentful/Sanity push pe rebuild trigger ho jata hai.

**Scenario 3 — Enterprise React app, 5M users, compliance needs (ISO 27001, SOC2), custom WAF rules, multi-region failover:** S3 + CloudFront + WAF + Route53. Vercel ka same scale pe bill $30-50k/month aa sakta hai; AWS pe $2-5k mein ho jayega (with engineer effort). Plus full audit trail, IAM control, region-specific deployment.

**Scenario 4 — Open source library docs, hobbyist project, no traffic spikes expected:** GitHub Pages. Free, simple, auto-SSL, custom domain support. `mkdocs`, `Docusaurus`, ya plain Vite app. Limitation — no server-side logic, but for docs koi farak nahi padta.

Real war story — meri ek company ne Vercel pe Next.js app rakha tha. Initial 6 months sab great. Phir Black Friday traffic 50x ho gaya, bandwidth bill $18k/month aa gaya. Migrate kiya S3+CloudFront pe (Next.js ko `output: 'export'` se static banaya, dynamic parts ko separate Lambda+API Gateway pe). Bill $1.2k/month ho gaya. But 2 engineer-months lage migration mein. Lesson — DX cost vs infra cost ka equilibrium scale ke saath shift hota hai.

#### Diagram

```mermaid
flowchart LR
    A[Git Push] --> B{Platform Choice}
    B -->|DX-first| C[Vercel/Netlify]
    B -->|Cost-first at scale| D[S3 + CloudFront]
    B -->|Free OSS docs| E[GitHub Pages]

    C --> F[Auto Build + Deploy + Preview URLs]
    D --> G[CI: Build -> S3 sync -> CF invalidate]
    E --> H[GH Actions -> Pages Artifact]

    F --> I[Global CDN Edge]
    G --> I
    H --> I
    I --> J[End User Browser]
```

#### Interview Q&A

**Q1. Bhai SPA ke liye S3+CloudFront pe routing kaise handle karoge?**

Yeh classic gotcha hai. Tu deploy karta hai React Router app ko S3 pe. Home page chalta hai. Phir tu `/about` pe directly visit karta hai ya refresh marta hai — 403/404 aata hai. Reason — S3 ko `/about` naam ka object nahi mila. SPA mein client-side routing hota hai, server pe sirf `index.html` hai jo JS load karta hai jo phir `/about` render karta hai.

Solution — CloudFront pe custom error response setup karo. 403 (S3 default for missing object jab OAC use ho raha ho) aur 404 ko `/index.html` pe redirect karo with HTTP status 200. Important — status 200, redirect 301/302 nahi, kyunki browser ko URL change nahi karna chahiye. Iska matlab hai S3 koi bhi unknown path → CloudFront → returns `index.html` with 200 → browser loads JS → React Router reads `window.location.pathname` aur correct component render karta hai.

Alternative — CloudFront Functions ya Lambda@Edge se request rewrite karo. Yeh zyada flexible hai (e.g., locale-based redirects, A/B routing) but overkill for simple SPA. CloudFront ke managed `SimpleCORS` ya custom response policy use karo, aur cache `index.html` short TTL pe rakho (1 min ya `must-revalidate`) taaki updates jaldi propagate ho jaayein.

**Q2. Vercel mahenga hota hai bolte hain — kab justify hota hai aur kab nahi?**

Vercel ka pricing model hai bandwidth + serverless invocations + image optimization + ISR generations. Marketing/blog/dashboard apps tak — jahan traffic predictable hai aur DX matter karta hai — Vercel super justify hota hai. Engineering team ka time bachana > infra cost bachana. $20/dev/month Pro plan mein preview deployments, password protection, analytics — sab kuch milta hai. 5 devs = $100/month, jo 1 SDE-1 ke 1 hour ka cost hai.

Justify nahi hota tab — high-bandwidth video/image-heavy apps, large enterprise with existing AWS commitments, regulatory needs (data residency, compliance certifications Vercel doesn't have at low tiers), ya jab tumhari team AWS expertise rakhti hai already. Vercel ka image optimization $5/1000 images aata hai — agar tumhari app pe daily 100k images load hote hain, woh $500/day = $15k/month. AWS pe Lambda + Sharp se same kaam $50/month mein ho jata hai.

Migration strategy — pehle profiling karo. Vercel dashboard mein bandwidth, function invocations, image transformations dekho. Top 3 cost drivers identify karo. Phir incrementally — heavy assets CloudFront pe, dynamic API routes Lambda pe, static pages S3 pe move karo. Static export mode mein Next.js ko bhi S3 pe deploy kiya ja sakta hai (with limitations on ISR, middleware). Tradeoff hamesha DX, velocity, vs raw cost ka hai.

**Q3. CDN cache invalidation kaise handle karte ho? Stale content ka problem kya hai?**

CDN basic principle hai — origin se file fetch karo, edge pe cache karo, next request pe edge se serve karo. Problem — agar tumne file update kari aur cache expire nahi hua, users ko purani file milegi. Solution layered hai.

Pehla layer — **content hashing**. Build pe har asset ka filename mein content hash daalo: `main.a3f9c2.js`. File change = hash change = naya filename = browser/CDN ko naya request maarna padega. Yeh hashed assets ko long cache (`max-age=31536000, immutable`) pe rakh sakte ho — kabhi invalidate hi nahi karna padega. 95% problem yahan solve ho jata hai.

Doosra layer — **`index.html` short cache**. HTML file mein hashed asset URLs reference hote hain. Agar HTML cache ho gaya, naye assets discover hi nahi honge. So `index.html` ko `Cache-Control: no-cache, must-revalidate` ya max-age 0-60 seconds rakho. Trade-off — har request pe origin hit hoga (validation), but conditional requests (304 Not Modified) fast hain.

Teesra layer — **explicit invalidation**. CloudFront/Vercel/Netlify pe API se invalidation trigger karo deploy ke baad. CloudFront mein `aws cloudfront create-invalidation --paths "/*"` — but yeh slow hai (5-10 min) aur paid hai (1000 free per month, then $0.005/path). Best practice — sirf `/index.html` aur `/sitemap.xml` invalidate karo, hashed assets ko mat chedo. Vercel/Netlify yeh automatically per-deploy karte hain. Stale-while-revalidate (SWR) pattern bhi useful hai — stale serve karo while fetching fresh in background; user ko delay nahi feel hota.

---

## 3. Environment configs

Frontend apps ko different environments mein different configs chahiye — local, staging, production. API URLs, feature flags, analytics IDs, third-party keys, log levels — sab vary karte hain. Galat handling = staging ka API key prod mein, ya worse, secret key client bundle mein leak.

### 3.1 Build-time vars (NEXT_PUBLIC_*, VITE_*) vs runtime vars, secrets handling, .env files

#### Definition

- **Build-time variables** — build process ke time pe inject hote hain. Bundler inhe statically replace kar deta hai code mein (e.g., `process.env.NEXT_PUBLIC_API_URL` → `"https://api.prod.com"`). Final bundle mein hardcoded value hoti hai. Change karne ke liye rebuild karna padta hai.
- **Runtime variables** — production server ke startup pe ya request time pe read hote hain. Server process (Node, Lambda) `process.env` access kar sakta hai. Browser side mein "true runtime" achieve karna hard hai — typically tum config endpoint banate ho.
- **`.env` files** — local development ke liye convention. `.env`, `.env.local`, `.env.production`, `.env.development`. Files mein `KEY=value` pairs.
- **Secrets** — sensitive values (DB passwords, API tokens, signing keys) jo kabhi client side mein nahi jaane chahiye. Server-only environment variables.

#### Why?

Yeh topic itna critical hai ki production incidents ka top-3 cause hai. Common disasters:

- **Secret leaked in bundle** — devs ne `STRIPE_SECRET_KEY` ko `NEXT_PUBLIC_STRIPE_SECRET_KEY` likh diya. Bundle mein chala gaya. GitHub pe push ho gaya. 12 hours mein someone ne $50k charge kara liye Stripe pe.
- **Wrong API URL in prod** — staging build production deploy ho gaya. Users ka data staging DB mein chala gaya.
- **Missing env var on deploy** — local pe sab chal raha tha, deploy pe `undefined` reference error. Site down.
- **Env var rotation** — secret rotate kiya, but build cache mein purana hai. Confusion ho jata hai.

Senior engineer hone ka matlab hai yeh sab gotchas pehle se sochna.

#### How?

**Build-time vars** — Next.js mein `NEXT_PUBLIC_*` prefix wale vars client bundle mein expose hote hain. Bina prefix ke server-only.

```bash
# .env.local — gitignore mein dalo, kabhi commit mat karo
NEXT_PUBLIC_API_URL=https://api.dev.example.com   # client + server dono ko visible
NEXT_PUBLIC_GA_TRACKING_ID=UA-12345-1             # analytics ID, public hai

# Yeh server-only — bundle mein nahi aayegi
DATABASE_URL=postgres://user:pass@host/db
STRIPE_SECRET_KEY=sk_test_xxx                     # NEVER prefix this with NEXT_PUBLIC_
JWT_SIGNING_SECRET=super-secret-key
```

```ts
// app/page.tsx — client component
'use client';

export default function HomePage() {
  // Yeh build time pe replace ho jayega: "https://api.prod.example.com"
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  // Yeh undefined hoga client side pe — kyunki prefix nahi hai
  // const dbUrl = process.env.DATABASE_URL; // ❌ DON'T

  return <div>API: {apiUrl}</div>;
}
```

```ts
// app/api/checkout/route.ts — server-only
export async function POST(req: Request) {
  // Yeh server pe hi run hota hai, secret safe hai
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  // ... Stripe API call
}
```

**Vite mein same concept** — `VITE_*` prefix:

```bash
# .env
VITE_API_URL=http://localhost:4000          # client visible
VITE_SENTRY_DSN=https://abc@sentry.io/123   # public DSN, fine

# Server-side var (only readable in vite.config.ts at build time)
DATABASE_URL=...
```

```ts
// src/api.ts — Vite app
const API_URL = import.meta.env.VITE_API_URL;
//              ^^^^^^^^^^^^^^^^ Vite uses import.meta.env, NOT process.env
```

**Runtime vars in browser** — yeh tricky hai. Browser ko serve hone ke baad config kaise change karein bina rebuild ke? Two patterns:

```ts
// Pattern 1: Runtime config endpoint
// public/config.js — har deploy pe deployment script se generate karo
window.__APP_CONFIG__ = {
  apiUrl: 'https://api.example.com',  // runtime pe inject
  featureFlags: { newCheckout: true }
};

// app.tsx
const config = (window as any).__APP_CONFIG__;
fetch(`${config.apiUrl}/me`);
```

```ts
// Pattern 2: Server-rendered config in HTML
// Next.js server component
export default async function Layout({ children }) {
  const runtimeConfig = {
    apiUrl: process.env.RUNTIME_API_URL,  // server reads this fresh per request
  };
  return (
    <html>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__CONFIG__ = ${JSON.stringify(runtimeConfig)}`
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**Secrets handling** — secrets ko `.env` mein local pe rakhna OK hai (gitignored). But CI/CD, production mein secret manager use karo:

```yaml
# .github/workflows/deploy.yml — secrets via GitHub Secrets
jobs:
  deploy:
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
        env:
          # Build-time public vars
          NEXT_PUBLIC_API_URL: https://api.example.com
          # Server-side secrets — bundle mein nahi jayenge
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
```

```ts
// AWS Secrets Manager / Vault se runtime fetch
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

let cachedSecrets: any = null;
const client = new SecretsManagerClient({ region: 'ap-south-1' });

export async function getSecret(name: string) {
  if (cachedSecrets?.[name]) return cachedSecrets[name];

  const cmd = new GetSecretValueCommand({ SecretId: name });
  const res = await client.send(cmd);
  const secret = JSON.parse(res.SecretString!);

  cachedSecrets = { ...cachedSecrets, [name]: secret };
  // Cache rakho but TTL ke saath — secrets rotate ho sakte hain
  setTimeout(() => { cachedSecrets = null; }, 5 * 60 * 1000);

  return secret;
}
```

**`.env` file hierarchy** — Next.js/Vite both follow ek precedence order:

```
.env.local           — sabse high priority, gitignored, dev-only
.env.development     — dev mode mein load
.env.production      — production build mein load
.env                 — fallback, always loaded
```

```gitignore
# .gitignore mein yeh hone hi chahiye
.env*.local
.env.local
# .env safe hai agar usme sirf placeholder/non-secret defaults hain
# .env.example commit kar sakte ho — template ke roop mein
```

**`.env.example`** — team documentation ke liye:

```bash
# .env.example — yeh file commit hoti hai
# New devs onboarding ke liye reference

# === Public (client-bundle mein jaati hain) ===
NEXT_PUBLIC_API_URL=https://api.dev.example.com
NEXT_PUBLIC_GA_TRACKING_ID=

# === Server-side secrets (NEVER commit values) ===
DATABASE_URL=postgres://localhost:5432/mydb
STRIPE_SECRET_KEY=sk_test_replace_me
JWT_SIGNING_SECRET=replace_me
```

#### Real-life Example

Real story — ek fintech startup mein junior dev ne `.env` file commit kar diya with production Stripe key. PR review mein reviewer ne ignore kiya (huge PR). Merge ho gaya. GitHub public mirror tha. 4 ghante mein bots ne key scrape kari. $80k worth fraudulent charges. Stripe ne suspend kara. Postmortem mein action items — pre-commit hook for secret scanning (gitleaks, trufflehog), branch protection rules, CI mein secret scan, aur GitGuardian integration.

Doosra example — mera ex-team Next.js app deploy karta tha jahan `NEXT_PUBLIC_API_URL` build time pe set hota tha. Staging build pe `staging-api` URL inject hua. Ops team ne galti se woh build production mein promote kar diya. Production users ka data 2 hours tak staging DB mein gaya before noticed. Fix — separate build per environment, ya runtime config (HTML mein inject) pattern adopt kiya jisse same artifact alag environments mein deploy ho sake without rebuild.

Teesra — ek company ne feature flag library `LaunchDarkly` use ki. SDK key ko `NEXT_PUBLIC_LD_SDK_KEY` mein rakha (correct, kyunki yeh client-side flag eval karta hai). But "client SDK key" instead of "server SDK key" use karna critical tha. Inhone galti se server SDK key public expose kar di — jisse koi bhi flag mutations kar sakta tha. 6 months baad audit mein pakda gaya.

#### Diagram

```mermaid
flowchart TD
    A[.env files / CI Secrets] --> B{Variable Type}
    B -->|NEXT_PUBLIC_* / VITE_*| C[Build-time Inject]
    B -->|No prefix| D[Server-only Env]

    C --> E[Bundler replaces in source]
    E --> F[Hardcoded in JS bundle]
    F --> G[Visible in browser - PUBLIC]

    D --> H[Process env on server]
    H --> I[API routes / SSR]
    I --> J[Never reaches client]

    K[Secrets Manager - AWS/Vault] -.->|runtime fetch| H
    L[GitHub Secrets / Vercel Env UI] -.->|CI inject| H
    L -.->|build inject| C
```

#### Interview Q&A

**Q1. NEXT_PUBLIC_ prefix actually internally karta kya hai? Aur kyun yeh design choice?**

Next.js ka build process (Webpack/Turbopack) compilation ke time pe code scan karta hai. Jahan jahan `process.env.NEXT_PUBLIC_*` likha hai, woh literal string se replace kar deta hai. Yeh `webpack.DefinePlugin` ka classic use case hai — compile-time constant substitution. Iska matlab final bundle mein actual `process` object nahi hota (browser mein hota hi nahi), bas hardcoded strings hote hain. Tu agar `next build` ke baad `.next/static/chunks/main-xxx.js` open kare, tujhe `"https://api.prod.com"` literal dikhayega, not the variable name.

Design choice ka rationale — explicit opt-in. Default secure hai. Tu `process.env.SOMETHING` likhega bina prefix, browser pe `undefined` milega, leak nahi hoga. Sirf jab tu deliberately `NEXT_PUBLIC_` lagayega, tab woh client mein jayega. Yeh "secure by default, explicit to expose" principle hai. Vite ka `VITE_` prefix same philosophy hai. Create React App ka `REACT_APP_` bhi same. Industry pattern hai.

Implication — agar tu `NEXT_PUBLIC_DATABASE_URL=postgres://...` likh dega, woh client bundle mein leak ho jayega. Naming convention enforce karo — `NEXT_PUBLIC_*` prefix wale vars sirf truly public values ke liye (analytics IDs, public API URLs, feature flags). Secrets ko prefix nahi karna. Code review mein yeh check karo. Aur production deploy ke baad bundle mein search karo `STRIPE`, `SECRET`, `KEY` keywords — accidentally leaks pakad lo.

**Q2. Build-time vs runtime config — kab kya use karein? Trade-offs?**

Build-time config ka fayda — fast, no runtime overhead, types static, cacheable. Bundler dead code elimination kar sakta hai (e.g., `if (process.env.NODE_ENV === 'production')` blocks dev mode mein remove). Bundle aggressive optimize hota hai. Disadvantage — har environment ke liye separate build chahiye. Agar tumhe staging mein hotfix deploy karna hai, full build cycle (5-15 min) chalana padta hai. Aur same artifact multiple environments mein promote nahi kar sakte.

Runtime config ka fayda — same artifact, multiple environments. Build once, deploy anywhere with different config. Faster rollouts, less risk of "wrong build deployed" mistakes. 12-factor app principle. Disadvantages — extra HTTP request to fetch config (or HTML injection), dynamic loading complexity, harder to optimize bundle (config values not statically known), TypeScript types harder to enforce.

Senior recommendation — hybrid approach. Truly static stuff (analytics keys, public domains, feature flag SDK keys) build-time pe. Stuff that varies per environment but doesn't need bundling (API URLs, tenant configs, A/B test variants) runtime pe via config endpoint or server-rendered window object. Critical secrets always runtime, server-side only. Twelve-factor purity ka chakkar mein over-engineering mat karo for small apps. Bade SaaS multi-tenant apps mein runtime config significantly leverage hota hai — same Docker image, different tenants, different configs.

**Q3. .env file kabhi commit karoge? Aur secrets rotate karne ka process kya hota hai?**

`.env.example` commit karo — values ke bina, sirf keys aur dummy values. Yeh team documentation ka kaam karta hai. New dev onboard hua, repo clone kiya, `cp .env.example .env.local`, fill in values, ready to go. `.env`, `.env.local`, `.env.*.local` — yeh kabhi commit nahi karna. `.gitignore` mein `*.local` aur explicit `.env.production` jaisi files block karo. Pre-commit hook (gitleaks/trufflehog) lagao taaki accidental commit pakda jaye. CI mein bhi same scan run karo.

Secret rotation ka process — pehle naya secret generate karo (Stripe dashboard, AWS IAM, etc.). Phir secret manager (AWS Secrets Manager, HashiCorp Vault, Vercel Env UI, Doppler) mein update karo. Application restart ya next deploy pe naya secret pick ho jayega. Critical — old secret ko immediately revoke mat karo. Grace period rakho (15 min - 2 hour) jisme dono valid ho. Iss gap mein in-flight requests complete ho jaayein. Phir old secret revoke. Iska reason — production mein zero-downtime rotation possible ho.

Audit trail bhi maintain karo — kab kisne kya rotate kiya. AWS CloudTrail, Vault audit log automatic karte hain. Aur monitoring dashboard pe alert lagao agar rotation ke baad error rate spike kare. Secrets ki frequency — high-value (DB passwords, signing keys) quarterly, medium-value (API keys) annually, low-value (analytics IDs, public keys) — rotation needed nahi. Compliance frameworks (SOC2, ISO 27001) inka schedule mandate karte hain.

---

## Resources & further reading

- **Next.js docs** — `node_modules/next/dist/docs/` mein ya nextjs.org pe — environment variables, deployment, output modes (`standalone`, `export`).
- **Webpack documentation** — `webpack.js.org/concepts/` — module resolution, code splitting, optimization.
- **Vite docs** — `vitejs.dev/guide/` — `import.meta.env`, build options, plugin API.
- **esbuild docs** — `esbuild.github.io` — API reference, plugin development.
- **AWS S3 + CloudFront tutorials** — AWS official "host static website" guide, Origin Access Control setup, cache policies.
- **Vercel docs** — `vercel.com/docs` — deployment, edge functions, ISR, image optimization, analytics.
- **Netlify docs** — `docs.netlify.com` — build plugins, redirects, edge functions, identity.
- **Twelve-Factor App** — `12factor.net` — config principles, especially section 3 (Config) and 5 (Build/Release/Run).
- **OWASP Cheat Sheets** — secrets management, secure deployment.
- **gitleaks / trufflehog** — pre-commit secret scanning tools.
- **HashiCorp Vault** — secret manager for self-hosted environments.
- **Doppler / Infisical** — modern secret management SaaS.
- **web.dev/fast** — Google's performance guides — bundle optimization, code splitting, caching strategies.
- **Cloudflare Pages** — alternative to Vercel/Netlify with generous free tier.
- **bundlephobia.com** — npm package size checker before adding dependency.
- **source-map-explorer / webpack-bundle-analyzer** — visualize bundle composition.
- **Lighthouse / PageSpeed Insights** — measure deployment performance.

Bhai jab tak tu deploy hoke production logs nahi dekhega, jab tak tune ek bandwidth bill explosion nahi dekha, jab tak tune secret leak ki RCA nahi likhi — tab tak yeh sab theory hai. Ja side project deploy kar, mistakes kar, learn kar. Senior banne ka rasta yahi hai.
