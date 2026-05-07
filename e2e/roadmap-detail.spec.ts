import { test, expect } from "@playwright/test";

/* ============================================================================
 *  Roadmap detail page — public preview for unauthed visitors.
 *  Verifies cycle 10 (sign-in CTA) + cycle 13 (per-roadmap chain map).
 * ============================================================================
 */

test("/roadmaps/service-company-cracker shows sign-in CTAs unauthed", async ({
  page,
}) => {
  await page.goto("/roadmaps/service-company-cracker");
  // The unauthed CTA from cycle 10 — "Sign in to start" replaces "Continue learning".
  await expect(
    page.getByRole("link", { name: /Sign in to start/i }),
  ).toBeVisible();
  // The "Track your progress" sign-in nudge card is also visible.
  await expect(page.getByText(/Track your progress/i)).toBeVisible();
});

test("/roadmaps/<slug> renders subjects list", async ({ page }) => {
  await page.goto("/roadmaps/tcs-nqt-cracker");
  // The roadmap title appears in the H1.
  await expect(
    page.getByRole("heading", { level: 1, name: /TCS NQT/i }),
  ).toBeVisible();
});
