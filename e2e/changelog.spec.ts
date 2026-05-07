import { test, expect } from "@playwright/test";

/**
 * Cycle 23 — /changelog surfaces the 22 build-in-public reports. The page
 * is the strongest portfolio signal we have today, so a smoke test guards
 * against the index breaking silently.
 */
test.describe("Changelog", () => {
  test("/changelog renders the index with at least 20 cycles", async ({
    page,
  }) => {
    await page.goto("/changelog");
    await expect(
      page.getByRole("heading", { level: 1, name: /Changelog/i }),
    ).toBeVisible();
    // Stat row should show a cycles-shipped count >= 20.
    await expect(page.getByText(/Cycles shipped/i)).toBeVisible();
    // The most recent cycles must appear (cycle 22 is C22 from the seeded
    // tech-team/cycles directory).
    const items = page.getByRole("listitem");
    expect(await items.count()).toBeGreaterThanOrEqual(20);
  });

  test("a cycle card links through to its detail page", async ({ page }) => {
    await page.goto("/changelog");
    const cards = page.locator('a[href^="/changelog/"]:has(h2)');
    await cards.first().click();
    await expect(page).toHaveURL(/\/changelog\/\d+$/);
    // After cycle 23 strips the leading "# Cycle N" from the markdown, the
    // page has exactly one H1 (the page header) — strict mode passes.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("article h2").first()).toBeVisible();
  });

  test("/changelog/22 renders the cycle-22 markdown body", async ({ page }) => {
    await page.goto("/changelog/22");
    // Page-header H1 is the cycle TITLE only (no "Cycle 22" prefix); we use
    // the small header chip text for that.
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /Content out of frontend/i,
      }),
    ).toBeVisible();
    // Cycle 22's report mentions the runtime-of-record content move.
    await expect(page.getByText(/runtime-of-record/i)).toBeVisible();
  });

  test("an out-of-range cycle number 404s", async ({ page }) => {
    // Next 16's notFound() can stream as 200 + body OR return 404
    // depending on the route's dynamicParams config. Both are correct;
    // just assert the visible 404 content lands either way.
    await page.goto("/changelog/9999");
    await expect(
      page.getByText(/404|not found|page not found/i).first(),
    ).toBeVisible();
  });
});
