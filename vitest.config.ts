import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/__tests__/**/*.test.ts", "lib/**/__tests__/*.test.ts"],
    // Playwright e2e specs live under e2e/ and run via `npm run e2e`.
    exclude: ["e2e/**", "node_modules/**", ".next/**"],
    // We don't run integration tests against Neon yet — keep tests pure.
    setupFiles: [],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["lib/**/*.ts"],
      exclude: ["lib/**/__tests__/**", "lib/db/migrations/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
      // The `server-only` package throws when imported outside of an RSC.
      // For unit tests we don't have an RSC bundler context, so stub it.
      "server-only": path.resolve(__dirname, "lib/__tests__/_stubs/server-only.ts"),
    },
  },
});
