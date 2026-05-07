import { test, expect } from "@playwright/test";

/* ============================================================================
 *  Auth-redirect coverage — the proxy.ts PROTECTED_PREFIXES list says these
 *  must redirect unauthed users to /login. This test catches a future
 *  accidental removal that would expose user-only pages.
 * ============================================================================
 */

const PROTECTED_PATHS = ["/home", "/billing", "/profile", "/cohorts", "/careers"];

for (const path of PROTECTED_PATHS) {
  test(`${path} unauthed → /login`, async ({ page }) => {
    const res = await page.goto(path);
    // proxy.ts returns 307 → /login. Playwright follows redirects by default,
    // so we end up on /login with the original path as callbackUrl.
    await expect(page).toHaveURL(/\/login\?callbackUrl=/);
    expect(res?.status()).toBe(200);
  });
}

test("/login renders Welcome back heading", async ({ page }) => {
  await page.goto("/login");
  await expect(
    page.getByRole("heading", { level: 1, name: /Welcome back/i }),
  ).toBeVisible();
});
