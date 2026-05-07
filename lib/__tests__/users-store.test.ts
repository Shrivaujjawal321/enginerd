import { describe, expect, it } from "vitest";
import {
  isValidHandle,
  isReservedHandle,
  normaliseHandle,
} from "@/lib/users-store";

describe("normaliseHandle", () => {
  it("lowercases and trims whitespace", () => {
    expect(normaliseHandle("  Foo-Bar  ")).toBe("foo-bar");
    expect(normaliseHandle("UJJWAL")).toBe("ujjwal");
  });
});

describe("isValidHandle", () => {
  it("accepts standard alnum + dash + underscore handles", () => {
    expect(isValidHandle("ujjwal")).toBe(true);
    expect(isValidHandle("ujjwal-shrivastava")).toBe(true);
    expect(isValidHandle("user_123")).toBe(true);
    expect(isValidHandle("a1b")).toBe(true); // exactly 3 chars
  });

  it("rejects too-short handles (< 3 chars)", () => {
    expect(isValidHandle("ab")).toBe(false);
    expect(isValidHandle("a")).toBe(false);
    expect(isValidHandle("")).toBe(false);
  });

  it("rejects too-long handles (> 24 chars)", () => {
    expect(isValidHandle("a".repeat(25))).toBe(false);
  });

  it("rejects handles starting with non-alnum", () => {
    expect(isValidHandle("-foo")).toBe(false);
    expect(isValidHandle("_foo")).toBe(false);
  });

  it("rejects handles with disallowed characters", () => {
    expect(isValidHandle("foo bar")).toBe(false); // space
    expect(isValidHandle("foo.bar")).toBe(false); // dot
    expect(isValidHandle("foo@bar")).toBe(false); // @
    expect(isValidHandle("foo/bar")).toBe(false); // slash
  });

  it("normalises before validating (case-insensitive)", () => {
    expect(isValidHandle("UJJWAL")).toBe(true);
    expect(isValidHandle("MixedCase")).toBe(true);
  });
});

describe("isReservedHandle", () => {
  it("flags route-conflict handles", () => {
    expect(isReservedHandle("admin")).toBe(true);
    expect(isReservedHandle("api")).toBe(true);
    expect(isReservedHandle("billing")).toBe(true);
    expect(isReservedHandle("login")).toBe(true);
    expect(isReservedHandle("u")).toBe(true);
  });

  it("is case-insensitive", () => {
    expect(isReservedHandle("ADMIN")).toBe(true);
    expect(isReservedHandle("API")).toBe(true);
  });

  it("allows non-reserved handles", () => {
    expect(isReservedHandle("ujjwal")).toBe(false);
    expect(isReservedHandle("hellouser")).toBe(false);
  });
});
