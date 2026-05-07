"use client";

import * as React from "react";
import {
  AlertTriangle,
  Briefcase,
  ExternalLink,
  Eye,
  EyeOff,
  Key,
  Loader2,
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
  provider: Provider;
  apiKey: string;
};

const RESUME_KEY = "enginerd:job-agent:resume";
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
    return { resume: "", provider: "anthropic", apiKey: "" };
  return {
    resume: window.localStorage.getItem(RESUME_KEY) ?? "",
    provider:
      (window.localStorage.getItem(PROVIDER_KEY) as Provider) ?? "anthropic",
    apiKey: window.localStorage.getItem(API_KEY) ?? "",
  };
}

export function JobAgent() {
  const [hydrated, setHydrated] = React.useState(false);
  const [setup, setSetup] = React.useState<Setup>({
    resume: "",
    provider: "anthropic",
    apiKey: "",
  });
  const [setupOpen, setSetupOpen] = React.useState(false);
  const [showKey, setShowKey] = React.useState(false);

  const [query, setQuery] = React.useState("");
  const [searching, setSearching] = React.useState(false);
  const [jobs, setJobs] = React.useState<NormalizedJob[]>([]);
  const [matches, setMatches] = React.useState<Record<string, MatchResult>>({});
  const [matchProgress, setMatchProgress] = React.useState({ done: 0, total: 0 });
  const [searchError, setSearchError] = React.useState<string | null>(null);

  // Hydrate from localStorage on mount only.
  React.useEffect(() => {
    setSetup(loadInitial());
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    if (!setup.resume.trim() || !setup.apiKey.trim()) {
      setSetupOpen(true);
    }
  }, [hydrated, setup.resume, setup.apiKey]);

  function persistSetup(next: Setup) {
    setSetup(next);
    if (typeof window === "undefined") return;
    window.localStorage.setItem(RESUME_KEY, next.resume);
    window.localStorage.setItem(PROVIDER_KEY, next.provider);
    window.localStorage.setItem(API_KEY, next.apiKey);
  }

  function clearStored() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(RESUME_KEY);
    window.localStorage.removeItem(PROVIDER_KEY);
    window.localStorage.removeItem(API_KEY);
    setSetup({ resume: "", provider: "anthropic", apiKey: "" });
    setSetupOpen(true);
    toast.success("Local resume + API key cleared.");
  }

  async function onResumeFile(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large (max 5 MB).");
      return;
    }
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
      persistSetup({ ...setup, resume: data.text });
      toast.success(`Resume loaded — ${data.text.length} chars extracted.`, {
        id: t,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error(message, { id: t });
    }
  }

  async function runSearch() {
    if (!query.trim()) {
      toast.info("Type a role to search — e.g. 'react' or 'data engineer'.");
      return;
    }
    if (!setup.resume.trim() || !setup.apiKey.trim()) {
      setSetupOpen(true);
      toast.info("Resume + API key chahiye pehle.");
      return;
    }
    setSearching(true);
    setSearchError(null);
    setJobs([]);
    setMatches({});
    setMatchProgress({ done: 0, total: 0 });

    try {
      const res = await fetch(
        `/api/jobs/search?q=${encodeURIComponent(query)}`,
      );
      const data = (await res.json()) as { jobs?: NormalizedJob[]; error?: string };
      if (!res.ok || data.error) {
        throw new Error(data.error || `Search failed (${res.status})`);
      }
      const fetched = data.jobs ?? [];
      if (fetched.length === 0) {
        setSearchError("No jobs found. Try a different keyword.");
        setSearching(false);
        return;
      }
      // Cap to 10 most relevant — keeps token cost bounded.
      const slice = fetched.slice(0, 10);
      setJobs(slice);
      setMatchProgress({ done: 0, total: slice.length });

      // Fan out match calls in parallel — but with a soft concurrency cap of 4
      // so we don't spike user's LLM rate limits.
      await runWithConcurrency(slice, 4, async (job) => {
        try {
          const matchRes = await fetch("/api/jobs/match", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              provider: setup.provider,
              apiKey: setup.apiKey,
              resume: setup.resume,
              job,
            }),
          });
          const m = (await matchRes.json()) as MatchResult & { error?: string; detail?: string };
          if (matchRes.ok && !m.error) {
            setMatches((prev) => ({ ...prev, [job.id]: m }));
          } else {
            // Surface first auth/rate-limit error to user once.
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

  // Sort jobs by match score (matched first, descending), unmatched last.
  const ranked = React.useMemo(() => {
    return [...jobs].sort((a, b) => {
      const sa = matches[a.id]?.score ?? -1;
      const sb = matches[b.id]?.score ?? -1;
      return sb - sa;
    });
  }, [jobs, matches]);

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
                Real jobs from Remotive · Arbeitnow · The Muse — scored against
                your resume by your own LLM.
              </p>
            </div>
          </div>
          <Button
            variant="glass"
            size="sm"
            onClick={() => setSetupOpen((o) => !o)}
          >
            <Key className="h-3.5 w-3.5" />
            {setup.resume && setup.apiKey ? "Setup ready" : "Setup needed"}
          </Button>
        </div>

        {setupOpen ? (
          <SetupPanel
            setup={setup}
            showKey={showKey}
            onToggleShowKey={() => setShowKey((s) => !s)}
            onSave={(next) => {
              persistSetup(next);
              if (next.resume.trim() && next.apiKey.trim()) {
                setSetupOpen(false);
                toast.success("Saved locally — never sent to our servers.");
              }
            }}
            onUpload={onResumeFile}
            onClear={clearStored}
            onClose={() => setSetupOpen(false)}
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
                placeholder="Role or keyword — react, data engineer, senior backend, prompt engineer…"
                className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/20 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-400 focus:border-violet-500/40 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
            <Button onClick={runSearch} disabled={searching}>
              {searching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching…
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Search & match
                </>
              )}
            </Button>
          </div>

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

          {searchError ? (
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-rose-300">
              <AlertTriangle className="h-3.5 w-3.5" />
              {searchError}
            </p>
          ) : null}
        </div>
      </GlassCard>

      {ranked.length > 0 ? (
        <div className="space-y-3">
          {ranked.map((job) => {
            const m = matches[job.id];
            return <JobCard key={job.id} job={job} match={m} />;
          })}
        </div>
      ) : !searching ? (
        <p className="text-center text-sm text-slate-400">
          Search above to find jobs — the agent will rank them by your fit.
        </p>
      ) : null}
    </section>
  );
}

function SetupPanel({
  setup,
  showKey,
  onToggleShowKey,
  onSave,
  onUpload,
  onClear,
  onClose,
}: {
  setup: Setup;
  showKey: boolean;
  onToggleShowKey: () => void;
  onSave: (next: Setup) => void;
  onUpload: (file: File) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = React.useState(setup);
  React.useEffect(() => setDraft(setup), [setup]);

  return (
    <div className="space-y-5 border-b border-white/[0.06] bg-black/20 px-6 py-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-100">Setup</h3>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div>
        <label className="mb-2 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-slate-400">
          Resume (text)
          <label
            htmlFor="resume-file"
            className="inline-flex cursor-pointer items-center gap-1 text-[10px] font-medium normal-case tracking-normal text-violet-300 hover:text-violet-200"
          >
            <Upload className="h-3 w-3" />
            Upload PDF / DOCX / TXT
            <input
              id="resume-file"
              type="file"
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpload(file);
                e.target.value = ""; // allow re-uploading the same file
              }}
            />
          </label>
        </label>
        <textarea
          value={draft.resume}
          onChange={(e) => setDraft({ ...draft, resume: e.target.value })}
          placeholder="Paste your resume here — name, experience, skills, projects, education. Plain text is fine."
          spellCheck={false}
          className="block h-40 w-full resize-y rounded-xl border border-white/[0.08] bg-black/30 p-3 font-mono text-[12px] leading-relaxed text-slate-100 outline-none placeholder:text-slate-600 focus:border-violet-500/40 focus:ring-2 focus:ring-violet-500/20"
        />
        <p className="mt-1 text-[11px] text-slate-400">
          Stored only in your browser&apos;s localStorage. Never sent to
          EngiNerd&apos;s servers.
        </p>
      </div>

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
            API key
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
            Stays in your browser. Sent only on match request, never logged.
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

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.05] pt-4">
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1.5 text-xs text-rose-300 hover:text-rose-200"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear stored resume + key
        </button>
        <div className="flex gap-2">
          <Button variant="glass" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={() => onSave(draft)}>
            Save locally
          </Button>
        </div>
      </div>
    </div>
  );
}

function JobCard({
  job,
  match,
}: {
  job: NormalizedJob;
  match: MatchResult | undefined;
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
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.02] px-2 py-0.5 text-[10px] text-slate-400">
                <Loader2 className="h-2.5 w-2.5 animate-spin" />
                scoring…
              </span>
            )}
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
              {job.postedAt ? ` · ${new Date(job.postedAt).toLocaleDateString()}` : ""}
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
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const idx = i++;
      if (idx >= items.length) return;
      await worker(items[idx]);
    }
  });
  await Promise.all(runners);
}
