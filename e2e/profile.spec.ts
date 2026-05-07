import { test, expect } from "@playwright/test";

/* ============================================================================
 *  Public profile route /u/[handle] — unauthed visitors should see a
 *  rendered page when the handle exists, and a 404 when it doesn't.
 *  No DB seed required for the negative case.
 * ============================================================================
 */

test("/u/<unknown handle> renders the not-found page", async ({ page }) => {
  // Next 16 renders the not-found UI for handles with no matching user.
  // We verify by content rather than HTTP status — Next 16 returns the
  // 404 body even when the response is technically 200.
  await page.goto("/u/zzzzzznotahandle");
  await expect(page.getByText(/Page not found/i)).toBeVisible();
});

test("/u/<reserved handle> renders the not-found page", async ({ page }) => {
  // 'admin' is in the reserved list — handle setting refuses it,
  // and lookup returns null → notFound().
  await page.goto("/u/admin");
  await expect(page.getByText(/Page not found/i)).toBeVisible();
});
