/**
 * scripts/migrate-content-to-md.ts
 *
 * Convert the legacy `lib/mock-data/*-content.ts` `SubtopicContentBlock[]`
 * trees into one Markdown file per subject at `content/<slug>.md`.
 *
 * Why: those TS modules ship ~10K LOC into the client bundle. Markdown is
 * leaner, edit-friendlier, and uses the same renderer all other subjects
 * already use. Once this lands, the legacy modules + the `SubjectReader`
 * code path can be deleted.
 *
 * Idempotent — re-running overwrites the generated MD with current content.
 *
 * Usage:
 *   npx tsx scripts/migrate-content-to-md.ts                  # all subjects
 *   npx tsx scripts/migrate-content-to-md.ts java-fundamentals
 */

import { promises as fs } from "node:fs";
import path from "node:path";

import { SUBJECTS } from "../lib/mock-data/subjects";
import type {
  Subject,
  Subtopic,
  SubtopicContentBlock,
} from "../lib/mock-data/types";

const CONTENT_DIR = path.join(process.cwd(), "content");

/* ----------------------- Markdown serializer ---------------------------- */

const SECTION_HEADING: Record<SubtopicContentBlock["type"], string> = {
  what: "Kya hai?",
  why: "Kyun zaroori hai?",
  how: "Kaise kaam karta hai?",
  example: "Real-life example",
  diagram: "Visual",
  interview: "Interview question",
};

function renderBlock(b: SubtopicContentBlock): string {
  // H4 banner — keeps subtopic-internal sections distinct from H3 subtopic title.
  const heading = `#### ${SECTION_HEADING[b.type]} — ${b.title}`;
  const parts: string[] = [heading, ""];

  if (b.type === "diagram") {
    parts.push("```mermaid", b.mermaid.trim(), "```", "");
    return parts.join("\n");
  }

  if (b.type === "interview") {
    parts.push(`**Q:** ${b.question}`, "");
    parts.push(...b.answer.map((p) => `> ${p}`));
    parts.push("");
    return parts.join("\n");
  }

  // what / why / how / example all have body[] (+ optional code block)
  for (const p of b.body) parts.push(p, "");
  if ("code" in b && b.code) {
    parts.push("```" + b.code.language, b.code.snippet, "```", "");
  }
  return parts.join("\n");
}

function renderSubtopic(sub: Subtopic): string {
  if (!sub.content || sub.content.length === 0) return "";
  const lines: string[] = [`### ${sub.title}`, ""];
  for (const block of sub.content) lines.push(renderBlock(block));
  return lines.join("\n");
}

function renderSubject(subject: Subject): string {
  const lines: string[] = [
    `# ${subject.title}`,
    "",
    `> ${subject.description}`,
    "",
    `**Difficulty:** ${subject.difficulty}  ·  **Estimated:** ${subject.estHours}h  ·  **Topics:** ${subject.topicsCount}`,
    "",
    "---",
    "",
  ];

  for (const topic of subject.topics) {
    const populated = topic.subtopics.filter(
      (s) => s.content && s.content.length > 0,
    );
    if (populated.length === 0) continue;
    lines.push(`## ${topic.title}`, "");
    for (const sub of populated) lines.push(renderSubtopic(sub));
  }

  return lines.join("\n").trim() + "\n";
}

/* --------------------------- Main --------------------------------------- */

function hasInline(s: Subject): boolean {
  return s.topics.some((t) =>
    t.subtopics.some((sub) => sub.content && sub.content.length > 0),
  );
}

async function main() {
  const filter = process.argv[2];
  const targets = SUBJECTS.filter(
    (s) => hasInline(s) && (!filter || s.slug === filter),
  );

  if (targets.length === 0) {
    console.log(`[migrate] no subjects matched filter ${filter ?? "*"}`);
    return;
  }

  console.log(
    `[migrate] processing ${targets.length} subject(s) with inline content`,
  );

  for (const subject of targets) {
    const md = renderSubject(subject);
    const out = path.join(CONTENT_DIR, `${subject.slug}.md`);

    // Don't clobber an existing curated file unless the user explicitly
    // re-targets that slug. Phase-3 generated content (Data Analyst Top 2%)
    // already lives under `content/<slug>.md` and we don't want to touch
    // those.
    if (!filter) {
      try {
        await fs.access(out);
        console.warn(
          `[migrate]  ${subject.slug}: skipping — content/${subject.slug}.md already exists`,
        );
        continue;
      } catch {
        // file missing — proceed to write
      }
    }

    await fs.writeFile(out, md, "utf8");
    const sizeKb = Math.round(md.length / 102.4) / 10;
    console.log(
      `[migrate]  ${subject.slug.padEnd(22)} ${sizeKb}KB  written to content/${subject.slug}.md`,
    );
  }
}

main().catch((err) => {
  console.error("[migrate] FAILED:", err);
  process.exit(1);
});
