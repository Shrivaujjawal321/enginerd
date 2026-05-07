/**
 *  Plan registry — single source of truth for what a user gets at each tier.
 *
 *  Pricing follows the market analyst panel review's Indian-market thesis:
 *    • Free        — content + DSA practice + dashboards
 *    • Pro ₹299    — AI mentor, mock interviews, all roadmaps, certificates
 *    • Career ₹2,499 — Pro + verified mentor sessions, MNC apply, recruiter inbox
 *
 *  Pricing in PAISE (1 INR = 100 paise) to avoid float math.
 */

export type PlanId = "free" | "pro" | "career";

export type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  pricePaise: number;
  /** "monthly" or "annual" — Phase 9.5 will add annual variants. */
  interval: "free" | "monthly";
  features: string[];
  highlights: string[];
  popular?: boolean;
};

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    tagline: "Build the foundation. Free, forever.",
    pricePaise: 0,
    interval: "free",
    features: [
      "All 6 roadmaps (read-only)",
      "459 original DSA problems",
      "JavaScript + Python auto-grading",
      "1 cohort per week",
      "Community feedback",
    ],
    highlights: [],
  },
  pro: {
    id: "pro",
    name: "Pro",
    tagline: "Get unstuck in 24 hours. Every concept, AI-mentored.",
    pricePaise: 29900, // ₹299
    interval: "monthly",
    popular: true,
    features: [
      "Everything in Free",
      "AI mentor (Hinglish, Claude-powered)",
      "Java + C++ + Go server-side grading",
      "Unlimited cohort joins",
      "Earn verified completion certificates",
      "Priority response on the helpful widget",
    ],
    highlights: ["AI mentor", "Certificates"],
  },
  career: {
    id: "career",
    name: "Career",
    tagline: "Land the offer. Mentors, mocks, and 1-click MNC apply.",
    pricePaise: 249900, // ₹2,499
    interval: "monthly",
    features: [
      "Everything in Pro",
      "4 verified mentor sessions / month (₹2k value each)",
      "1-click MNC application via JobAgent",
      "Recruiter inbox (top-decile learners only)",
      "12 mock interview credits / month",
      "Resume + LinkedIn audit by an industry SDE",
    ],
    highlights: ["Mentor sessions", "Mock interviews", "Recruiter inbox"],
  },
};

export function planById(id: string): Plan | null {
  return id in PLANS ? PLANS[id as PlanId] : null;
}

export function isPaidPlan(id: PlanId): boolean {
  return id !== "free";
}

/**
 * Plan precedence for gating. `requirePlan(user, "pro")` should match users
 * on `pro` *or* `career`. This helper makes that explicit.
 */
const PLAN_RANK: Record<PlanId, number> = { free: 0, pro: 1, career: 2 };

export function planMeets(actual: PlanId, required: PlanId): boolean {
  return PLAN_RANK[actual] >= PLAN_RANK[required];
}
