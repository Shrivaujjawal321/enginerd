/* ============================================================================
 *  Table-of-contents extraction — runs in RSC, edge, or browser.
 *
 *  Lives in `lib/` (not in a `"use client"` component file) so server
 *  components can import it without dragging the on-page-toc client island
 *  through the RSC bundle boundary.
 * ============================================================================
 */

export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

/** Pull the H2/H3 outline out of a raw markdown source. */
export function extractToc(markdown: string): TocItem[] {
  const out: TocItem[] = [];
  const re = /^(#{2,3})\s+(.+?)\s*$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(markdown)) !== null) {
    const level = m[1]!.length as 2 | 3;
    const text = m[2]!.replace(/[#*_`]/g, "").trim();
    const id = text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\p{Letter}\p{Number}\s-]+/gu, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 80);
    if (id && text) out.push({ id, text, level });
  }
  return out;
}
