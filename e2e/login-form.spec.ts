import { test, expect } from "@playwright/test";

/* ============================================================================
 *  Login form — phone OTP UX. Verifies the cycle 3 / 8 / 13 work:
 *  - +91 prefix is rendered as inline label (not aria-label only)
 *  - Send OTP button stays disabled until 10 digits entered
 *  - Channel switcher (phone ↔ email) works without page reload
 * ============================================================================
 */

test("phone tab shows +91 inline prefix and disables Send OTP until 10 digits", async ({
  page,
}) => {
  await page.goto("/login");

  // Inline +91 prefix is rendered as a span next to the input.
  await expect(page.getByText("+91", { exact: true })).toBeVisible();

  // Send OTP button starts disabled (empty input).
  const send = page.getByRole("button", { name: /Send OTP/i });
  await expect(send).toBeDisabled();

  // Type only 9 digits → still disabled.
  await page.getByLabel("Phone number").fill("987654321");
  await expect(send).toBeDisabled();

  // 10 digits → enables.
  await page.getByLabel("Phone number").fill("9876543210");
  await expect(send).toBeEnabled();
});

test("channel switcher toggles between phone and email", async ({ page }) => {
  await page.goto("/login");

  // Default tab is phone.
  await expect(page.getByText("+91", { exact: true })).toBeVisible();

  // Switch to email — tab is a button with role tab and accessible name.
  await page.getByRole("tab", { name: /^Email$/ }).click();

  // Email field accepts an email-format placeholder.
  // Scope to the textbox role so the footer's "Email …" mailto link
  // (a <a>, not an input) can't satisfy the loose /Email/i label match.
  await expect(page.getByRole("textbox", { name: /Email/i })).toBeVisible();
  // +91 prefix is gone (we're on email channel now).
  await expect(page.getByText("+91", { exact: true })).not.toBeVisible();
});
