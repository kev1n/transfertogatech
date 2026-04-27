import { describe, it, expect } from "vitest";
import { normalizeCourseCode } from "@/lib/matching/normalize";

describe("normalizeCourseCode", () => {
  it("removes spaces and lowercases", () => {
    expect(normalizeCourseCode("MATH 1551")).toBe("math1551");
  });

  it("collapses multiple spaces (including non-breaking)", () => {
    expect(normalizeCourseCode("MATH  1551")).toBe("math1551");
    expect(normalizeCourseCode("ENGL  1101")).toBe("engl1101");
  });

  it("handles tabs and newlines", () => {
    expect(normalizeCourseCode("CS\t1301\n")).toBe("cs1301");
  });

  it("leaves already-normalized input alone", () => {
    expect(normalizeCourseCode("math1552")).toBe("math1552");
  });
});
