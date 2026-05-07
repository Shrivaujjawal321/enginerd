/**
 * In-browser JavaScript code runner — executes user code in a sandboxed
 * `srcdoc` iframe with no DOM/network access, captures `console.log` output,
 * calls a target function with each test's args, and reports per-test
 * pass/fail with a 5-second wall-clock timeout per test case.
 *
 * Why iframe sandbox vs `new Function`?
 *   - Isolated globals — user code can't poison our app.
 *   - `sandbox="allow-scripts"` (no allow-same-origin) means even if user code
 *     tries `parent.location`, it gets a SecurityError.
 *   - Works with any modern browser; no backend required.
 *
 * Limitations: JavaScript only. Python/Java/etc. would need server-side
 * execution (Judge0 / self-hosted Piston). MVP launch is JS-first.
 */

import type { ProblemTest } from "@/lib/mock-data/types";

export type RunCaseResult = {
  index: number;
  label: string;
  passed: boolean;
  expected: unknown;
  actual: unknown;
  stdout: string;
  error?: string;
  durationMs: number;
};

export type RunOutcome =
  | { kind: "ok"; cases: RunCaseResult[] }
  | { kind: "compile-error"; message: string }
  | { kind: "unsupported-language"; language: string };

const TIMEOUT_MS = 5000;

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  if (typeof a === "object" && typeof b === "object") {
    const ao = a as Record<string, unknown>;
    const bo = b as Record<string, unknown>;
    const aKeys = Object.keys(ao);
    const bKeys = Object.keys(bo);
    if (aKeys.length !== bKeys.length) return false;
    for (const k of aKeys) {
      if (!deepEqual(ao[k], bo[k])) return false;
    }
    return true;
  }
  return false;
}

/**
 * Build the HTML payload that runs inside the sandboxed iframe.
 * The script:
 *   1. Captures `console.log` into a string.
 *   2. Evaluates user code via `Function(...)`.
 *   3. Looks up the named function on the script-local scope.
 *   4. For each test, calls the function with args, deep-compares to expected.
 *   5. Posts results back via postMessage.
 */
function buildSandboxHtml(
  code: string,
  fnName: string,
  tests: ProblemTest[],
): string {
  const escapedCode = JSON.stringify(code);
  const escapedFn = JSON.stringify(fnName);
  const escapedTests = JSON.stringify(tests);
  return `<!doctype html><html><head><meta charset="utf-8"></head><body><script>
(function () {
  const userCode = ${escapedCode};
  const fnName = ${escapedFn};
  const tests = ${escapedTests};

  function deepEqual(a, b) {
    if (Object.is(a, b)) return true;
    if (typeof a !== typeof b) return false;
    if (a === null || b === null) return false;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false;
      return true;
    }
    if (typeof a === "object" && typeof b === "object") {
      const ak = Object.keys(a), bk = Object.keys(b);
      if (ak.length !== bk.length) return false;
      for (const k of ak) if (!deepEqual(a[k], b[k])) return false;
      return true;
    }
    return false;
  }

  let logBuffer = "";
  const origLog = console.log;
  console.log = function () {
    const parts = [];
    for (let i = 0; i < arguments.length; i++) {
      const v = arguments[i];
      try {
        parts.push(typeof v === "string" ? v : JSON.stringify(v));
      } catch (_) {
        parts.push(String(v));
      }
    }
    logBuffer += parts.join(" ") + "\\n";
  };

  function post(type, payload) {
    parent.postMessage({ type: type, payload: payload }, "*");
  }

  let userScope;
  try {
    userScope = new Function(
      userCode + "\\n;return { fn: typeof " + fnName + " === 'function' ? " + fnName + " : null };"
    )();
  } catch (err) {
    post("compile-error", { message: (err && err.stack) || String(err) });
    return;
  }

  if (!userScope || typeof userScope.fn !== "function") {
    post("compile-error", {
      message: "Function '" + fnName + "' is not defined. Make sure you keep the function declaration intact.",
    });
    return;
  }

  const fn = userScope.fn;
  const results = [];

  for (let i = 0; i < tests.length; i++) {
    const t = tests[i];
    const before = logBuffer;
    const start = performance.now();
    let actual;
    let error;
    try {
      actual = fn.apply(null, t.args);
    } catch (err) {
      error = (err && err.stack) || String(err);
    }
    const dur = performance.now() - start;
    const stdout = logBuffer.slice(before.length);
    results.push({
      index: i,
      label: t.label || ("Case " + (i + 1)),
      passed: error == null && deepEqual(actual, t.expected),
      expected: t.expected,
      actual: error == null ? actual : null,
      stdout: stdout,
      error: error,
      durationMs: Math.round(dur * 100) / 100,
    });
  }

  post("done", { cases: results });
})();
</script></body></html>`;
}

export async function runJavaScript(
  code: string,
  fnName: string,
  tests: ProblemTest[],
): Promise<RunOutcome> {
  if (!tests.length) {
    return { kind: "ok", cases: [] };
  }
  if (typeof window === "undefined") {
    return { kind: "compile-error", message: "Runner only works in the browser." };
  }

  const html = buildSandboxHtml(code, fnName, tests);

  return new Promise((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("sandbox", "allow-scripts");
    iframe.style.position = "absolute";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.opacity = "0";
    iframe.setAttribute("aria-hidden", "true");
    iframe.srcdoc = html;

    let settled = false;
    const cleanup = () => {
      window.removeEventListener("message", onMessage);
      window.clearTimeout(timer);
      iframe.remove();
    };

    const settle = (outcome: RunOutcome) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(outcome);
    };

    const onMessage = (e: MessageEvent) => {
      if (e.source !== iframe.contentWindow) return;
      const data = e.data as { type: string; payload: unknown };
      if (data?.type === "done") {
        const payload = data.payload as { cases: RunCaseResult[] };
        // Trust runtime deepEqual but normalise types using local helper.
        const validated = payload.cases.map((c) => ({
          ...c,
          passed: c.error == null && deepEqual(c.actual, c.expected),
        }));
        settle({ kind: "ok", cases: validated });
      } else if (data?.type === "compile-error") {
        const payload = data.payload as { message: string };
        settle({ kind: "compile-error", message: payload.message });
      }
    };

    const timer = window.setTimeout(() => {
      settle({
        kind: "compile-error",
        message: `Execution timed out after ${TIMEOUT_MS}ms. Check for infinite loops.`,
      });
    }, TIMEOUT_MS);

    window.addEventListener("message", onMessage);
    document.body.appendChild(iframe);
  });
}
