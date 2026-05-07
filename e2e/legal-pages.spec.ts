import { test, expect } from "@playwright/test";

/**
 * Cycle 19 — every footer link must reach a real page. Smoke-tests the four
 * legal/contact pages introduced when we restructured the footer to remove
 * dead "#" links.
 */
test.describe("Legal pages", () => {
  test("/terms renders the Terms of Service heading", async ({ page }) => {
    await page.goto("/terms");
    await expect(
      page.getByRole("heading", { level: 1, name: /Terms of Service/i }),
    ).toBeVisible();
    await expect(page.getByText(/Last updated/i)).toBeVisible();
  });

  test("/privacy renders DPDPA-aware policy", async ({ page }) => {
    await page.goto("/privacy");
    await expect(
      page.getByRole("heading", { level: 1, name: /Privacy Policy/i }),
    ).toBeVisible();
    // The DPDPA acronym is the load-bearing India-specific signal.
    await expect(page.getByText(/DPDPA/).first()).toBeVisible();
  });

  test("/refunds explains the 7-day window", async ({ page }) => {
    await page.goto("/refunds");
    await expect(
      page.getByRole("heading", { level: 1, name: /Refund Policy/i }),
    ).toBeVisible();
    await expect(page.getByText(/7-day refund window/i)).toBeVisible();
  });

  test("/contact lists at least 3 distinct support emails", async ({ page }) => {
    await page.goto("/contact");
    await expect(
      page.getByRole("heading", { level: 1, name: /Contact/i }),
    ).toBeVisible();
    // Three buckets: billing, hello, privacy. Each has its own mailto link.
    await expect(
      page.locator('a[href^="mailto:billing@"]').first(),
    ).toBeVisible();
    await expect(
      page.locator('a[href^="mailto:hello@"]').first(),
    ).toBeVisible();
    await expect(
      page.locator('a[href^="mailto:privacy@"]').first(),
    ).toBeVisible();
  });

  test("footer Legal column links resolve from the landing page", async ({
    page,
  }) => {
    await page.goto("/");
    // Click each Legal column link via the visible-in-DOM footer entry.
    await page.locator('footer a[href="/terms"]').first().click();
    await expect(page).toHaveURL(/\/terms$/);
    await page.goto("/");
    await page.locator('footer a[href="/privacy"]').first().click();
    await expect(page).toHaveURL(/\/privacy$/);
  });
});
