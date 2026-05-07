import type { GeneratedContentBlock, QualityVerdict } from "./types";

/**
 * Quality orchestrator runs *locally* — no LLM call. The prompts spec called
 * for code execution + LLM-based fact-check; we keep a pragmatic subset:
 *
 *  1. Hinglish ratio check  — simple Roman-Hindi heuristic on body text.
 *  2. Code shape sanity     — every "how"/"example" block with a code field
 *                             must have a non-empty snippet and recognized
 *                             language.
 *  3. Block coverage        — at least one of {what, why, how} present.
 *
 * Real Docker-sandboxed code execution lands in Phase 4.5.
 */

const HINGLISH_TOKEN_RE = /\b(hai|nahi|kar|kya|tum|tu|ke|liye|mai|main|wala|wali|tha|thi|the|ho|hota|hoti|sab|kaam|ek|aur|bhi|to|toh|jab|tab|kyu|kyunki|matlab|samjh|samjha|samjhi|chahiye|chahiyega|sirf|jaise|paani|baad|pehle|ya|abhi|bus|achha|theek|chal|chalo|le|lo|de|do|hi)\b/gi;

const VALID_LANGUAGES = new Set([
  "ts",
  "tsx",
  "js",
  "jsx",
  "java",
  "python",
  "py",
  "go",
  "rust",
  "rs",
  "kotlin",
  "kt",
  "swift",
  "csharp",
  "cs",
  "cpp",
  "c",
  "ruby",
  "rb",
  "php",
  "scala",
  "bash",
  "sh",
  "sql",
  "html",
  "css",
  "yaml",
  "yml",
  "json",
  "dart",
  "solidity",
]);

export function runQualityOrchestrator(
  blocks: GeneratedContentBlock[],
): QualityVerdict {
  const notes: string[] = [];
  let needsReview = false;

  const types = new Set(blocks.map((b) => b.type));
  const required: Array<typeof blocks[number]["type"]> = [
    "what",
    "why",
    "how",
    "example",
    "interview",
  ];
  const missing = required.filter((r) => !types.has(r));
  if (missing.length > 0) {
    notes.push(
      `Block coverage: missing required blocks ${JSON.stringify(missing)}.`,
    );
    needsReview = true;
  }
  if (!types.has("diagram")) {
    notes.push('Soft warning: no diagram block (the visual was requested).');
  }

  let bodyText = "";
  for (const b of blocks) {
    if (b.type === "what" || b.type === "why" || b.type === "how" || b.type === "example") {
      bodyText += " " + b.body.join(" ");
    } else if (b.type === "interview") {
      bodyText += " " + b.answer.join(" ") + " " + b.question;
    }
  }
  const ratio = computeHinglishRatio(bodyText);
  if (ratio < 0.18) {
    notes.push(
      `Hinglish ratio low (${ratio.toFixed(2)}) — content reads too English. Threshold: 0.18+.`,
    );
    needsReview = true;
  }

  for (const b of blocks) {
    if ((b.type === "how" || b.type === "example") && b.code) {
      const lang = b.code.language?.trim().toLowerCase() ?? "";
      if (!VALID_LANGUAGES.has(lang)) {
        notes.push(`Unrecognized code language "${b.code.language}" — accepted: TS/JS/Java/Python/Go/etc.`);
        needsReview = true;
      }
      if (!b.code.snippet || b.code.snippet.trim().length === 0) {
        notes.push(`Empty code snippet in "${b.title}".`);
        needsReview = true;
      }
    }
    if (b.type === "diagram") {
      if (!/(flowchart|sequenceDiagram|classDiagram|graph|stateDiagram)/i.test(b.mermaid)) {
        notes.push(`Diagram in "${b.title}" doesn't look like Mermaid syntax.`);
        needsReview = true;
      }
    }
  }

  if (notes.length === 0) notes.push("All checks passed.");

  return {
    status: needsReview ? "needs_review" : "published",
    notes,
    hinglishRatio: Number(ratio.toFixed(3)),
  };
}

function computeHinglishRatio(text: string): number {
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (tokens.length === 0) return 0;
  const matches = text.match(HINGLISH_TOKEN_RE);
  return (matches?.length ?? 0) / tokens.length;
}
