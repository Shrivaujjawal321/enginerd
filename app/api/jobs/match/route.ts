import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { NormalizedJob } from "@/lib/job-providers";
import { llmCostLimiter, getClientIp, tooManyRequests } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Score a single job against a resume using the user's own LLM API key.
 *
 * We accept the key in the request body, use it for one match call, and
 * never persist it. The route is stateless — no logging of key, resume, or
 * match output.
 *
 * Anthropic and OpenAI both supported; user picks the provider in the UI.
 */

type MatchRequest = {
  provider: "anthropic" | "openai";
  apiKey: string;
  resume: string;
  job: NormalizedJob;
  /** Optional model override. */
  model?: string;
};

type MatchResult = {
  score: number;
  verdict: "strong" | "decent" | "stretch" | "skip";
  strengths: string[];
  gaps: string[];
  oneLiner: string;
};

const SYSTEM_PROMPT = `You are a career coach reviewing a single job posting against a candidate's resume.

You return JSON with exactly these keys:
  - score: integer 0-100 (overall match)
  - verdict: one of "strong" (score >= 80), "decent" (60-79), "stretch" (40-59), "skip" (< 40)
  - strengths: array of 2-4 short bullets (Hinglish OK) explaining why the candidate is a fit
  - gaps: array of 1-3 short bullets explaining missing skills or red flags
  - oneLiner: a single Hinglish sentence summarizing the recommendation

Be honest. If the resume genuinely lacks core requirements, say so — don't inflate scores. If the resume is empty or junk, score 0 and put a friendly note in gaps.`;

function buildUserPrompt(resume: string, job: NormalizedJob): string {
  // Cap inputs to keep cost bounded — IIT-level resumes are not 50k tokens.
  const resumeTrimmed = resume.length > 6000 ? resume.slice(0, 6000) + "…" : resume;
  const jdTrimmed = job.description.length > 3000 ? job.description.slice(0, 3000) + "…" : job.description;
  return `RESUME:
"""
${resumeTrimmed}
"""

JOB POSTING:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location} ${job.remote ? "(remote)" : ""}
Tags: ${job.tags.join(", ") || "—"}

Description:
"""
${jdTrimmed}
"""

Score this match. Return only the JSON object — no prose, no markdown.`;
}

function parseScore(raw: string): MatchResult {
  // Strip markdown code fences if model added them.
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  const parsed = JSON.parse(cleaned) as MatchResult;
  // Defensive normalisation
  const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0)));
  return {
    score,
    verdict:
      parsed.verdict ||
      (score >= 80 ? "strong" : score >= 60 ? "decent" : score >= 40 ? "stretch" : "skip"),
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 4) : [],
    gaps: Array.isArray(parsed.gaps) ? parsed.gaps.slice(0, 3) : [],
    oneLiner: String(parsed.oneLiner ?? "—"),
  };
}

async function scoreWithAnthropic(
  apiKey: string,
  resume: string,
  job: NormalizedJob,
  model: string,
): Promise<MatchResult> {
  const client = new Anthropic({ apiKey });
  const res = await client.messages.create({
    model,
    max_tokens: 600,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt(resume, job) }],
  });
  const textBlock = res.content.find((b) => b.type === "text") as
    | { type: "text"; text: string }
    | undefined;
  if (!textBlock) throw new Error("No text in Anthropic response");
  return parseScore(textBlock.text);
}

async function scoreWithOpenAI(
  apiKey: string,
  resume: string,
  job: NormalizedJob,
  model: string,
): Promise<MatchResult> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(resume, job) },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 600,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content ?? "";
  return parseScore(text);
}

export async function POST(req: Request) {
  // Cost amplifier — every call hits Anthropic / OpenAI on the user's key,
  // but our compute + bandwidth still costs money. 5/min/IP is sane.
  const ip = getClientIp(req);
  const rl = await llmCostLimiter.limit(`jobs-match:${ip}`);
  if (!rl.success) return tooManyRequests(rl.reset);

  let body: MatchRequest;
  try {
    body = (await req.json()) as MatchRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { provider, apiKey, resume, job, model } = body;
  if (!provider || !apiKey || !resume || !job) {
    return NextResponse.json(
      { error: "provider, apiKey, resume, job all required" },
      { status: 400 },
    );
  }
  if (resume.trim().length < 50) {
    return NextResponse.json(
      { error: "Resume looks empty or too short. Paste at least a paragraph." },
      { status: 400 },
    );
  }

  try {
    let result: MatchResult;
    if (provider === "anthropic") {
      result = await scoreWithAnthropic(
        apiKey,
        resume,
        job,
        model || "claude-haiku-4-5",
      );
    } else if (provider === "openai") {
      result = await scoreWithOpenAI(
        apiKey,
        resume,
        job,
        model || "gpt-4o-mini",
      );
    } else {
      return NextResponse.json(
        { error: `Unsupported provider: ${provider}` },
        { status: 400 },
      );
    }
    return NextResponse.json({ jobId: job.id, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    // Don't leak the key — but pass through the API's own error message.
    return NextResponse.json(
      { error: "Match failed", detail: message.replace(apiKey, "[REDACTED]") },
      { status: 502 },
    );
  }
}
