import { describe, expect, it } from "vitest";
import {
  parseSlides,
  parseMindmap,
  mindmapToMermaid,
  parseFlashcards,
} from "@/lib/format-parsers";

describe("parseSlides", () => {
  it("returns empty array for empty markdown", () => {
    expect(parseSlides("", "Fallback")).toEqual([]);
  });

  it("splits on H2 and uses the H1 (when present) as the first slide title", () => {
    const md = `# Subject Title\n\nIntro paragraph.\n\n## First Section\nBody one.\n\n## Second Section\nBody two.`;
    const slides = parseSlides(md, "Fallback");
    expect(slides).toHaveLength(3);
    expect(slides[0]!.title).toBe("Subject Title");
    expect(slides[0]!.body).toContain("Intro paragraph.");
    expect(slides[1]!.title).toBe("First Section");
    expect(slides[2]!.title).toBe("Second Section");
  });

  it("uses the fallback title when there's no H1 and content precedes the first H2", () => {
    const md = `Some prose without a heading.\n\n## Real Section\nbody`;
    const slides = parseSlides(md, "MongoDB Deep Dive");
    expect(slides[0]!.title).toBe("MongoDB Deep Dive");
    expect(slides[0]!.body).toContain("Some prose without a heading.");
  });

  it("ignores H3 headings — they're for flashcards, not slides", () => {
    const md = `## A\n### Sub\nbody\n## B\nbody2`;
    const slides = parseSlides(md, "X");
    expect(slides.map((s) => s.title)).toEqual(["A", "B"]);
    expect(slides[0]!.body).toContain("### Sub");
  });

  it("does not mistake `### foo` for an H2 — H3-only content collapses into one fallback slide", () => {
    const md = `### only-h3-here\nfoo`;
    const slides = parseSlides(md, "X");
    expect(slides).toHaveLength(1);
    // Title comes from the fallback because there's no H1 and no H2.
    expect(slides[0]!.title).toBe("X");
    // The H3 line is preserved verbatim in the body — H3 isn't a slide boundary.
    expect(slides[0]!.body).toContain("### only-h3-here");
  });
});

describe("parseMindmap", () => {
  it("falls back to the subject title when no H1 is present", () => {
    const md = `## A\n## B`;
    const tree = parseMindmap(md, "Subject");
    expect(tree.title).toBe("Subject");
    expect(tree.children.map((c) => c.title)).toEqual(["A", "B"]);
  });

  it("captures H1 → H2 → H3 hierarchy", () => {
    const md = `# Root\n## Branch 1\n### Leaf 1a\n### Leaf 1b\n## Branch 2\n### Leaf 2a`;
    const tree = parseMindmap(md, "fallback");
    expect(tree.title).toBe("Root");
    expect(tree.children).toHaveLength(2);
    expect(tree.children[0]!.title).toBe("Branch 1");
    expect(tree.children[0]!.children.map((c) => c.title)).toEqual([
      "Leaf 1a",
      "Leaf 1b",
    ]);
  });

  it("caps leaves per branch at 8 so verbose subjects don't blow up the SVG", () => {
    const leaves = Array.from({ length: 20 }, (_, i) => `### L${i}`).join("\n");
    const tree = parseMindmap(`## B\n${leaves}`, "X");
    expect(tree.children[0]!.children).toHaveLength(8);
  });

  it("strips inline code ticks and asterisks from heading text", () => {
    const md = `## **Bold** \`Code\` Section`;
    const tree = parseMindmap(md, "X");
    expect(tree.children[0]!.title).toBe("Bold Code Section");
  });
});

describe("mindmapToMermaid", () => {
  it("emits valid mermaid mindmap source", () => {
    const out = mindmapToMermaid({
      title: "Subject",
      children: [
        { title: "Branch", children: [{ title: "Leaf", children: [] }] },
      ],
    });
    const lines = out.split("\n");
    expect(lines[0]).toBe("mindmap");
    expect(lines[1]).toBe("  root((Subject))");
    expect(lines[2]).toBe("    Branch");
    expect(lines[3]).toBe("      Leaf");
  });

  it("escapes parentheses + backticks that would break mermaid parsing", () => {
    const out = mindmapToMermaid({
      title: "A (paren)",
      children: [{ title: "B `code`", children: [] }],
    });
    expect(out).not.toContain("(paren)");
    expect(out).not.toContain("`code`");
  });
});

describe("parseFlashcards", () => {
  it("pairs each H3 with the paragraph that follows it", () => {
    const md = `## Section\n\n### Term One\nDefinition one.\n\n### Term Two\nDefinition two.`;
    const cards = parseFlashcards(md);
    expect(cards).toHaveLength(2);
    expect(cards[0]!.front).toBe("Term One");
    expect(cards[0]!.back.trim()).toBe("Definition one.");
    expect(cards[1]!.front).toBe("Term Two");
  });

  it("stops the back at the first blank line so cards don't bleed into the next subsection", () => {
    const md = `### Term\nFirst line.\nSecond line.\n\nUnrelated paragraph.\n\n### Next\nx`;
    const cards = parseFlashcards(md);
    expect(cards[0]!.back).toBe("First line.\nSecond line.");
    expect(cards[0]!.back).not.toContain("Unrelated paragraph");
  });

  it("drops cards with no body", () => {
    const md = `### Empty\n\n### Has Body\nyes`;
    const cards = parseFlashcards(md);
    expect(cards.map((c) => c.front)).toEqual(["Has Body"]);
  });

  it("caps total cards at 30 even for long subjects", () => {
    const md = Array.from(
      { length: 50 },
      (_, i) => `### Card ${i}\ndefinition ${i}`,
    ).join("\n\n");
    const cards = parseFlashcards(md);
    expect(cards).toHaveLength(30);
  });

  it("returns an empty deck for empty input", () => {
    expect(parseFlashcards("")).toEqual([]);
  });
});
