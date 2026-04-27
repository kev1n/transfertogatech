import { describe, it, expect } from "vitest";
import { Class } from "@/types/mongo/mongotypes";
import {
  matchesCourse,
  filterByCourse,
  filterByAnyCourse,
  resolveRequirement,
} from "@/lib/matching/matchRequirement";

function mkClass(gaEquivalent: string, overrides: Partial<Class> = {}): Class {
  return {
    className: "FOO 1234",
    title: "Some Class",
    level: "LD",
    minimumGrade: "C",
    gaEquivalent,
    gaEquivalentTitle: "GT class",
    creditHours: "3.0",
    ...overrides,
  };
}

describe("matchesCourse", () => {
  it("matches by normalized code", () => {
    expect(matchesCourse(mkClass("MATH 1551"), "MATH 1551")).toBe(true);
  });

  it("matches despite weird scraped whitespace", () => {
    expect(matchesCourse(mkClass("MATH  1551"), "MATH 1551")).toBe(true);
  });

  it("MATH 1552 also matches MATH 1X52 and MATH 15X2 wildcards", () => {
    expect(matchesCourse(mkClass("MATH 1X52"), "MATH 1552")).toBe(true);
    expect(matchesCourse(mkClass("MATH 15X2"), "MATH 1552")).toBe(true);
    expect(matchesCourse(mkClass("MATH 1552"), "MATH 1552")).toBe(true);
  });

  it("does not wildcard-match other MATH courses", () => {
    expect(matchesCourse(mkClass("MATH 1X51"), "MATH 1551")).toBe(false);
  });
});

describe("filterByAnyCourse (OR)", () => {
  it("includes any equivalent mapping to any target course", () => {
    const equivalents = [
      mkClass("CHEM 1211K"),
      mkClass("CHEM 1310"),
      mkClass("BIOS 1107"),
    ];
    const result = filterByAnyCourse(equivalents, ["CHEM 1211K", "CHEM 1310"]);
    expect(result).toHaveLength(2);
  });

  it("returns [] for no matches", () => {
    expect(filterByAnyCourse([mkClass("CS 1301")], ["MATH 1551"])).toEqual([]);
  });
});

describe("resolveRequirement", () => {
  it("splits AND into one entry per GT course", () => {
    const req = { AND: ["ENGL 1101", "ENGL 1102"] };
    const resolved = resolveRequirement(req, [mkClass("ENGL 1101")]);
    expect(resolved).toHaveLength(2);
    expect(resolved[0].kind).toBe("single");
    expect(resolved[0].label).toBe("ENGL 1101");
    expect(resolved[0].matches).toHaveLength(1);
    expect(resolved[1].matches).toHaveLength(0);
  });

  it("collapses OR into one 'any' entry", () => {
    const req = { OR: ["BIOS 1107", "BIOS 1108"] };
    const resolved = resolveRequirement(req, [mkClass("BIOS 1107")]);
    expect(resolved).toHaveLength(1);
    expect(resolved[0].kind).toBe("any");
    expect(resolved[0].label).toBe("BIOS 1107 OR BIOS 1108");
  });

  it("returns [] for an empty requirement", () => {
    expect(resolveRequirement({}, [])).toEqual([]);
  });
});

describe("filterByCourse with MATH 1552 wildcard", () => {
  it("picks up all three aliases", () => {
    const equivalents = [
      mkClass("MATH 1552"),
      mkClass("MATH 1X52"),
      mkClass("MATH 15X2"),
      mkClass("MATH 1551"),
    ];
    expect(filterByCourse(equivalents, "MATH 1552")).toHaveLength(3);
  });
});
