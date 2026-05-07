import { test, expect } from "@playwright/test";

/* ============================================================================
 *  /practice unauthed flow — verifies the cycle 11 + 12 changes:
 *  - /practice listing renders for unauthed visitors
 *  - sign-in nudge banner is visible
 *  - clicking a problem opens /practice/[slug] with read-only preview
 *  - the editor's Run button is replaced with "Sign in to run"
 * ============================================================================
 */

test("/practice listing shows sign-in nudge for unauthed", async ({ page }) => {
  await page.goto("/practice");
  await expect(
    page.getByText(/Sign in to track which problems you/i),
  ).toBeVisible();
  // The "Sign in" CTA in the nudge must link with /practice as callbackUrl.
  const cta = page.getByRole("link", { name: /^Sign in$/i }).first();
  await expect(cta).toBeVisible();
  await expect(cta).toHaveAttribute("href", /\/login\?callbackUrl=%2Fpractice/);
});

test("a practice problem detail page renders unauthed with read-only editor", async ({
  page,
  request,
}) => {
  // Pick the first slug from the search index — robust against catalog drift.
  const idx = await request.get("/api/search-index").then((r) => r.json());
  const firstProblem = (idx.items as Array<{ kind: string; slug: string }>).find(
    (i) => i.kind === "problem",
  );
  test.skip(!firstProblem, "No problems in catalog yet");
  if (!firstProblem) return;

  await page.goto(`/practice/${firstProblem.slug}`);
  // The "Sign in to run" CTA replaces the Run/Submit pair when unauthed.
  await expect(
    page.getByRole("button", { name: /Sign in to run/i }),
  ).toBeVisible();
});
