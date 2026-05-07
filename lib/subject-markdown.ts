import "server-only";

import { readSubjectContent } from "@/lib/subject-content-store";

/**
 * Read the markdown for a subject. Cycle 22 moved the storage to a DB-first
 * + file-fallback pattern (see `lib/subject-content-store.ts`) so admins can
 * publish content without redeploying. This module stays as the public
 * import surface — call sites unchanged.
 */
export async function readSubjectMarkdown(
  slug: string,
): Promise<string | null> {
  return readSubjectContent(slug);
}
