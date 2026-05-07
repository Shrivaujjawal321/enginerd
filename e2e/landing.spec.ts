import { test, expect } from "@playwright/test";

/* ============================================================================
 *  Landing page smoke — the first impression. Cheap test, high signal.
 *  Catches: hero text drift, broken images, missing CTA, accidental
 *  Hinglish in chrome (per voice rule).
 * ============================================================================
 */

test.describe("Landing page", () => {
  test("renders hero + signup CTA + pricing", async ({ page }) => {
    await page.goto("/");

    // Hero — the brand line lives in <h1>.
    await expect(
      page.getByRole("heading", { level: 1, name: /Engineering, explained/i }),
    ).toBeVisible();

    // Primary CTA in the hero form (multiple "Get started" buttons exist
    // across nav + hero + pricing — `.first()` pins the hero one).
    await expect(
      page.getByRole("button", { name: /Get started/i }).first(),
    ).toBeVisible();

    // Pricing section contains both paid tiers (multi-instance — `.first()`).
    await expect(page.getByText(/₹299/).first()).toBeVisible();
    await expect(page.getByText(/₹2,499/).first()).toBeVisible();

    // No Hinglish leak in chrome (catches voice regressions).
    const html = await page.content();
    expect(html).not.toMatch(/swagat hai|toot gaya|samjha jaaye/);
  });

  test("login link reaches /login", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /log in/i }).first().click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole("heading", { level: 1, name: /Welcome back/i }),
    ).toBeVisible();
  });
});
