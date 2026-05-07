import { describe, expect, it } from "vitest";
import { formatINR, formatDate, formatDateTime } from "@/lib/format";

describe("formatINR", () => {
  it("formats whole rupees without decimals", () => {
    expect(formatINR(29900)).toBe("₹299");
    expect(formatINR(0)).toBe("₹0");
  });

  it("formats large amounts with Indian comma grouping", () => {
    // ₹1,23,456 — Indian style, not ₹123,456
    expect(formatINR(12_345_600)).toBe("₹1,23,456");
    expect(formatINR(249900)).toBe("₹2,499");
  });

  it("formats fractional rupees with two decimals", () => {
    expect(formatINR(29950)).toBe("₹299.50");
    expect(formatINR(101)).toBe("₹1.01");
  });
});

describe("formatDate", () => {
  it("returns em-dash for null/undefined", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate(undefined)).toBe("—");
  });

  it("formats a real Date in en-IN", () => {
    const d = new Date("2026-05-02T10:00:00Z");
    const out = formatDate(d);
    // Format may include "May 2026" and "2"; assert substring presence
    // rather than exact spacing (locale ICU output can drift).
    expect(out).toMatch(/2026/);
    expect(out).toMatch(/May/);
  });
});

describe("formatDateTime", () => {
  it("includes both date + time components", () => {
    const out = formatDateTime(new Date("2026-05-02T18:42:00Z"));
    expect(out).toMatch(/2026/);
    expect(out).toMatch(/(am|pm|AM|PM)/);
  });
});
