import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // React Compiler (eslint-plugin-react-hooks v6) ships two rules that, in
    // their current form, fire on intentional and well-tested patterns:
    //   - set-state-in-effect: post-mount SSR-hydration reads (localStorage,
    //     navigator.platform) and reset-state-on-dep-change effects.
    //   - purity: a once-per-second live countdown that reads Date.now() in
    //     render (the component re-renders on a tick by design).
    // These are correct, covered by unit + e2e tests, and compile/build clean.
    // Kept as warnings (not errors) so `next build` and CI stay green while the
    // sites remain visible for a future React-Compiler migration pass.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
    },
  },
]);

export default eslintConfig;
