"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Briefcase,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Key,
  Loader2,
  Lock,
  MapPin,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/shared/glass-card";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { NormalizedJob } from "@/lib/job-providers";

type Provider = "anthropic" | "openai";

type MatchResult = {
  jobId: string;
  score: number;
  verdict: "strong" | "decent" | "stretch" | "skip";
  strengths: string[];
  gaps: string[];
  oneLiner: string;
};

type Setup = {
  resume: string;
  resumeFileName: string;
  provider: Provider;
  apiKey: string;
};

const RESUME_KEY = "enginerd:job-agent:resume";
const RESUME_NAME_KEY = "enginerd:job-agent:resumeName";
const PROVIDER_KEY = "enginerd:job-agent:provider";
const API_KEY = "enginerd:job-agent:apiKey";

const VERDICT_COLOR: Record<MatchResult["verdict"], string> = {
  strong: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  decent: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  stretch: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  skip: "border-rose-500/30 bg-rose-500/10 text-rose-300",
};

function loadInitial(): Setup {
  if (typeof window === "undefined")
    return { resume: "", resumeFileName: "", provider: "anthropic", apiKey: "" };
  return {
    resume: window.localStorage.getItem(RESUME_KEY) ?? "",
    resumeFileName: window.localStorage.getItem(RESUME_NAME_KEY) ?? "",
    provider:
      (window.localStorage.getItem(PROVIDER_KEY) as Provider) ?? "anthropic",
    apiKey: window.localStorage.getItem(API_KEY) ?? "",
  };
}

/**
 * Pick a likely job title or top tech keyword from a resume so we can
 * auto-search live job boards the moment the user uploads. Cheap & local —
 * no LLM call. Falls back to a generic role if nothing matches.
 */
function deriveQueryFromResume(text: string): string {
  const titlePattern =
    /(senior|junior|lead|principal|staff)?\s*(software|frontend|front[- ]end|backend|back[- ]end|full[- ]stack|fullstack|data|machine learning|ml|devops|site reliability|sre|cloud|mobile|ios|android|react|node|python|java|golang|go|rust)\s*(engineer|developer|architect|scientist)/i;
  const m = titlePattern.exec(text);
  if (m) return m[0].toLowerCase().replace(/\s+/g, " ").trim();

  const TECH = [
    "react",
    "python",
    "java",
    "golang",
    "rust",
    "typescript",
    "node",
    "kubernetes",
    "aws",
  ];
  const lower = text.toLowerCase();
  const found = TECH.find((t) => lower.includes(t));
  return found ? `${found} engineer` : "software engineer";
}

export function JobAgent() {
  const [hydrated, setHydrated] = React.useState(false);
  const [setup, setSetup] = React.useState<Setup>({
    resume: "",
    resumeFileName: "",
    provider: "anthropic",
    apiKey: "",
  });
  const [setupOpen, setSetupOpen] = React.useState(false);
  const [showKey, setShowKey] = React.useState(false);
  const [parsing, setParsing] = React.useState(false);

  const [query, setQuery] = React.useState("");
  const [searching, setSearching] = React.useState(false);
  const [jobs, setJobs] = React.useState<NormalizedJob[]>([]);
  const [matches, setMatches] = React.useState<Record<string, MatchResult>>({});
  const [matchProgress, setMatchProgress] = React.useState({ done: 0, total: 0 });
  const [searchError, setSearchError] = React.useState<string | null>(null);
  const [source, setSource] = React.useState<"live" | null>(null);

  React.useEffect(() => {
    setSetup(loadInitial());
    setHydrated(true);
  }, []);

  function persistSetup(next: Setup) {
    setSetup(next);
    if (typeof window === "undefined") return;
    window.localStorage.setItem(RESUME_KEY, next.resume);
    window.localStorage.setItem(RESUME_NAME_KEY, next.resumeFileName);
    window.localStorage.setItem(PROVIDER_KEY, next.provider);
    window.localStorage.setItem(API_KEY, next.apiKey);
  }

  function clearStored() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(RESUME_KEY);
    window.localStorage.removeItem(RESUME_NAME_KEY);
    window.localStorage.removeItem(PROVIDER_KEY);
    window.localStorage.removeItem(API_KEY);
    setSetup({
      resume: "",
      resumeFileName: "",
      provider: "anthropic",
      apiKey: "",
    });
    setJobs([]);
    setMatches({});
    setQuery("");
    setSource(null);
    toast.success("Cleared local resume + API key.");
  }

  /**
   * One-shot upload → parse → derive query → search → score flow.
   * Match step is skipped when no API key is set; search still works so
   * the user sees real listings immediately.
   */
  async function onResumeFile(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large (max 5 MB).");
      return;
    }
    setParsing(true);
    const t = toast.loading(`Parsing ${file.name}…`);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/resume/extract", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok || !data.text) {
        throw new Error(data.error || `Extract failed (${res.status})`);
      }
      const text = data.text;
      const derived = deriveQueryFromResume(text);
      const next: Setup = {
        ...setup,
        resume: text,
        resumeFileName: file.name,
      };
      persistSetup(next);
      setQuery(derived);
      toast.success(
        `Resume loaded (${text.length} chars). Searching “${derived}”…`,
        { id: t },
      );
      setSetupOpen(false);
      void runSearch(derived, next);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error(message, { id: t });
    } finally {
      setParsing(false);
    }
  }

  async function runSearch(rawQuery?: string, currentSetup: Setup = setup) {
    const q = (rawQuery ?? query).trim();
    if (!q) {
      toast.info("Type a role, or upload your resume to auto-search.");
      return;
    }
    setSearching(true);
    setSearchError(null);
    setJobs([]);
    setMatches({});
    setSource(null);
    setMatchProgress({ done: 0, total: 0 });

    try {
      const res = await fetch(
        `/api/jobs/search?q=${encodeURIComponent(q)}`,
      );
      const data = (await res.json()) as {
        jobs?: NormalizedJob[];
        source?: "live";
        error?: string;
      };
      if (!res.ok || data.error) {
        throw new Error(data.error || `Search failed (${res.status})`);
      }
      const fetched = data.jobs ?? [];
      setSource(data.source ?? "live");
      if (fetched.length === 0) {
        setSearchError(
          "No jobs found right now. Try a different keyword or check back later.",
        );
        setSearching(false);
        return;
      }
      const slice = fetched.slice(0, 10);
      setJobs(slice);

      // Score against resume only when both resume + API key are set.
      const canMatch =
        currentSetup.resume.trim().length > 0 &&
        currentSetup.apiKey.trim().length > 0;
      if (!canMatch) {
        setSearching(false);
        return;
      }
      setMatchProgress({ done: 0, total: slice.length });
      await runWithConcurrency(slice, 4, async (job) => {
        try {
          const matchRes = await fetch("/api/jobs/match", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              provider: currentSetup.provider,
              apiKey: currentSetup.apiKey,
              resume: currentSetup.resume,
              job,
            }),
          });
          const m = (await matchRes.json()) as MatchResult & {
            error?: string;
            detail?: string;
          };
          if (matchRes.ok && !m.error) {
            setMatches((prev) => ({ ...prev, [job.id]: m }));
          } else {
            console.error("Match error", m);
          }
        } catch (err) {
          console.error("Match request failed", err);
        } finally {
          setMatchProgress((p) => ({ ...p, done: p.done + 1 }));
        }
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setSearchError(message);
    } finally {
      setSearching(false);
    }
  }

  // Resume + API key both set → ranked. Resume only → unranked but real jobs.
  const ranked = React.useMemo(() => {
    return [...jobs].sort((a, b) => {
      const sa = matches[a.id]?.score ?? -1;
      const sb = matches[b.id]?.score ?? -1;
      return sb - sa;
    });
  }, [jobs, matches]);

  const hasResume = hydrated && setup.resume.trim().length > 0;
  const hasKey = hydrated && setup.apiKey.trim().length > 0;

  return (
    <section className="space-y-4">
      <GlassCard
        strong
        className="overflow-hidden p-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(139,92,246,0.06), rgba(6,182,212,0.04))",
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/[0.06] px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl border border-violet-500/30 bg-violet-500/10 text-violet-300">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-50">
                Job Search Agent
              </h2>
              <p className="mt-0.5 text-sm text-slate-400">
                Upload your resume — we&apos;ll fetch live openings from
                Remotive, Arbeitnow &amp; The Muse and rank them with your own
                LLM key.
              </p>
            </div>
          </div>
          <Button
            variant="glass"
            size="sm"
            onClick={() => setSetupOpen((o) => !o)}
          >
            <Key className="h-3.5 w-3.5" />
            {hasKey ? "Edit setup" : "Add API key"}
          </Button>
        </div>

        {/* Primary upload CTA — visible when no resume yet, or in setup edit. */}
        {hydrated && (!hasResume || setupOpen) ? (
          <SetupPanel
            setup={setup}
            showKey={showKey}
            parsing={parsing}
            onToggleShowKey={() => setShowKey((s) => !s)}
            onSaveKey={(next) => {
              persistSetup(next);
              if (next.apiKey.trim()) {
                setSetupOpen(false);
                toast.success("API key saved locally.");
                if (jobs.length > 0 && next.resume.trim()) {
                  // Score the already-fetched jobs against the resume now
                  // that the key is in place.
                  void rescoreExisting(next, jobs, setMatches, setMatchProgress);
                }
              }
            }}
            onUpload={onResumeFile}
            onClear={clearStored}
            onClose={() => setSetupOpen(false)}
            canClose={hasResume}
          />
        ) : null}

        <div className="px-6 py-5">
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runSearch()}
                placeholder="Role or keyword — e.g. react, data engineer, backend…"
                className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/20 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-400 focus:border-violet-500/40 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
            <Button onClick={() => runSearch()} disabled={searching || parsing}>
              {searching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching…
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Search live jobs
                </>
              )}
            </Button>
          </div>

          <p className="mt-2 text-[11px] text-slate-500">
            Aggregates live listings from Remotive, Arbeitnow, and The Muse — remote and global roles, LLM-matched to your profile.
          </p>

          {searching && matchProgress.total > 0 ? (
            <div className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-xs text-slate-400">
              Scoring jobs against your resume — {matchProgress.done} /{" "}
              {matchProgress.total} done.
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.05]">
                <div
                  className="h-full rounded-full gradient-primary transition-[width] duration-500"
                  style={{
                    width: `${
                      matchProgress.total === 0
                        ? 0
                        : (matchProgress.done / matchProgress.total) * 100
                    }%`,
                  }}
                />
              </div>
            </div>
          ) : null}

          {hasResume && !hasKey && jobs.length > 0 ? (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3 text-xs text-cyan-200">
              <span>
                Showing real openings — add an LLM API key to score these
                against your resume.
              </span>
              <button
                type="button"
                onClick={() => setSetupOpen(true)}
                className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 font-medium text-cyan-100 hover:bg-cyan-500/20"
              >
                Add key
              </button>
            </div>
          ) : null}

          {searchError ? (
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-rose-300">
              <AlertTriangle className="h-3.5 w-3.5" />
              {searchError}
            </p>
          ) : null}
          {!searching && jobs.length > 0 && source ? (
            <p className="mt-3 text-[11px] text-slate-500">
              {jobs.length} live opening{jobs.length === 1 ? "" : "s"} from
              public job boards. Apply links open the original posting.
            </p>
          ) : null}
        </div>
      </GlassCard>

      {ranked.length > 0 ? (
        <div className="space-y-3">
          {ranked.map((job) => {
            const m = matches[job.id];
            return <JobCard key={job.id} job={job} match={m} hasKey={hasKey} />;
          })}
        </div>
      ) : !searching && hasResume ? (
        <p className="text-center text-sm text-slate-400">
          Type a role above and search to see live openings.
        </p>
      ) : null}
    </section>
  );
}

/** Re-score already-loaded jobs after the user adds an API key post-search. */
async function rescoreExisting(
  setup: Setup,
  jobs: NormalizedJob[],
  setMatches: React.Dispatch<React.SetStateAction<Record<string, MatchResult>>>,
  setMatchProgress: React.Dispatch<
    React.SetStateAction<{ done: number; total: number }>
  >,
) {
  setMatchProgress({ done: 0, total: jobs.length });
  await runWithConcurrency(jobs, 4, async (job) => {
    try {
      const res = await fetch("/api/jobs/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: setup.provider,
          apiKey: setup.apiKey,
          resume: setup.resume,
          job,
        }),
      });
      const m = (await res.json()) as MatchResult & { error?: string };
      if (res.ok && !m.error) {
        setMatches((prev) => ({ ...prev, [job.id]: m }));
      }
    } catch {
      /* per-job soft fail */
    } finally {
      setMatchProgress((p) => ({ ...p, done: p.done + 1 }));
    }
  });
}

function SetupPanel({
  setup,
  showKey,
  parsing,
  onToggleShowKey,
  onSaveKey,
  onUpload,
  onClear,
  onClose,
  canClose,
}: {
  setup: Setup;
  showKey: boolean;
  parsing: boolean;
  onToggleShowKey: () => void;
  onSaveKey: (next: Setup) => void;
  onUpload: (file: File) => void;
  onClear: () => void;
  onClose: () => void;
  canClose: boolean;
}) {
  const [draft, setDraft] = React.useState(setup);
  React.useEffect(() => setDraft(setup), [setup]);
  const fileRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-5 border-b border-white/[0.06] bg-black/20 px-6 py-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-100">Setup</h3>
        {canClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {/* ---- Resume upload (drop-zone + file picker) ------------------------ */}
      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-400">
          Resume
        </label>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={parsing}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl border border-dashed px-4 py-5 text-left transition-colors",
            setup.resume
              ? "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10"
              : "border-white/[0.12] bg-black/30 hover:border-violet-400/40 hover:bg-violet-500/5",
            parsing && "cursor-wait opacity-60",
          )}
        >
          <div
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
              setup.resume
                ? "bg-emerald-500/15 text-emerald-300"
                : "bg-violet-500/15 text-violet-300",
            )}
          >
            {parsing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : setup.resume ? (
              <FileText className="h-5 w-5" />
            ) : (
              <Upload className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-100">
              {parsing
                ? "Parsing…"
                : setup.resume
                  ? setup.resumeFileName || "Resume loaded"
                  : "Upload PDF, DOCX, or TXT"}
            </p>
            <p className="mt-0.5 truncate text-xs text-slate-400">
              {setup.resume
                ? `${setup.resume.length} chars · click to replace`
                : "We extract text in-memory and never store the file."}
            </p>
          </div>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
            e.target.value = "";
          }}
        />
      </div>

      {/* ---- API key ------------------------------------------------------- */}
      <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-400">
            LLM provider
          </label>
          <Select
            value={draft.provider}
            onChange={(e) =>
              setDraft({ ...draft, provider: e.target.value as Provider })
            }
            className="!h-10"
          >
            <option value="anthropic" className="bg-[#12121a]">
              Anthropic (Claude)
            </option>
            <option value="openai" className="bg-[#12121a]">
              OpenAI (GPT)
            </option>
          </Select>
          <p className="mt-1 text-[11px] text-slate-400">
            Default: {draft.provider === "anthropic" ? "Haiku" : "gpt-4o-mini"}
          </p>
        </div>
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-400">
            API key (required to rank jobs; leave blank to see unranked listings)
          </label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={draft.apiKey}
              onChange={(e) => setDraft({ ...draft, apiKey: e.target.value })}
              placeholder={
                draft.provider === "anthropic" ? "sk-ant-…" : "sk-…"
              }
              className="h-10 w-full rounded-xl border border-white/[0.08] bg-black/30 pl-3 pr-10 font-mono text-[12px] text-slate-100 outline-none placeholder:text-slate-600 focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20"
            />
            <button
              type="button"
              onClick={onToggleShowKey}
              aria-label={showKey ? "Hide key" : "Show key"}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
            >
              {showKey ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Get one at{" "}
            <a
              href={
                draft.provider === "anthropic"
                  ? "https://console.anthropic.com/settings/keys"
                  : "https://platform.openai.com/api-keys"
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-300 hover:underline"
            >
              {draft.provider === "anthropic"
                ? "console.anthropic.com"
                : "platform.openai.com"}
            </a>
            .
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] px-4 py-3 text-xs text-emerald-100/90">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" />
        <div className="space-y-1">
          <p className="font-medium text-emerald-200">
            Your data stays in your browser.
          </p>
          <p className="text-emerald-100/70">
            Resume text and the API key are stored in this browser&apos;s local
            storage. The key is sent only on match requests and is never
            logged on our servers.{" "}
            <Link
              href="/privacy#careers"
              className="text-emerald-200 underline-offset-2 hover:underline"
            >
              How we handle your data →
            </Link>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.05] pt-4">
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1.5 text-xs text-rose-300 hover:text-rose-200"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear stored data
        </button>
        <Button size="sm" onClick={() => onSaveKey(draft)}>
          Save
        </Button>
      </div>
    </div>
  );
}

function JobCard({
  job,
  match,
  hasKey,
}: {
  job: NormalizedJob;
  match: MatchResult | undefined;
  hasKey: boolean;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const score = match?.score;
  const verdict = match?.verdict;

  return (
    <GlassCard className="overflow-hidden p-0">
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-slate-100">
              {job.title}
            </h3>
            {match && verdict ? (
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                  VERDICT_COLOR[verdict],
                )}
              >
                {verdict} · {score}/100
              </span>
            ) : hasKey ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.02] px-2 py-0.5 text-[10px] text-slate-400">
                <Loader2 className="h-2.5 w-2.5 animate-spin" />
                scoring…
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-slate-300">
            {job.company}
            <span className="mx-2 text-slate-600">·</span>
            <span className="inline-flex items-center gap-1 text-slate-400">
              <MapPin className="h-3 w-3" />
              {job.location}
            </span>
            {job.remote ? (
              <Badge variant="glass" className="ml-2 !text-[10px]">
                Remote
              </Badge>
            ) : null}
            <Badge variant="outline" className="ml-2 !text-[10px] capitalize">
              {job.source}
            </Badge>
          </p>
          {match?.oneLiner ? (
            <p className="mt-2 text-sm italic text-slate-300">
              &ldquo;{match.oneLiner}&rdquo;
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg gradient-primary px-3 py-2 text-xs font-semibold text-white shadow-md shadow-violet-500/30 transition-transform hover:-translate-y-0.5"
          >
            Apply
            <ExternalLink className="h-3 w-3" />
          </a>
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs text-slate-300 hover:bg-white/[0.05]"
          >
            {expanded ? "Hide details" : "Details"}
          </button>
        </div>
      </div>

      {expanded ? (
        <div className="space-y-4 border-t border-white/[0.05] bg-black/20 px-5 py-4">
          {match ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {match.strengths.length ? (
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                    Why you fit
                  </p>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {match.strengths.map((s, i) => (
                      <li key={i} className="flex gap-1.5">
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {match.gaps.length ? (
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                    Gaps to close
                  </p>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {match.gaps.map((g, i) => (
                      <li key={i} className="flex gap-1.5">
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-amber-400" />
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}

          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Job description
            </p>
            <p className="text-xs leading-relaxed text-slate-300">
              {job.description}
            </p>
          </div>

          {job.tags.length ? (
            <div className="flex flex-wrap gap-1">
              {job.tags.map((tag) => (
                <Badge key={tag} variant="glass" className="!text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.05] pt-3 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              Source: {job.source}
              {job.postedAt
                ? ` · ${new Date(job.postedAt).toLocaleDateString()}`
                : ""}
            </span>
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-violet-300 hover:underline"
            >
              View original posting
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      ) : null}
    </GlassCard>
  );
}

async function runWithConcurrency<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  let i = 0;
  const runners = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (true) {
        const idx = i++;
        if (idx >= items.length) return;
        await worker(items[idx]!);
      }
    },
  );
  await Promise.all(runners);
}
