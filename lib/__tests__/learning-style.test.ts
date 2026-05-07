import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

// We unit-test the pure shape/percentage logic by stubbing the DB layer.
// The real `computeLearningStyle` queries Drizzle; here we exercise the
// branching + percentage math after a fixed row payload.

vi.mock("@/lib/env", () => ({ hasDatabase: true }));

const dbStub = {
  selectChain: {
    select: vi.fn(),
  },
};

vi.mock("@/lib/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          orderBy: () => ({
            limit: () => dbStub.selectChain.select(),
          }),
        }),
      }),
    }),
  },
}));

import { computeLearningStyle } from "@/lib/learning-style";

const meta = (format: string) => ({ metadata: JSON.stringify({ format }) });

beforeEach(() => {
  dbStub.selectChain.select.mockReset();
});
afterEach(() => {
  vi.clearAllMocks();
});

describe("computeLearningStyle", () => {
  it("returns null when there are fewer than 5 valid samples", async () => {
    dbStub.selectChain.select.mockResolvedValue([
      meta("slides"),
      meta("read"),
    ]);
    const result = await computeLearningStyle("u1");
    expect(result).toBeNull();
  });

  it("returns null when every row has malformed metadata", async () => {
    dbStub.selectChain.select.mockResolvedValue([
      { metadata: "{not-json" },
      { metadata: null },
      { metadata: JSON.stringify({ format: "rocket-ship" }) },
    ]);
    expect(await computeLearningStyle("u1")).toBeNull();
  });

  it("aggregates counts + percentages over a 10-row sample", async () => {
    dbStub.selectChain.select.mockResolvedValue([
      ...Array(6).fill(meta("slides")),
      ...Array(2).fill(meta("read")),
      ...Array(1).fill(meta("mindmap")),
      ...Array(1).fill(meta("flashcards")),
    ]);
    const result = await computeLearningStyle("u1");
    expect(result).not.toBeNull();
    expect(result!.total).toBe(10);
    expect(result!.counts).toEqual({
      read: 2,
      slides: 6,
      mindmap: 1,
      flashcards: 1,
    });
    // 6/10 = 60, 2/10 = 20, 1/10 = 10, 1/10 = 10. Sum = 100 exactly.
    expect(result!.percentages).toEqual({
      read: 20,
      slides: 60,
      mindmap: 10,
      flashcards: 10,
    });
    expect(result!.dominant).toBe("slides");
  });

  it("rounds remainder onto the dominant format so percentages always sum to 100", async () => {
    // 7/3 split — 7÷3=2.33, 3÷3=1.0, percentages would floor to 70 / 16 / 16 / 0
    // Wait — 7+3+3+3 = 16; 7/16 = 43.75 → 43, 3/16 = 18.75 → 18 (×3 = 54)
    // Total assigned: 43 + 18 + 18 + 18 = 97. Remainder 3 → goes to dominant (slides).
    dbStub.selectChain.select.mockResolvedValue([
      ...Array(7).fill(meta("slides")),
      ...Array(3).fill(meta("read")),
      ...Array(3).fill(meta("mindmap")),
      ...Array(3).fill(meta("flashcards")),
    ]);
    const result = await computeLearningStyle("u1");
    expect(result).not.toBeNull();
    const sum =
      result!.percentages.read +
      result!.percentages.slides +
      result!.percentages.mindmap +
      result!.percentages.flashcards;
    expect(sum).toBe(100);
    expect(result!.dominant).toBe("slides");
    // The dominant absorbed the remainder, so its % > floor(7/16 * 100) = 43.
    expect(result!.percentages.slides).toBeGreaterThan(43);
  });

  it("ignores rows for unknown format values", async () => {
    dbStub.selectChain.select.mockResolvedValue([
      ...Array(6).fill(meta("slides")),
      meta("audio"), // unknown — must not break aggregation
      meta("video"),
      meta("read"),
      meta("read"),
    ]);
    const result = await computeLearningStyle("u1");
    expect(result).not.toBeNull();
    // 6 slides + 2 read = 8 valid samples; the audio/video rows dropped.
    expect(result!.total).toBe(8);
    expect(result!.counts.read).toBe(2);
    expect(result!.counts.slides).toBe(6);
  });
});
