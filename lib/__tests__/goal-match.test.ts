import { describe, expect, it } from "vitest";
import { matchGoal, VALID_SLUGS, GOAL_PREVIEWS } from "@/lib/goal-match";

/* ============================================================================
 * matchGoal — unit tests
 *
 * Three groups:
 *   A. Real engineering roles → match correct slug.
 *   B. Hinglish phrasing → noise stripped, role matched.
 *   C. Garbage / ambiguous / empty → null.
 *   D. VALID_SLUGS set contract.
 *   E. GOAL_PREVIEWS coverage.
 * ============================================================================ */

describe("matchGoal — real role matches", () => {
  it("ml → ml-engineer", () => {
    expect(matchGoal("ml")?.slug).toBe("ml-engineer");
  });

  it("'ml engineer' → ml-engineer", () => {
    expect(matchGoal("ml engineer")?.slug).toBe("ml-engineer");
  });

  it("'AIML engineer' (mixed case) → ml-engineer", () => {
    expect(matchGoal("AIML engineer")?.slug).toBe("ml-engineer");
  });

  it("'data scientist' → ml-engineer", () => {
    expect(matchGoal("data scientist")?.slug).toBe("ml-engineer");
  });

  it("'Machine Learning Engineer' → ml-engineer", () => {
    expect(matchGoal("Machine Learning Engineer")?.slug).toBe("ml-engineer");
  });

  it("'data analyst' → data-analyst-top2", () => {
    expect(matchGoal("data analyst")?.slug).toBe("data-analyst-top2");
  });

  it("'analytics' → data-analyst-top2", () => {
    expect(matchGoal("analytics")?.slug).toBe("data-analyst-top2");
  });

  it("'data engineer' → data-engineer (not data-analyst-top2)", () => {
    expect(matchGoal("data engineer")?.slug).toBe("data-engineer");
  });

  it("'backend developer' → backend-engineer", () => {
    expect(matchGoal("backend developer")?.slug).toBe("backend-engineer");
  });

  it("'backend' → backend-engineer", () => {
    expect(matchGoal("backend")?.slug).toBe("backend-engineer");
  });

  it("'fastapi developer' → backend-engineer", () => {
    expect(matchGoal("fastapi developer")?.slug).toBe("backend-engineer");
  });

  it("'golang developer' → backend-engineer", () => {
    expect(matchGoal("golang developer")?.slug).toBe("backend-engineer");
  });

  it("'frontend developer' → senior-frontend-engineer", () => {
    expect(matchGoal("frontend developer")?.slug).toBe("senior-frontend-engineer");
  });

  it("'frontend' → senior-frontend-engineer", () => {
    expect(matchGoal("frontend")?.slug).toBe("senior-frontend-engineer");
  });

  it("'React developer' → senior-frontend-engineer", () => {
    expect(matchGoal("React developer")?.slug).toBe("senior-frontend-engineer");
  });

  it("'react native developer' → flutter-rn-developer (longer match beats 'react')", () => {
    expect(matchGoal("react native developer")?.slug).toBe("flutter-rn-developer");
  });

  it("'mern stack' → mern-stack-developer", () => {
    expect(matchGoal("mern stack")?.slug).toBe("mern-stack-developer");
  });

  it("'fullstack' → mern-stack-developer", () => {
    expect(matchGoal("fullstack")?.slug).toBe("mern-stack-developer");
  });

  it("'java full stack developer' → java-full-stack (longer than 'full stack')", () => {
    expect(matchGoal("java full stack developer")?.slug).toBe("java-full-stack");
  });

  it("'java' → java-full-stack", () => {
    expect(matchGoal("java")?.slug).toBe("java-full-stack");
  });

  it("'DevOps' → cloud-devops-engineer", () => {
    expect(matchGoal("DevOps")?.slug).toBe("cloud-devops-engineer");
  });

  it("'kubernetes' → cloud-devops-engineer", () => {
    expect(matchGoal("kubernetes")?.slug).toBe("cloud-devops-engineer");
  });

  it("'devsecops' → devsecops-engineer (not cloud-devops-engineer)", () => {
    expect(matchGoal("devsecops")?.slug).toBe("devsecops-engineer");
  });

  it("'appsec' → devsecops-engineer", () => {
    expect(matchGoal("appsec")?.slug).toBe("devsecops-engineer");
  });

  it("'android' → android-developer", () => {
    expect(matchGoal("android")?.slug).toBe("android-developer");
  });

  it("'kotlin developer' → android-developer", () => {
    expect(matchGoal("kotlin developer")?.slug).toBe("android-developer");
  });

  it("'flutter developer' → flutter-rn-developer", () => {
    expect(matchGoal("flutter developer")?.slug).toBe("flutter-rn-developer");
  });

  it("'dart developer' → flutter-rn-developer", () => {
    expect(matchGoal("dart developer")?.slug).toBe("flutter-rn-developer");
  });

  it("'GenAI' → genai-developer", () => {
    expect(matchGoal("GenAI")?.slug).toBe("genai-developer");
  });

  it("'LLM engineer' → genai-developer", () => {
    expect(matchGoal("LLM engineer")?.slug).toBe("genai-developer");
  });

  it("'TCS NQT' → tcs-nqt-cracker", () => {
    expect(matchGoal("TCS NQT")?.slug).toBe("tcs-nqt-cracker");
  });

  it("'tcs' alone → tcs-nqt-cracker", () => {
    expect(matchGoal("tcs")?.slug).toBe("tcs-nqt-cracker");
  });

  it("'infosys' → infosys-sp-cracker", () => {
    expect(matchGoal("infosys")?.slug).toBe("infosys-sp-cracker");
  });

  it("'cognizant' → service-trio-cracker", () => {
    expect(matchGoal("cognizant")?.slug).toBe("service-trio-cracker");
  });

  it("'capgemini' → service-trio-cracker", () => {
    expect(matchGoal("capgemini")?.slug).toBe("service-trio-cracker");
  });

  it("'gate cse' → gate-cse-cracker", () => {
    expect(matchGoal("gate cse")?.slug).toBe("gate-cse-cracker");
  });

  it("'GATE exam' → gate-cse-cracker", () => {
    expect(matchGoal("GATE exam")?.slug).toBe("gate-cse-cracker");
  });

  it("'embedded' → embedded-iot-engineer", () => {
    expect(matchGoal("embedded")?.slug).toBe("embedded-iot-engineer");
  });

  it("'iot developer' → embedded-iot-engineer", () => {
    expect(matchGoal("iot developer")?.slug).toBe("embedded-iot-engineer");
  });

  it("'game developer' → game-dev-engineer", () => {
    expect(matchGoal("game developer")?.slug).toBe("game-dev-engineer");
  });

  it("'unity developer' → game-dev-engineer", () => {
    expect(matchGoal("unity developer")?.slug).toBe("game-dev-engineer");
  });

  it("'blockchain' → blockchain-engineer", () => {
    expect(matchGoal("blockchain")?.slug).toBe("blockchain-engineer");
  });

  it("'web3 developer' → blockchain-engineer", () => {
    expect(matchGoal("web3 developer")?.slug).toBe("blockchain-engineer");
  });

  it("'solidity developer' → blockchain-engineer", () => {
    expect(matchGoal("solidity developer")?.slug).toBe("blockchain-engineer");
  });

  it("'QA engineer' → qa-sdet-cracker", () => {
    expect(matchGoal("QA engineer")?.slug).toBe("qa-sdet-cracker");
  });

  it("'sdet' → qa-sdet-cracker", () => {
    expect(matchGoal("sdet")?.slug).toBe("qa-sdet-cracker");
  });

  it("'data science' → ml-engineer", () => {
    expect(matchGoal("data science")?.slug).toBe("ml-engineer");
  });

  it("'portfolio builder' → portfolio-builder", () => {
    expect(matchGoal("portfolio builder")?.slug).toBe("portfolio-builder");
  });

  it("'off campus' → off-campus-cracker", () => {
    expect(matchGoal("off campus")?.slug).toBe("off-campus-cracker");
  });

  it("returns an object with both slug and title", () => {
    const result = matchGoal("ml engineer");
    expect(result).not.toBeNull();
    expect(typeof result?.slug).toBe("string");
    expect(typeof result?.title).toBe("string");
    expect(result?.title.length).toBeGreaterThan(5);
  });
});

describe("matchGoal — Hinglish phrasing", () => {
  it("strips 'banna chahta hoon': 'ml engineer banna chahta hoon' → ml-engineer", () => {
    expect(matchGoal("ml engineer banna chahta hoon")?.slug).toBe("ml-engineer");
  });

  it("strips 'mein': 'Amazon mein backend developer' → backend-engineer", () => {
    expect(matchGoal("Amazon mein backend developer")?.slug).toBe("backend-engineer");
  });

  it("strips 'i want to be': 'i want to be a data analyst' → data-analyst-top2", () => {
    expect(matchGoal("i want to be a data analyst")?.slug).toBe("data-analyst-top2");
  });

  it("strips 'i want to be': 'i want to be an android developer' → android-developer", () => {
    expect(matchGoal("i want to be an android developer")?.slug).toBe("android-developer");
  });

  it("strips 'banna chahta': 'frontend banna chahta' → senior-frontend-engineer", () => {
    expect(matchGoal("frontend banna chahta")?.slug).toBe("senior-frontend-engineer");
  });

  it("strips 'main ... chahta': 'main devops engineer banna chahta' → cloud-devops-engineer", () => {
    expect(matchGoal("main devops engineer banna chahta")?.slug).toBe("cloud-devops-engineer");
  });

  it("strips 'become a': 'become a blockchain developer' → blockchain-engineer", () => {
    expect(matchGoal("become a blockchain developer")?.slug).toBe("blockchain-engineer");
  });

  it("handles all-Hinglish-noise 'banna chahta hoon' → null", () => {
    expect(matchGoal("banna chahta hoon")).toBeNull();
  });

  it("'data scientist banna chahti hoon' → ml-engineer", () => {
    expect(matchGoal("data scientist banna chahti hoon")?.slug).toBe("ml-engineer");
  });

  it("'Swiggy mein data engineer' → data-engineer", () => {
    expect(matchGoal("Swiggy mein data engineer")?.slug).toBe("data-engineer");
  });
});

describe("matchGoal — garbage / unrecognized → null", () => {
  it("'asdfgh' → null", () => {
    expect(matchGoal("asdfgh")).toBeNull();
  });

  it("empty string → null", () => {
    expect(matchGoal("")).toBeNull();
  });

  it("only spaces → null", () => {
    expect(matchGoal("   ")).toBeNull();
  });

  it("'xyzzy foo bar' → null", () => {
    expect(matchGoal("xyzzy foo bar")).toBeNull();
  });

  it("numeric garbage '12345' → null", () => {
    expect(matchGoal("12345")).toBeNull();
  });

  it("'!@#$%' → null", () => {
    expect(matchGoal("!@#$%")).toBeNull();
  });

  it("very long garbage → null", () => {
    expect(matchGoal("aaaaaa bbbbbb cccccc dddddd eeeeee")).toBeNull();
  });
});

describe("VALID_SLUGS", () => {
  it("contains exactly 24 slugs", () => {
    expect(VALID_SLUGS.size).toBe(24);
  });

  it("contains all expected slugs", () => {
    const expected = [
      "genai-developer",
      "senior-frontend-engineer",
      "java-full-stack",
      "cloud-devops-engineer",
      "data-analyst-top2",
      "product-company-cracker",
      "service-company-cracker",
      "tcs-nqt-cracker",
      "mern-stack-developer",
      "android-developer",
      "ml-engineer",
      "infosys-sp-cracker",
      "portfolio-builder",
      "data-engineer",
      "qa-sdet-cracker",
      "off-campus-cracker",
      "backend-engineer",
      "flutter-rn-developer",
      "devsecops-engineer",
      "service-trio-cracker",
      "gate-cse-cracker",
      "embedded-iot-engineer",
      "game-dev-engineer",
      "blockchain-engineer",
    ];
    for (const slug of expected) {
      expect(VALID_SLUGS.has(slug), `Expected VALID_SLUGS to contain "${slug}"`).toBe(true);
    }
  });

  it("does not contain unknown slugs", () => {
    expect(VALID_SLUGS.has("fake-roadmap")).toBe(false);
    expect(VALID_SLUGS.has("")).toBe(false);
  });

  it("every matched slug is in VALID_SLUGS", () => {
    const inputs = ["ml engineer", "backend", "frontend", "blockchain", "gate cse"];
    for (const input of inputs) {
      const result = matchGoal(input);
      if (result) {
        expect(VALID_SLUGS.has(result.slug), `Slug "${result.slug}" returned by matchGoal must be in VALID_SLUGS`).toBe(true);
      }
    }
  });
});

describe("GOAL_PREVIEWS", () => {
  it("has a preview for every valid slug", () => {
    for (const slug of VALID_SLUGS) {
      expect(
        GOAL_PREVIEWS[slug],
        `GOAL_PREVIEWS must have an entry for slug "${slug}"`,
      ).toBeTruthy();
    }
  });

  it("every preview is a non-empty string", () => {
    for (const [slug, preview] of Object.entries(GOAL_PREVIEWS)) {
      expect(typeof preview, `Preview for "${slug}" must be a string`).toBe("string");
      expect(preview.length, `Preview for "${slug}" must be non-empty`).toBeGreaterThan(20);
    }
  });
});
