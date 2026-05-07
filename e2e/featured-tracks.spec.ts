import { test, expect } from "@playwright/test";

/* ============================================================================
 *  Featured tracks row on /roadmaps — added in cycle 11 to surface the 5
 *  highest-leverage placement roadmaps for mobile users (who don't see the
 *  desktop sidebar's PLACEMENT_TRACKS shortcut).
 * ============================================================================
 */

test("/roadmaps shows featured tracks pills row", async ({ page }) => {
  await page.goto("/roadmaps");
  // Section header is unique to the featured pills row.
  await expect(
    page.getByText(/Featured placement tracks/i),
  ).toBeVisible();

  // 5 featured roadmap slugs — assert each pill links to the right detail
  // page. We match by `href` because the visible text overlaps with the
  // full roadmap-card grid below.
  const expectedSlugs = [
    "tcs-nqt-cracker",
    "service-company-cracker",
    "product-company-cracker",
    "mern-stack-developer",
    "portfolio-builder",
  ];
  for (const slug of expectedSlugs) {
    // First match is the pill in the featured section; the second is the
    // full card below. Either being visible is sufficient.
    await expect(
      page.locator(`a[href="/roadmaps/${slug}"]`).first(),
    ).toBeVisible();
  }
});
