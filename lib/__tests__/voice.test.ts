import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { PLANS } from "@/lib/plans";

const ROOT = path.resolve(fileURLToPath(import.meta.url), "../../..");

/**
 *  Voice-rule regression: UI surfaces (transactional email + plan taglines)
 *  must be clean English. Hinglish lives in `content/*.md` only. This test
 *  fails fast if someone re-introduces the cycle-2 voice violation we fixed
 *  again in cycle 16.
 */

const HINGLISH_MARKERS = [
  "Tera ",
  "Yeh raha",
  "Agar tune",
  "Yeh 10 min",
  "Mujhe ", // typewriter exception is in marketing component, not these surfaces
  " kar de",
  " mein expire",
];

describe("voice rule — UI English surfaces stay English", () => {
  it("OTP email template has zero Hinglish markers", async () => {
    const src = await readFile(path.join(ROOT, "lib/otp/email.ts"), "utf8");
    for (const marker of HINGLISH_MARKERS) {
      expect(src, `Hinglish marker "${marker}" leaked into email template`).not.toContain(marker);
    }
  });

  it("plan taglines are outcome-driven, not feature lists", () => {
    // Outcome verbs we expect in at least one paid tagline.
    const paidTaglines = [PLANS.pro.tagline, PLANS.career.tagline].join(" ").toLowerCase();
    const outcomeVerbs = ["unstuck", "land", "offer", "mentored"];
    expect(
      outcomeVerbs.some((v) => paidTaglines.includes(v)),
      `paid taglines should contain at least one outcome verb. Got: ${paidTaglines}`,
    ).toBe(true);
  });
});
