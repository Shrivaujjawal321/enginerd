/**
 * In-browser Python code runner — drives a Pyodide Web Worker
 * (`/public/pyodide-runner.worker.js`) so user Python runs entirely client-side
 * (CPython → WebAssembly). No backend, no Piston. Same public contract as
 * `runJavaScript` in `lib/code-runner.ts` so `ProblemWorkspace` treats JS and
 * Python identically.
 *
 * The worker computes each test's `actual`; this module owns the deep-equality
 * comparison against `expected` (shared `deepEqual`), keeping pass/fail logic
 * in one place across both runners.
 *
 * Timeouts: Pyodide's first load fetches ~10MB of WASM, so a cold run gets a
 * generous budget; warm runs are short. A timeout terminates the worker (the
 * only way to stop a Python infinite loop, which blocks the worker thread) and
 * the next call transparently spins up a fresh one.
 */

import type { ProblemTest } from "@/lib/mock-data/types";
import { deepEqual, type RunCaseResult, type RunOutcome } from "@/lib/code-runner";

const COLD_TIMEOUT_MS = 40_000; // first run includes the Pyodide download
const WARM_TIMEOUT_MS = 12_000; // subsequent runs: exec only

type WorkerCase = {
  index: number;
  label: string;
  actual: unknown;
  actualOk: boolean;
  stdout: string;
  error: string | null;
  durationMs: number;
};

type WorkerReply =
  | { kind: "loaded" }
  | { id: number; kind: "ok"; cases: WorkerCase[] }
  | { id: number; kind: "compile-error"; message: string };

let worker: Worker | null = null;
let warm = false;
let nextId = 1;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker("/pyodide-runner.worker.js");
    warm = false;
    worker.addEventListener("message", (e: MessageEvent<WorkerReply>) => {
      if (e.data && e.data.kind === "loaded") warm = true;
    });
  }
  return worker;
}

function resetWorker() {
  if (worker) {
    worker.terminate();
    worker = null;
    warm = false;
  }
}

export async function runPython(
  code: string,
  fnName: string,
  tests: ProblemTest[],
): Promise<RunOutcome> {
  if (!tests.length) return { kind: "ok", cases: [] };
  if (typeof window === "undefined" || typeof Worker === "undefined") {
    return { kind: "compile-error", message: "Runner only works in the browser." };
  }

  const w = getWorker();
  const id = nextId++;
  const budget = warm ? WARM_TIMEOUT_MS : COLD_TIMEOUT_MS;

  return new Promise<RunOutcome>((resolve) => {
    let settled = false;

    const cleanup = () => {
      w.removeEventListener("message", onMessage);
      window.clearTimeout(timer);
    };
    const settle = (outcome: RunOutcome) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(outcome);
    };

    const onMessage = (e: MessageEvent<WorkerReply>) => {
      const data = e.data;
      if (!data || !("id" in data) || data.id !== id) return; // ignore "loaded" + other ids

      if (data.kind === "compile-error") {
        settle({ kind: "compile-error", message: data.message });
        return;
      }
      // kind === "ok": own the comparison here using the shared deepEqual.
      const cases: RunCaseResult[] = data.cases.map((c) => {
        const expected = tests[c.index]?.expected;
        return {
          index: c.index,
          label: c.label,
          passed: c.actualOk && c.error == null && deepEqual(c.actual, expected),
          expected,
          actual: c.actualOk ? c.actual : null,
          stdout: c.stdout,
          error: c.error ?? undefined,
          durationMs: c.durationMs,
        };
      });
      settle({ kind: "ok", cases });
    };

    const timer = window.setTimeout(() => {
      // A timeout almost always means an infinite loop blocking the worker —
      // terminate it so the next run starts clean.
      resetWorker();
      settle({
        kind: "compile-error",
        message: `Execution timed out after ${Math.round(budget / 1000)}s. Check for infinite loops (or a slow first-time Python load — retry).`,
      });
    }, budget);

    w.addEventListener("message", onMessage);
    w.postMessage({ id, code, fnName, tests });
  });
}
