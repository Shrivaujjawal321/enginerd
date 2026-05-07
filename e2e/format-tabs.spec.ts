import { test, expect } from "@playwright/test";

/**
 * Cycle 21 — every subject page now has Read / Slides / Mindmap / Flashcards
 * tabs. This smoke test walks through all four formats on the public mongodb
 * subject (chosen because its 1500-line markdown has plenty of H2 + H3 to
 * exercise every parser).
 */
test.describe("Subject format switcher", () => {
  test("renders all 4 tabs on a subject page", async ({ page }) => {
    await page.goto("/subjects/mongodb-deep-dive");
    const tablist = page.getByRole("tablist", { name: /Subject format/i });
    await expect(tablist).toBeVisible();
    for (const label of ["Read", "Slides", "Mindmap", "Flashcards"]) {
      await expect(tablist.getByRole("tab", { name: label })).toBeVisible();
    }
  });

  test("Slides tab navigates to ?format=slides and shows a slide counter", async ({
    page,
  }) => {
    await page.goto("/subjects/mongodb-deep-dive");
    await page
      .getByRole("tab", { name: "Slides" })
      .click();
    await expect(page).toHaveURL(/[?&]format=slides/);
    // The slide counter has a deterministic shape: "Slide N / M".
    await expect(page.getByText(/Slide \d+/i).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Next slide/i })).toBeVisible();
  });

  test("Mindmap tab renders the mindmap host card", async ({ page }) => {
    await page.goto("/subjects/mongodb-deep-dive?format=mindmap");
    await expect(
      page.getByText(/Mindmap · \d+ nodes · \d+ branches/i),
    ).toBeVisible();
  });

  test("Flashcards tab renders a card counter and Got it / Try again controls", async ({
    page,
  }) => {
    await page.goto("/subjects/mongodb-deep-dive?format=flashcards");
    await expect(page.getByText(/Card \d+/i).first()).toBeVisible();
    // Buttons have descriptive aria-labels — match the load-bearing words.
    await expect(
      page.getByRole("button", { name: /mastered|Got it/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /again later|Try again/i }),
    ).toBeVisible();
  });

  test("Read tab is the default when no format param is set", async ({
    page,
  }) => {
    await page.goto("/subjects/mongodb-deep-dive");
    const readTab = page.getByRole("tab", { name: "Read" });
    await expect(readTab).toHaveAttribute("aria-selected", "true");
  });
});
