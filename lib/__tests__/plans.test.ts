import { describe, expect, it } from "vitest";
import { PLANS, planMeets, type PlanId } from "@/lib/plans";

describe("PLANS registry", () => {
  it("has free / pro / career entries with sane prices", () => {
    expect(PLANS.free.pricePaise).toBe(0);
    expect(PLANS.pro.pricePaise).toBeGreaterThan(0);
    expect(PLANS.career.pricePaise).toBeGreaterThan(PLANS.pro.pricePaise);
  });

  it("each plan id matches its key", () => {
    (Object.keys(PLANS) as PlanId[]).forEach((id) => {
      expect(PLANS[id].id).toBe(id);
    });
  });
});

describe("planMeets — gating helper", () => {
  it("free user meets only free", () => {
    expect(planMeets("free", "free")).toBe(true);
    expect(planMeets("free", "pro")).toBe(false);
    expect(planMeets("free", "career")).toBe(false);
  });

  it("pro user meets free + pro but not career", () => {
    expect(planMeets("pro", "free")).toBe(true);
    expect(planMeets("pro", "pro")).toBe(true);
    expect(planMeets("pro", "career")).toBe(false);
  });

  it("career user meets every tier", () => {
    expect(planMeets("career", "free")).toBe(true);
    expect(planMeets("career", "pro")).toBe(true);
    expect(planMeets("career", "career")).toBe(true);
  });
});
