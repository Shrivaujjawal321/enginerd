import { test, expect } from "@playwright/test";

/* ============================================================================
 *  Subject page renders for unauthed visitors — markdown body + reading
 *  progress bar. Picks the first subject from the catalog dynamically to
 *  stay robust against catalog drift.
 * ============================================================================
 */

test("a subject page renders unauthed with a heading + reading progress bar host", async ({
  page,
  request,
}) => {
  // Pick the first subject slug from the public search-index.
  const idx = await request.get("/api/search-index").then((r) => r.json());
  const firstSubject = (idx.items as Array<{ kind: string; slug: string }>).find(
    (i) => i.kind === "subject",
  );
  test.skip(!firstSubject, "No subjects in catalog");
  if (!firstSubject) return;

  await page.goto(`/subjects/${firstSubject.slug}`);
  // Subject H1 renders (the catalog has a title for every entry).
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  // The reading-progress bar host element exists in the DOM (cycle 14+).
  // It's `aria-hidden`, so we use a CSS selector — the fixed-top thin bar.
  await expect(
    page.locator('div[aria-hidden][class*="fixed"][class*="top-0"]'),
  ).toHaveCount(1);
});
