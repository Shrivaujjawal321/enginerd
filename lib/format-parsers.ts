/**
 * Deterministic markdown → format transforms.
 *
 * Cycle 21 ships slides / mindmap / flashcards as on-the-fly views over the
 * same markdown source we already render. No LLM call — every transform is a
 * pure function of the markdown string. Cheap, instant, and stable so users
 * see the same slide / card / node every time they revisit a subject.
 *
 * (Cycle 22 will layer LLM-generated formats on top for arbitrary user
 * topics; the renderers stay the same — only the upstream parser changes.)
 */

export type Slide = {
  /** Heading text from the original `## ...` line. */
  title: string;
  /** Markdown body for that section, ready to feed back to MarkdownRenderer. */
  body: string;
};

export type MindmapNode = {
  title: string;
  children: MindmapNode[];
};

export type Flashcard = {
  /** The prompt — heading or bold term. */
  front: string;
  /** The explanation — the paragraph that follows. */
  back: string;
};

/* ============================================================================
 *  Slides — split on `## ` (H2). Anything before the first H2 (intro prose
 *  + the H1) becomes the first slide titled with the document's H1 (or the
 *  subject title when no H1 is present). Empty sections are dropped.
 * ============================================================================
 */
export function parseSlides(markdown: string, fallbackTitle: string): Slide[] {
  if (!markdown.trim()) return [];

  const lines = markdown.split("\n");
  const slides: Slide[] = [];
  let currentTitle: string | null = null;
  let buffer: string[] = [];
  let docTitle: string | null = null;

  const flush = () => {
    const body = buffer.join("\n").trim();
    if (currentTitle == null && !body) return;
    slides.push({
      title: currentTitle ?? docTitle ?? fallbackTitle,
      body,
    });
  };

  for (const line of lines) {
    // Capture H1 for the very first slide title; treat as content otherwise.
    const h1 = /^# (?!#)(.+)/.exec(line);
    if (h1 && docTitle == null && currentTitle == null) {
      docTitle = h1[1]!.trim();
      continue;
    }
    const h2 = /^## (?!#)(.+)/.exec(line);
    if (h2) {
      flush();
      currentTitle = h2[1]!.trim();
      buffer = [];
      continue;
    }
    buffer.push(line);
  }
  flush();

  return slides.filter((s) => s.title || s.body);
}

/* ============================================================================
 *  Mindmap — fold H1 / H2 / H3 into a 3-level tree. The H1 is the root; H2
 *  becomes a branch; H3 becomes a leaf under its preceding H2. We cap leaves
 *  per branch so very long subjects don't blow up the SVG.
 * ============================================================================
 */
export function parseMindmap(
  markdown: string,
  fallbackTitle: string,
): MindmapNode {
  const root: MindmapNode = { title: fallbackTitle, children: [] };
  if (!markdown.trim()) return root;

  let h1Captured = false;
  let currentH2: MindmapNode | null = null;
  const MAX_H3_PER_BRANCH = 8;

  for (const raw of markdown.split("\n")) {
    const line = raw.trimEnd();
    const h1 = /^# (?!#)(.+)/.exec(line);
    const h2 = /^## (?!#)(.+)/.exec(line);
    const h3 = /^### (?!#)(.+)/.exec(line);

    if (h1 && !h1Captured) {
      root.title = stripMd(h1[1]!.trim());
      h1Captured = true;
      continue;
    }
    if (h2) {
      currentH2 = { title: stripMd(h2[1]!.trim()), children: [] };
      root.children.push(currentH2);
      continue;
    }
    if (h3 && currentH2 && currentH2.children.length < MAX_H3_PER_BRANCH) {
      currentH2.children.push({
        title: stripMd(h3[1]!.trim()),
        children: [],
      });
    }
  }

  return root;
}

/**
 * Render a MindmapNode tree as Mermaid `mindmap` source. Mermaid is already a
 * first-class renderer in MarkdownRenderer — feeding it a mindmap fences re-uses
 * the same lazy-loaded WASM bundle.
 */
export function mindmapToMermaid(root: MindmapNode): string {
  const lines: string[] = ["mindmap"];
  const escape = (s: string) => s.replace(/[()`]/g, "").slice(0, 60);
  lines.push(`  root((${escape(root.title)}))`);
  for (const branch of root.children) {
    lines.push(`    ${escape(branch.title)}`);
    for (const leaf of branch.children) {
      lines.push(`      ${escape(leaf.title)}`);
    }
  }
  return lines.join("\n");
}

/* ============================================================================
 *  Flashcards — extract `### Heading\n\nFirst paragraph` pairs as
 *  Q-and-A flashcards. Skips H1 / H2 (they're too broad to flash). Cap the
 *  total cards so subjects with hundreds of H3s stay scannable.
 * ============================================================================
 */
const MAX_CARDS = 30;

export function parseFlashcards(markdown: string): Flashcard[] {
  if (!markdown.trim()) return [];
  const lines = markdown.split("\n");
  const cards: Flashcard[] = [];
  let pendingFront: string | null = null;
  let pendingBack: string[] = [];

  const commit = () => {
    if (pendingFront == null) return;
    const back = pendingBack.join("\n").trim();
    if (back) {
      cards.push({ front: pendingFront, back });
    }
    pendingFront = null;
    pendingBack = [];
  };

  for (const raw of lines) {
    const h3 = /^### (?!#)(.+)/.exec(raw);
    if (h3) {
      commit();
      pendingFront = stripMd(h3[1]!.trim());
      continue;
    }
    // A new H1 / H2 always closes the current card without opening a new one.
    if (/^#{1,2} /.test(raw)) {
      commit();
      continue;
    }
    if (pendingFront != null) {
      // Stop the back at the first blank line — keeps cards short and
      // avoids leaking the next subsection's prose into this answer.
      if (raw.trim() === "" && pendingBack.length > 0) {
        commit();
        continue;
      }
      pendingBack.push(raw);
    }
  }
  commit();

  return cards.slice(0, MAX_CARDS);
}

/** Strip the noisiest markdown markers from a heading so it reads cleanly
 *  in card titles and mindmap nodes. We keep the prose intact — just remove
 *  inline code ticks, asterisks, and brackets. */
function stripMd(s: string): string {
  return s
    .replace(/`+/g, "")
    .replace(/\*+/g, "")
    .replace(/\[(.+?)\]\([^)]+\)/g, "$1");
}
