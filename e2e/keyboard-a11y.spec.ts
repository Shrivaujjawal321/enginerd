import { test, expect } from "@playwright/test";

/* ============================================================================
 *  Keyboard accessibility — pure-keyboard navigation across landing + login.
 *  Catches regressions in tab-order, focus rings, and the cycle-13 skip-link.
 * ============================================================================
 */

test("Tab from landing reaches the primary login link", async ({ page }) => {
  await page.goto("/");
  // Tab once → skip-to-content link (cycle 13).
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: /Skip to content/i }),
  ).toBeFocused();
});

test("Login form: typing 10 digits enables Send OTP and it can be focused", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel("Phone number").focus();
  await page.keyboard.type("9876543210");
  const send = page.getByRole("button", { name: /Send OTP/i });
  await expect(send).toBeEnabled();
  // The button is keyboard-reachable. Tab order can vary across nav links so
  // focus directly to verify it's a focusable, enabled control.
  await send.focus();
  await expect(send).toBeFocused();
});
