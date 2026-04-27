import { describe, it, expect } from "vitest";
import { Class } from "@/types/mongo/mongotypes";
import { groupByCoreArea } from "@/lib/matching/groupByCoreArea";

function mkClass(gaEquivalent: string, extra: Partial<Class> = {}): Class {
  return {
    className: "FOO 1234",
    title: "",
    level: "LD",
    minimumGrade: "C",
    gaEquivalent,
    gaEquivalentTitle: "",
    creditHours: "3.0",
    ...extra,
  };
}

describe("groupByCoreArea", () => {
  it("returns empty groups for empty input", () => {
    const result = groupByCoreArea([]);
    expect(Object.keys(result).length).toBeGreaterThan(0);
    for (const courses of Object.values(result)) {
      expect(courses).toEqual([]);
    }
  });

  it("bins ENGL 1101 into Core Area A1", () => {
    const result = groupByCoreArea([mkClass("ENGL 1101")]);
    expect(result["Core Area A1: Communication Outcomes"]).toHaveLength(1);
  });

  it("bins MATH 1552 into Core Area A2", () => {
    const result = groupByCoreArea([mkClass("MATH 1552")]);
    expect(result["Core Area A2: Quantitative Outcomes"]).toHaveLength(1);
  });

  it("bins APPH 1040 into Wellness", () => {
    const result = groupByCoreArea([mkClass("APPH 1040")]);
    expect(result["Wellness"]).toHaveLength(1);
  });

  it("ignores a ga equivalent that matches no core area", () => {
    const result = groupByCoreArea([mkClass("ZZZZ 9999")]);
    for (const courses of Object.values(result)) {
      expect(courses).toEqual([]);
    }
  });
});
