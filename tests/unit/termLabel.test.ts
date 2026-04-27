import { describe, it, expect } from "vitest";
import { formatTermLabel } from "@/lib/planner/termLabel";

describe("formatTermLabel", () => {
  it("decodes well-formed Banner term IDs", () => {
    expect(formatTermLabel("202608")).toBe("Fall 2026");
    expect(formatTermLabel("202402")).toBe("Spring 2024");
    expect(formatTermLabel("202005")).toBe("Summer 2020");
  });

  it("falls back gracefully for unknown semester codes", () => {
    expect(formatTermLabel("202099")).toBe("Term 202099");
  });

  it("returns the raw value for non-conformant strings", () => {
    expect(formatTermLabel("garbage")).toBe("garbage");
  });

  it("handles undefined/empty", () => {
    expect(formatTermLabel(undefined)).toBe("Unknown term");
    expect(formatTermLabel("")).toBe("Unknown term");
  });
});
