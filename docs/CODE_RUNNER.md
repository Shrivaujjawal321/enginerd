# EngiNerd — Self-Hosted Code Runner

EngiNerd uses [Piston](https://github.com/engineer-man/piston) for server-side code
execution (Python, Java, C++, Go, Rust, TypeScript, C). The public Piston API at
`emkc.org` went **whitelist-only on 2026-02-15** and is treated as "not configured".
Until you point `PISTON_URL` at your own instance, the practice workspace shows
**JavaScript only** (which still runs in the browser — no Piston needed).

JavaScript will always be available regardless of runner status.

---

## Architecture

```
Browser (JS) ──────────────────────────────► in-browser sandbox (lib/code-runner.ts)
Browser (all other langs) ──► POST /api/execute ──► lib/code-runner-server.ts
                                                          │
                                                          ▼
                                                  PISTON_URL/execute
                                                  (self-hosted Docker)
```

The route handler at `app/api/execute/route.ts` wraps user code with a per-language
harness (stdin = JSON array of test args, stdout = one JSON line per result), ships
it to Piston, and parses results. No Piston call is ever made from the browser.

---

## Option A — Railway (recommended, easiest)

1. Go to <https://railway.app> → New Project → Deploy from Docker Image.
2. Image: `ghcr.io/engineer-man/piston`
3. Port: `2000`
4. After deploy, note your public URL, e.g. `https://piston-production-xxxx.up.railway.app`
5. Open a shell in the Railway service and install language packages (see below).
6. Set `PISTON_URL=https://piston-production-xxxx.up.railway.app/api/v2` in your
   Vercel project environment variables (Production + Preview).

Railway free tier has enough compute for low-traffic dev/demo use.

---

## Option B — Fly.io

```bash
# Install flyctl: https://fly.io/docs/hands-on/install-flyctl/
fly auth login

# Create app
fly launch --image ghcr.io/engineer-man/piston --name enginerd-piston \
  --region sin --no-deploy

# Allocate a shared IP
fly ips allocate-v4 --shared --app enginerd-piston

# Deploy (internal port 2000)
fly deploy --app enginerd-piston

# Set env in Vercel:
# PISTON_URL=https://enginerd-piston.fly.dev/api/v2
```

After deploy, exec into the instance to install language packages:

```bash
fly ssh console --app enginerd-piston
# then follow "Install language packages" below
```

---

## Option C — Render

1. New Web Service → Docker → Image URL: `ghcr.io/engineer-man/piston`
2. Port: `2000`
3. Plan: Starter ($7/mo) — free tier sleeps after inactivity (bad for cold-starts).
4. After deploy, use the Render shell (Dashboard → Shell tab) to install packages.
5. Set `PISTON_URL=https://enginerd-piston.onrender.com/api/v2` in Vercel.

---

## Option D — Docker locally (dev only)

```bash
docker run -d \
  --name piston \
  -p 2000:2000 \
  --restart unless-stopped \
  ghcr.io/engineer-man/piston
```

Set in `.env.local`:
```
PISTON_URL=http://localhost:2000/api/v2
```

Restart the Next.js dev server after editing `.env.local`.

---

## Install language packages

After Piston is running, install each language runtime via the packages API. Run
these from inside the container (or via `fly ssh console` / Railway shell / Render
shell):

```bash
# Verify Piston is up first
curl http://localhost:2000/api/v2/runtimes

# Install all EngiNerd-supported languages
curl -X POST http://localhost:2000/api/v2/packages \
  -H "Content-Type: application/json" \
  -d '{"language":"python","version":"*"}'

curl -X POST http://localhost:2000/api/v2/packages \
  -H "Content-Type: application/json" \
  -d '{"language":"java","version":"*"}'

curl -X POST http://localhost:2000/api/v2/packages \
  -H "Content-Type: application/json" \
  -d '{"language":"c++","version":"*"}'

curl -X POST http://localhost:2000/api/v2/packages \
  -H "Content-Type: application/json" \
  -d '{"language":"c","version":"*"}'

curl -X POST http://localhost:2000/api/v2/packages \
  -H "Content-Type: application/json" \
  -d '{"language":"go","version":"*"}'

curl -X POST http://localhost:2000/api/v2/packages \
  -H "Content-Type: application/json" \
  -d '{"language":"rust","version":"*"}'

curl -X POST http://localhost:2000/api/v2/packages \
  -H "Content-Type: application/json" \
  -d '{"language":"typescript","version":"*"}'
```

Wait ~30s per package for download + install. Verify:

```bash
curl http://localhost:2000/api/v2/runtimes | python3 -m json.tool
```

You should see all seven languages listed.

---

## Set PISTON_URL in Vercel

1. Vercel Dashboard → your EngiNerd project → Settings → Environment Variables.
2. Add:
   - Name: `PISTON_URL`
   - Value: `https://<your-piston-host>/api/v2`  (no trailing slash)
   - Environments: Production, Preview, Development
3. Redeploy (Vercel picks up env var changes on the next deploy).

The URL must NOT be `https://emkc.org/api/v2/piston` — that host is treated as
"unconfigured" by `isServerRunnerConfigured()` in `lib/env.ts`, which gates whether
server languages appear in the practice workspace.

---

## Verify end-to-end

Once deployed and `PISTON_URL` is set, run a smoke test from your machine:

```bash
# Replace with your actual Piston URL
PISTON_URL=https://enginerd-piston.fly.dev/api/v2

# Test Python
curl -s -X POST "$PISTON_URL/execute" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "python",
    "version": "*",
    "files": [{"name":"main.py","content":"print(42)"}],
    "stdin": ""
  }' | python3 -m json.tool
# Expected: run.stdout = "42\n", run.code = 0

# Test Rust (stdlib-only harness — no Cargo.toml needed)
curl -s -X POST "$PISTON_URL/execute" \
  -H "Content-Type: application/json" \
  -d '{
    "language": "rust",
    "version": "*",
    "files": [{"name":"main.rs","content":"fn main(){println!(\"ok\");}"}],
    "stdin": ""
  }' | python3 -m json.tool
# Expected: run.stdout = "ok\n"
```

Then open a practice problem in EngiNerd — the language dropdown should now show
Python, Java, C++, Go, Rust, TypeScript, and C in addition to JavaScript.

---

## Harness I/O contract

All server-language harnesses follow the same stdin/stdout protocol:

- **stdin**: one JSON array of test cases — `[[arg0, arg1, ...], [arg0, arg1, ...], ...]`
- **stdout**: one JSON line per test case — the return value serialised to JSON
- **error sentinel**: `{"__err": "message"}` on a result line means that test case
  threw/panicked — counted as failed, others continue

This lets a single Piston invocation evaluate all test cases in one cold-start
instead of N separate calls.

### Per-language function signatures

| Language   | User function signature |
|------------|------------------------|
| JavaScript | `function fnName(...args)` |
| TypeScript | `function fnName(...args: unknown[]): unknown` |
| Python     | `def fn_name(*args):` (camelCase or snake_case) |
| Java       | `public Object fnName(Object[] args)` in class body |
| C++        | `json fnName(json args)` (nlohmann::json) |
| C          | `char* fnName(int argc, char* argv[])` — argv[i] is JSON string |
| Go         | `func fnName(args []interface{}) interface{}` |
| Rust       | `fn fnName(args: Vec<Val>) -> Val` (Val = harness-injected enum) |

---

## Security notes

- Piston runs each execution in an isolated, resource-limited container — CPU, memory,
  and file-system writes are capped. Default CPU time: 3s. Default memory: none (set
  `run_memory_limit` in the request body if needed).
- The rate limiter in `app/api/execute/route.ts` (`apiLimiter`) caps runs per user.
  With a self-hosted Piston you can relax the Upstash Redis rate-limit; the current
  setting is conservative for the public Piston API.
- Do NOT expose Piston directly to the public internet without authentication. The
  EngiNerd API route is the only caller — keep Piston behind a private network or at
  minimum behind a firewall that only allows inbound from your Vercel project's IPs.
- Network egress from inside Piston execution containers is blocked by default in the
  Docker image. Keep it that way — outbound calls from user code are a security risk.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Language dropdown still shows JS only | `PISTON_URL` not set or still points to emkc.org | Set correct URL in Vercel env + redeploy |
| "Runner returned HTTP 401" | emkc.org is the URL | Self-host and update `PISTON_URL` |
| "Code runner is unreachable" | Piston service is down / sleeping | Check Railway/Fly/Render logs; wake service |
| Java/C++ compile error: "cannot find symbol" | Harness injection issue | File a bug — check `lib/code-runner-server.ts` |
| Rust: "error[E0412]: cannot find type `Val`" | User wrote `import`/`use` that shadows harness | Remove stray `use` statements; Val is injected by harness |
| C: segfault with no output | argv[i] parsed wrong type | Check function signature matches: `char* fn(int argc, char* argv[])` |
