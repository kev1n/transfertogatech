import { describe, it, expect } from "vitest";
import { Class } from "@/types/mongo/mongotypes";
import { groupByDepartment } from "@/lib/matching/groupByDepartment";

function mkClass(
  className: string,
  creditHours = "3.0",
  extra: Partial<Class> = {}
): Class {
  return {
    className,
    title: "",
    level: "LD",
    minimumGrade: "C",
    gaEquivalent: "GT 1000",
    gaEquivalentTitle: "",
    creditHours,
    ...extra,
  };
}

describe("groupByDepartment", () => {
  it("groups by department prefix", () => {
    const result = groupByDepartment([
      mkClass("MATH 1501"),
      mkClass("MATH 1502"),
      mkClass("CS 1301"),
    ]);
    expect(result.MATH).toHaveLength(2);
    expect(result.CS).toHaveLength(1);
  });

  it("splits on the non-breaking space Oscar injects", () => {
    //   is what Oscar actually emits
    const result = groupByDepartment([mkClass("BIOS 1107")]);
    expect(result.BIOS).toHaveLength(1);
  });

  it("drops 0-credit placeholder entries", () => {
    const result = groupByDepartment([
      mkClass("MATH 1501", "3.0"),
      mkClass("MATH 9999", "0.0"),
    ]);
    expect(result.MATH).toHaveLength(1);
  });

  it("returns {} for undefined input", () => {
    expect(groupByDepartment(undefined)).toEqual({});
  });
});
