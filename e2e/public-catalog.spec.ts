import { test, expect } from "@playwright/test";

/* ============================================================================
 *  Public catalog — /roadmaps and /subjects became public in cycle 8.
 *  These tests guard against accidental re-gating and verify the catalog
 *  surfaces the post-cycle-9 content (TCS NQT, MERN, Backend, etc.).
 * ============================================================================
 */

test.describe("/roadmaps (public)", () => {
  test("renders with no redirect for unauthed visitors", async ({ page }) => {
    const res = await page.goto("/roadmaps");
    expect(res?.status()).toBe(200);
    await expect(page).toHaveURL(/\/roadmaps$/);
  });

  test("contains the placement-prep roadmap names", async ({ page }) => {
    await page.goto("/roadmaps");
    // At least three of the highest-leverage roadmaps must render.
    await expect(page.getByText(/TCS NQT/i).first()).toBeVisible();
    await expect(
      page.getByText(/MERN Stack Developer/i).first(),
    ).toBeVisible();
    await expect(
      page.getByText(/Service Company Cracker/i).first(),
    ).toBeVisible();
  });
});

test.describe("/subjects (public)", () => {
  test("renders with no redirect for unauthed visitors", async ({ page }) => {
    const res = await page.goto("/subjects");
    expect(res?.status()).toBe(200);
  });
});

test.describe("/api/search-index (public)", () => {
  test("returns at least 500 catalog entries with proper cache headers", async ({
    request,
  }) => {
    const res = await request.get("/api/search-index");
    expect(res.ok()).toBe(true);
    expect(res.headers()["cache-control"]).toMatch(/s-maxage/);
    const body = await res.json();
    expect(body.total).toBeGreaterThan(500);
  });
});
