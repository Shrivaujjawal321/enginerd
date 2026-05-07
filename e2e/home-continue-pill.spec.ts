import { test, expect } from "@playwright/test";

/* ============================================================================
 *  /home unauthed redirect — verifies the cycle 15 "Continue" pill is
 *  protected behind auth (no UX leakage). The pill itself only renders for
 *  authed users with an in-progress subject; full visual coverage requires
 *  a seeded test user, which lives in cycle 16 integration tests.
 * ============================================================================
 */

test("/home unauthed redirects to /login with callbackUrl", async ({ page }) => {
  await page.goto("/home");
  await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fhome/);
});
