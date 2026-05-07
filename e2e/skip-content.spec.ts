import { test, expect } from "@playwright/test";

/* ============================================================================
 *  Skip-to-content link — WCAG 2.4.1 (Bypass Blocks) Level A.
 *  Added in cycle 13. Tabbing into the page should reveal the skip link
 *  as the first focusable element; pressing Enter jumps focus to <main>.
 * ============================================================================
 */

test("skip-to-content link appears on Tab and points at #main-content", async ({
  page,
}) => {
  await page.goto("/");

  // Tab once — the very first focusable element should be the skip link.
  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: /Skip to content/i });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toHaveAttribute("href", "#main-content");
});

test("/main-content target exists in marketing layout", async ({ page }) => {
  await page.goto("/");
  // The <main> element rendered with id="main-content" is the skip target.
  await expect(page.locator("main#main-content")).toHaveCount(1);
});
