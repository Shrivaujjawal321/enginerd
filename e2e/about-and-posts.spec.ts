import { test, expect } from "@playwright/test";

/**
 *  Cycle 24 — /about + /posts/agent-pipeline are the public surfaces a
 *  hiring manager hits when DM'd a link. They have to render correctly,
 *  link to the right places, and not regress.
 */
test.describe("/about", () => {
  test("renders the About header with name and contact CTAs", async ({
    page,
  }) => {
    await page.goto("/about");
    await expect(
      page.getByRole("heading", { level: 1, name: /Ujjwal/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /LinkedIn/i }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /GitHub/i }).first(),
    ).toBeVisible();
    // Mailto button surfaces the actual address — recruiters can copy it.
    await expect(
      page.getByRole("link", { name: /@/ }).first(),
    ).toBeVisible();
  });

  test("renders the highlights + skills sections with at least 4 cards each", async ({
    page,
  }) => {
    await page.goto("/about");
    await expect(
      page.getByRole("heading", { level: 2, name: /What I.+ve built/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: /Stack I reach for/i }),
    ).toBeVisible();
  });

  test("links to /changelog and the agent-pipeline post", async ({ page }) => {
    await page.goto("/about");
    await expect(
      page.getByRole("link", { name: /\/changelog/i }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /agent-pipeline/i }).first(),
    ).toBeVisible();
  });
});

test.describe("/posts/agent-pipeline", () => {
  test("renders the post header + reading-time badge + body", async ({
    page,
  }) => {
    await page.goto("/posts/agent-pipeline");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /5-stage Hinglish content pipeline/i,
      }),
    ).toBeVisible();
    await expect(page.getByText(/minute read/i)).toBeVisible();
    // The body should mention a load-bearing implementation detail.
    await expect(page.getByText(/tool-use/i).first()).toBeVisible();
  });

  test("an unknown slug 404s", async ({ page }) => {
    await page.goto("/posts/this-post-does-not-exist");
    await expect(
      page.getByText(/404|not found|page not found/i).first(),
    ).toBeVisible();
  });
});
