"use client";

import * as React from "react";
import {
  ChevronDown,
  Lightbulb,
  Play,
  Send,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/shared/glass-card";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Problem } from "@/lib/mock-data/types";
import { runJavaScript, type RunCaseResult } from "@/lib/code-runner";
import {
  CodeEditor,
  type CodeEditorLanguage,
} from "@/components/dashboard/code-editor";

const EDITOR_LANGUAGES: ReadonlySet<CodeEditorLanguage> = new Set([
  "javascript",
  "python",
  "java",
  "cpp",
  "go",
  "rust",
]);

/**
 * Map the problem's language string onto one CodeMirror knows about. Unknown
 * languages (e.g. plain "c", "typescript") fall back to JavaScript highlighting
 * so the editor never goes blank — behaviour-wise it's still a plain text box.
 */
function toEditorLanguage(lang: string): CodeEditorLanguage {
  return EDITOR_LANGUAGES.has(lang as CodeEditorLanguage)
    ? (lang as CodeEditorLanguage)
    : "javascript";
}

const DIFFICULTY_COLOR: Record<Problem["difficulty"], string> = {
  Easy: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
  Medium: "bg-amber-500/10 border-amber-500/20 text-amber-300",
  Hard: "bg-rose-500/10 border-rose-500/20 text-rose-300",
};

type ResultState =
  | { kind: "idle" }
  | { kind: "running" }
  | { kind: "ok"; cases: RunCaseResult[] }
  | { kind: "compile-error"; message: string };

function formatValue(v: unknown): string {
  if (v === undefined) return "undefined";
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

/**
 * Tiny post-processor: turn ASCII power notation (`10^9`, `2^31 - 1`) into
 * proper superscripts. Splits on a global regex and rebuilds the line with
 * `<sup>` nodes — keeps leading/trailing punctuation intact.
 */
function renderConstraintLine(line: string): React.ReactNode[] {
  const parts = line.split(/(\d+\^-?\d+)/g);
  return parts.map((part, i) => {
    const m = /^(\d+)\^(-?\d+)$/.exec(part);
    if (!m) return <React.Fragment key={i}>{part}</React.Fragment>;
    return (
      <React.Fragment key={i}>
        {m[1]}
        <sup>{m[2]}</sup>
      </React.Fragment>
    );
  });
}

/**
 * Persist a submission to /api/submissions. Returns the new row (with
 * server-issued id + timestamp) so the workspace can prepend it to the
 * "Recent submissions" panel without a refetch.
 *
 * Silent on auth errors — the caller handles toasts.
 */
async function recordSubmission(args: {
  problemSlug: string;
  language: string;
  code: string;
  passed: boolean;
  cases: RunCaseResult[];
}): Promise<RecentSubmission | null> {
  const casesPassed = args.cases.filter((c) => c.passed).length;
  const hadError = args.cases.some((c) => c.error);
  const status: RecentSubmission["status"] = args.passed
    ? "accepted"
    : hadError
      ? "runtime_error"
      : "wrong_answer";

  const totalRuntime =
    args.cases.length > 0
      ? Math.round(
          args.cases.reduce((sum, c) => sum + (c.durationMs ?? 0), 0),
        )
      : 0;

  try {
    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        problemSlug: args.problemSlug,
        language: args.language,
        code: args.code,
        status,
        runtimeMs: totalRuntime,
        casesPassed,
        casesTotal: args.cases.length,
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { ok: boolean; id: string };
    if (!data.ok) return null;
    return {
      id: data.id,
      status,
      language: args.language,
      casesPassed,
      casesTotal: args.cases.length,
      runtimeMs: totalRuntime,
      submittedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export type RecentSubmission = {
  id: string;
  status: "accepted" | "wrong_answer" | "runtime_error" | "time_limit";
  language: string;
  casesPassed: number;
  casesTotal: number;
  runtimeMs: number | null;
  submittedAt: string;
};

type WorkspaceProps = {
  problem: Problem;
  recentSubmissions?: RecentSubmission[];
  /** Whether the visitor has a valid session. Unauthed visitors see the
   *  problem statement + examples + read-only editor; run/submit are gated
   *  behind a sign-in CTA. */
  isAuthed?: boolean;
  /**
   * True when the server-side Piston runner is pointing at a non-public host
   * (i.e. PISTON_URL is not the dead emkc.org default). Computed server-side
   * by isServerRunnerConfigured() in lib/env.ts and passed down as a prop so
   * this client component never reads server env vars directly.
   *
   * When false: the language dropdown shows JavaScript only (in-browser runner).
   * When true: all languages present in problem.starterCode are shown.
   */
  serverRunnerConfigured?: boolean;
};

export function ProblemWorkspace({
  problem,
  recentSubmissions = [],
  isAuthed = true,
  serverRunnerConfigured = false,
}: WorkspaceProps) {
  // Language dropdown: JavaScript always shows (in-browser runner).
  // Server languages (Python, Java, C++, Go, Rust, TypeScript, C) only appear
  // when a self-hosted Piston runner is configured (PISTON_URL != emkc.org).
  // Self-host: see docs/CODE_RUNNER.md.
  const languages = problem.starterCode
    .map((s) => s.language)
    .filter((l) => l === "javascript" || serverRunnerConfigured);
  const [language, setLanguage] = React.useState<string>(languages[0] ?? "javascript");
  const [code, setCode] = React.useState(
    problem.starterCode.find((s) => s.language === language)?.code ?? "",
  );
  const [hintsOpen, setHintsOpen] = React.useState(false);
  const [revealedHints, setRevealedHints] = React.useState(0);
  const [result, setResult] = React.useState<ResultState>({ kind: "idle" });
  const [tab, setTab] = React.useState<"problem" | "editor">("problem");
  const [submissions, setSubmissions] =
    React.useState<RecentSubmission[]>(recentSubmissions);
  // Whether the user has clicked Run since their last edit. Lets us warn on
  // Submit with a "you haven't run anything yet" inline confirm.
  const [hasRunSinceEdit, setHasRunSinceEdit] = React.useState(false);

  React.useEffect(() => {
    const found = problem.starterCode.find((s) => s.language === language);
    if (found) setCode(found.code);
    setResult({ kind: "idle" });
    setHasRunSinceEdit(false);
  }, [language, problem.starterCode]);

  // Any code edit invalidates the "ran since edit" flag.
  const handleCodeChange = React.useCallback((next: string) => {
    setCode(next);
    setHasRunSinceEdit(false);
  }, []);

  const hasTests = !!problem.tests && problem.tests.length > 0 && !!problem.fnName;
  // Languages we can grade — JavaScript runs in-browser, others go through
  // the server-side Piston runner via /api/execute.
  const SERVER_LANGS = new Set([
    "python",
    "typescript",
    "java",
    "cpp",
    "c",
    "go",
    "rust",
  ]);
  const supportsRun =
    hasTests &&
    (language === "javascript" ||
      (serverRunnerConfigured && SERVER_LANGS.has(language)));

  async function execute(mode: "run" | "submit") {
    if (!hasTests) {
      toast.info("Auto-grading not configured for this problem yet.", {
        description: "Verify manually against the examples for now.",
      });
      return;
    }
    if (!supportsRun) {
      toast.info(`Auto-grading not available for ${language} yet.`, {
        description: serverRunnerConfigured
          ? "Switch to JavaScript, Python, Java, C++, Go, or Rust."
          : "Only JavaScript runs here — set PISTON_URL to enable server languages (see docs/CODE_RUNNER.md).",
      });
      return;
    }

    setResult({ kind: "running" });
    if (mode === "run") setHasRunSinceEdit(true);
    const tests = problem.tests!;

    // ---- Fast path: in-browser JavaScript sandbox ----
    if (language === "javascript") {
      const slice = mode === "run" ? tests.slice(0, 1) : tests;
      const outcome = await runJavaScript(code, problem.fnName!, slice);

      if (outcome.kind === "compile-error") {
        setResult({ kind: "compile-error", message: outcome.message });
        toast.error("Code didn't run.", {
          description: outcome.message.split("\n")[0]?.slice(0, 120),
        });
        return;
      }
      if (outcome.kind === "unsupported-language") {
        setResult({
          kind: "compile-error",
          message: `Unsupported: ${outcome.language}`,
        });
        return;
      }

      const passed = outcome.cases.every((c) => c.passed);
      setResult({ kind: "ok", cases: outcome.cases });
      if (passed) {
        toast.success(
          mode === "submit"
            ? `All ${outcome.cases.length} test cases passed.`
            : "Sample case passed.",
        );
      } else {
        const failedCount = outcome.cases.filter((c) => !c.passed).length;
        toast.error(
          `${failedCount} of ${outcome.cases.length} cases failed.`,
        );
      }

      if (mode === "submit") {
        void recordSubmission({
          problemSlug: problem.slug,
          language,
          code,
          passed,
          cases: outcome.cases,
        }).then((row) => {
          if (row) setSubmissions((prev) => [row, ...prev].slice(0, 5));
        });
      }
      return;
    }

    // ---- Server path: Python / Java / C++ / Go / Rust / TS via Piston ----
    let serverOutcome: {
      kind: string;
      cases?: RunCaseResult[];
      message?: string;
    };
    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemSlug: problem.slug,
          language,
          code,
          mode,
        }),
      });
      if (res.status === 401) {
        const here = window.location.pathname + window.location.search;
        window.location.href = `/login?callbackUrl=${encodeURIComponent(here)}`;
        return;
      }
      if (res.status === 429) {
        setResult({
          kind: "compile-error",
          message:
            "Too many runs — please wait a minute (rate limit).",
        });
        toast.error("Rate limit hit — wait a moment.");
        return;
      }
      serverOutcome = (await res.json()) as typeof serverOutcome;
    } catch {
      setResult({
        kind: "compile-error",
        message: "Code runner is unreachable. Try again.",
      });
      toast.error("Network error.");
      return;
    }

    if (serverOutcome.kind === "compile-error") {
      setResult({
        kind: "compile-error",
        message: serverOutcome.message ?? "Compile error.",
      });
      toast.error("Code didn't compile.", {
        description: (serverOutcome.message ?? "")
          .split("\n")[0]
          ?.slice(0, 120),
      });
      return;
    }

    if (serverOutcome.kind === "runner-error") {
      setResult({
        kind: "compile-error",
        message: serverOutcome.message ?? "Runner error.",
      });
      toast.error("Server-side runner is unavailable.", {
        description: (serverOutcome.message ?? "").slice(0, 200),
        duration: 10_000,
      });
      return;
    }

    if (serverOutcome.kind !== "ok" || !serverOutcome.cases) {
      setResult({
        kind: "compile-error",
        message: serverOutcome.message ?? "Unknown error",
      });
      return;
    }

    const cases = serverOutcome.cases;
    setResult({ kind: "ok", cases });
    const passed = cases.every((c) => c.passed);
    if (passed) {
      toast.success(
        mode === "submit"
          ? `All ${cases.length} test cases passed.`
          : "Sample case passed.",
      );
    } else {
      const failedCount = cases.filter((c) => !c.passed).length;
      toast.error(`${failedCount} of ${cases.length} cases failed.`);
    }

    // Persist submission to DB on Submit only.
    if (mode === "submit") {
      void recordSubmission({
        problemSlug: problem.slug,
        language,
        code,
        passed,
        cases,
      })
        .then((row) => {
          if (row) setSubmissions((prev) => [row, ...prev].slice(0, 5));
        })
        .catch(() => {
          // Submission persistence is best-effort — don't disrupt the UI.
        });
    }
  }

  const allPassed =
    result.kind === "ok" && result.cases.every((c) => c.passed);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400">
            Problem #{problem.number}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
            {problem.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
                DIFFICULTY_COLOR[problem.difficulty],
              )}
            >
              {problem.difficulty}
            </span>
            <Badge variant="outline">{problem.topic}</Badge>
            {problem.companies.slice(0, 4).map((c) => (
              <Badge key={c} variant="glass" className="!text-[10px] capitalize">
                {c}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1 lg:hidden">
        {(["problem", "editor"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-sm font-medium capitalize transition-colors",
              tab === t
                ? "bg-white/[0.08] text-white"
                : "text-slate-400 hover:text-slate-200",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={cn("space-y-4", tab === "editor" && "hidden lg:block")}>
          <GlassCard className="p-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Description
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-200">
              {problem.description}
            </p>
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Examples
            </h2>
            <div className="mt-3 space-y-4">
              {problem.examples.map((ex, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/[0.06] bg-black/30 p-4 font-mono text-xs"
                >
                  <p className="text-slate-400">
                    Input: <span className="text-slate-200">{ex.input}</span>
                  </p>
                  <p className="mt-1 text-slate-400">
                    Output: <span className="text-slate-200">{ex.output}</span>
                  </p>
                  {ex.explanation ? (
                    <p className="mt-1 text-slate-400">{ex.explanation}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Constraints
            </h2>
            <ul className="mt-3 space-y-1.5 text-sm text-slate-300">
              {problem.constraints.map((c) => (
                <li key={c} className="font-mono text-xs">
                  · {renderConstraintLine(c)}
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard className="overflow-hidden p-0">
            <button
              type="button"
              onClick={() => setHintsOpen((o) => !o)}
              className="flex w-full items-center justify-between gap-2 px-6 py-4 text-left hover:bg-white/[0.02]"
              aria-expanded={hintsOpen}
            >
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                <Lightbulb className="h-4 w-4 text-amber-300" />
                Hints
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-slate-400 transition-transform",
                  hintsOpen && "rotate-180",
                )}
              />
            </button>
            {hintsOpen ? (
              <div className="space-y-3 border-t border-white/[0.05] px-6 py-4">
                {problem.hints.slice(0, revealedHints).map((h, i) => (
                  <p
                    key={i}
                    className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-sm text-slate-200"
                  >
                    <span className="mr-2 font-mono text-xs text-violet-300">
                      Hint {i + 1}
                    </span>
                    {h}
                  </p>
                ))}
                {revealedHints < problem.hints.length ? (
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={() => setRevealedHints((n) => n + 1)}
                  >
                    Reveal next hint
                  </Button>
                ) : (
                  <p className="text-xs text-slate-400">
                    No more hints. You got this.
                  </p>
                )}
              </div>
            ) : null}
          </GlassCard>
        </div>

        <div className={cn("space-y-4", tab === "problem" && "hidden lg:block")}>
          <GlassCard className="overflow-hidden p-0">
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.05] bg-white/[0.02] px-4 py-2">
              <Select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="!h-9 !w-auto !min-w-[140px] !text-xs"
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang} className="bg-[#12121a]">
                    {lang}
                  </option>
                ))}
              </Select>
              <div className="flex gap-2">
                {isAuthed ? (
                  <>
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={() => execute("run")}
                      disabled={result.kind === "running" || !supportsRun}
                      title={
                        !supportsRun
                          ? !hasTests
                            ? "Auto-grading not configured for this problem"
                            : serverRunnerConfigured
                              ? `${language} auto-grading not available`
                              : "Server runner not configured — only JavaScript available"
                          : "Run against the visible sample cases"
                      }
                    >
                      <Play className="h-3.5 w-3.5" />
                      <span className="flex flex-col items-start leading-tight">
                        <span>Run</span>
                        <span className="text-[10px] font-normal text-slate-400">
                          sample tests
                        </span>
                      </span>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (!hasRunSinceEdit) {
                          const proceed = window.confirm(
                            "You haven't run any tests since editing — submit anyway?",
                          );
                          if (!proceed) return;
                        }
                        void execute("submit");
                      }}
                      disabled={result.kind === "running" || !supportsRun}
                      title="Submit runs sample + hidden tests on our servers"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span className="flex flex-col items-start leading-tight">
                        <span>Submit</span>
                        <span className="text-[10px] font-normal text-white/70">
                          sample + hidden
                        </span>
                      </span>
                    </Button>
                  </>
                ) : (
                  <a
                    href={`/login?callbackUrl=${encodeURIComponent(
                      typeof window === "undefined"
                        ? `/practice/${problem.slug}`
                        : window.location.pathname,
                    )}`}
                  >
                    <Button size="sm">
                      <Send className="h-3.5 w-3.5" />
                      Sign in to run
                    </Button>
                  </a>
                )}
              </div>
            </div>
            <CodeEditor
              value={code}
              onChange={handleCodeChange}
              language={toEditorLanguage(language)}
              className="h-72 w-full sm:h-80"
            />
          </GlassCard>

          <GlassCard className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Test cases
              </h3>
              {result.kind === "ok" ? (
                allPassed ? (
                  <Badge variant="success" className="!gap-1">
                    <Check className="h-3 w-3" />
                    All {result.cases.length} passed
                  </Badge>
                ) : (
                  <Badge variant="warning">
                    {result.cases.filter((c) => c.passed).length}/
                    {result.cases.length} passed
                  </Badge>
                )
              ) : result.kind === "running" ? (
                <Badge variant="warning">Running…</Badge>
              ) : result.kind === "compile-error" ? (
                <Badge variant="warning" className="!gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Error
                </Badge>
              ) : (
                <Badge variant="outline">Ready</Badge>
              )}
            </div>

            {result.kind === "idle" && hasTests && supportsRun ? (
              <div className="mt-3 space-y-3">
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-xs text-slate-300">
                  <p>
                    Press{" "}
                    <span className="font-medium text-slate-100">Run</span> to
                    evaluate the {problem.examples.length} sample case
                    {problem.examples.length === 1 ? "" : "s"} below.
                  </p>
                  <p className="mt-1 text-slate-400">
                    <span className="font-medium text-slate-200">Submit</span>{" "}
                    also runs hidden edge cases on our servers.
                  </p>
                </div>
                <ul className="space-y-1.5">
                  {problem.examples.map((ex, i) => (
                    <li
                      key={i}
                      className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2 font-mono text-[11px]"
                    >
                      <p className="text-slate-400">
                        Input:{" "}
                        <span className="text-slate-200">{ex.input}</span>
                      </p>
                      <p className="text-slate-400">
                        Expected:{" "}
                        <span className="text-slate-200">{ex.output}</span>
                      </p>
                      <p className="text-slate-500">
                        Actual:{" "}
                        <span className="italic">— pending</span>
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {result.kind === "compile-error" ? (
              <pre className="mt-3 overflow-x-auto rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 font-mono text-xs text-rose-200">
                {result.message}
              </pre>
            ) : null}

            {result.kind === "running" ? (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-slate-400">
                  {language === "javascript"
                    ? "Running tests in the browser…"
                    : `Compiling on Piston (cold start can take 6-8s for ${language})…`}
                </p>
                {hasTests
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-3"
                      >
                        <div className="h-3 w-32 animate-pulse rounded bg-white/[0.06]" />
                        <div className="h-3 w-16 animate-pulse rounded bg-white/[0.05]" />
                      </div>
                    ))
                  : null}
              </div>
            ) : null}

            {result.kind === "ok" ? (
              <div className="mt-4 space-y-2">
                {result.cases.map((c) => (
                  <details
                    key={c.index}
                    className={cn(
                      "rounded-lg border bg-white/[0.02] px-3 py-2",
                      c.passed
                        ? "border-emerald-500/20"
                        : "border-rose-500/20",
                    )}
                  >
                    <summary className="flex cursor-pointer items-center justify-between gap-3 text-xs">
                      <span className="font-mono text-slate-300">
                        {c.label}
                        <span className="ml-2 text-slate-400">
                          {c.durationMs}ms
                        </span>
                      </span>
                      {c.passed ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <Check className="h-3.5 w-3.5" /> Passed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400">
                          <X className="h-3.5 w-3.5" /> Failed
                        </span>
                      )}
                    </summary>
                    <div className="mt-2 space-y-1.5 border-t border-white/[0.05] pt-2 font-mono text-[11px]">
                      <p className="text-slate-400">
                        Expected:{" "}
                        <span className="text-slate-100">
                          {formatValue(c.expected)}
                        </span>
                      </p>
                      <p className="text-slate-400">
                        Actual:{" "}
                        <span
                          className={
                            c.passed ? "text-emerald-300" : "text-rose-300"
                          }
                        >
                          {c.error ? `Error: ${c.error.split("\n")[0]}` : formatValue(c.actual)}
                        </span>
                      </p>
                      {c.stdout ? (
                        <pre className="mt-1 max-h-32 overflow-auto rounded border border-white/[0.05] bg-black/30 p-2 text-slate-300">
                          {c.stdout}
                        </pre>
                      ) : null}
                    </div>
                  </details>
                ))}
              </div>
            ) : null}

            {result.kind === "idle" && !hasTests ? (
              <p className="mt-3 text-xs text-slate-400">
                This problem needs manual verification — auto-grading harness
                is class-based or has non-deterministic output. Solve, then
                check against the examples.
              </p>
            ) : null}

            {result.kind === "idle" && hasTests && !supportsRun ? (
              <p className="mt-3 text-xs text-slate-400">
                Auto-grading isn&apos;t set up for {language} on this problem.{" "}
                {serverRunnerConfigured
                  ? "Try JavaScript, Python, Java, C++, Go, or Rust."
                  : "Try JavaScript (server runner not configured — see docs/CODE_RUNNER.md)."}
              </p>
            ) : null}
            {result.kind === "idle" && hasTests && supportsRun && language !== "javascript" ? (
              <p className="mt-3 text-xs text-slate-400">
                {language} runs server-side via Piston — first call may take
                a few seconds (cold start). JS is faster (in-browser).
              </p>
            ) : null}
          </GlassCard>

          {submissions.length > 0 ? (
            <GlassCard className="p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Recent submissions
              </h3>
              <ul className="mt-3 space-y-1.5">
                {submissions.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-xs"
                  >
                    <span className="inline-flex items-center gap-2">
                      {s.status === "accepted" ? (
                        <span className="inline-flex items-center gap-1 text-emerald-300">
                          <Check className="h-3 w-3" /> Accepted
                        </span>
                      ) : s.status === "runtime_error" ? (
                        <span className="inline-flex items-center gap-1 text-rose-300">
                          <AlertTriangle className="h-3 w-3" /> Runtime error
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-300">
                          <X className="h-3 w-3" /> Wrong answer
                        </span>
                      )}
                      <span className="font-mono text-slate-400">
                        {s.casesPassed}/{s.casesTotal} cases
                      </span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {s.runtimeMs ? `${s.runtimeMs}ms · ` : ""}
                      {new Date(s.submittedAt).toLocaleString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            </GlassCard>
          ) : null}
        </div>
      </div>
    </div>
  );
}
