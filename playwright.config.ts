import { defineConfig, devices } from "@playwright/test";

/* ============================================================================
 *  Playwright e2e config.
 *
 *  Run: `npm run e2e` (against an already-running prod server on 3001).
 *  Run: `npm run e2e:dev` (auto-boots `next dev` on 3001).
 *
 *  Tests live in `e2e/`. Keep them lean — DB-touching flows belong in
 *  vitest integration tests, not here.
 * ============================================================================
 */

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3001";
const REUSE_SERVER = process.env.E2E_REUSE === "1";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Auto-boot dev server unless E2E_REUSE=1 (CI / against prod build).
  webServer: REUSE_SERVER
    ? undefined
    : {
        command: "PORT=3001 npm run start",
        url: BASE_URL,
        reuseExistingServer: false,
        timeout: 120_000,
      },
});
