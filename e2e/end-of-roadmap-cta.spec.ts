import { test, expect } from "@playwright/test";

/* ============================================================================
 *  End-of-roadmap "Try X next" CTA — cycle 12 introduced the gradient card,
 *  cycle 13 made it specific via getNextRoadmap(). The card surfaces on the
 *  LAST subject of the FIRST roadmap (in ROADMAPS array order) that
 *  contains the subject.
 *
 *  `resume-behavioural` is last in `product-company-cracker` (declared
 *  earlier in ROADMAPS than `service-company-cracker`). We assert the
 *  generic "Open <Next>" CTA exists rather than pinning a specific chain
 *  target — chain remaps shouldn't break this regression test.
 * ============================================================================
 */

test("last subject in a roadmap shows the chain's next-roadmap CTA", async ({
  page,
}) => {
  await page.goto("/subjects/resume-behavioural");
  // The end-of-roadmap card always renders when prev && !next.
  await expect(page.getByText(/End of roadmap/i)).toBeVisible();
  // The "Open <Next Roadmap>" CTA — chain-target-agnostic match.
  await expect(page.getByRole("link", { name: /^Open / })).toBeVisible();
});
