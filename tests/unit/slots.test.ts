import { describe, it, expect } from "vitest";
import { buildSlots, groupSlotsBySubject, gtCoursesForSlot } from "@/lib/planner/slots";

describe("buildSlots", () => {
  it("expands AND requirements into one slot per course", () => {
    const slots = buildSlots({
      ENGLISH: { AND: ["ENGL 1101", "ENGL 1102"] },
    });
    expect(slots).toHaveLength(2);
    expect(slots[0]).toMatchObject({ kind: "single", gtCourse: "ENGL 1101" });
    expect(slots[1]).toMatchObject({ kind: "single", gtCourse: "ENGL 1102" });
  });

  it("collapses OR requirements into a single choose-one slot", () => {
    const slots = buildSlots({
      CS: { OR: ["CS 1301", "CS 1371"] },
    });
    expect(slots).toHaveLength(1);
    expect(slots[0]).toMatchObject({
      kind: "choose-one",
      options: ["CS 1301", "CS 1371"],
    });
  });

  it("uses the lab label for LAB1/LAB2 OR requirements", () => {
    const slots = buildSlots({
      LAB1: { OR: ["CHEM 1211K", "BIOS 1107"] },
    });
    expect(slots[0].kind).toBe("choose-one");
    if (slots[0].kind === "choose-one") {
      expect(slots[0].label).toMatch(/CHEM, BIO, PHYS/);
    }
  });

  it("slot keys are stable + unique within a major", () => {
    const slots = buildSlots({
      ENGLISH: { AND: ["ENGL 1101", "ENGL 1102"] },
      CS: { OR: ["CS 1301", "CS 1371"] },
    });
    const keys = slots.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("groupSlotsBySubject", () => {
  it("preserves first-seen subject order", () => {
    const slots = buildSlots({
      ENGLISH: { AND: ["ENGL 1101"] },
      MATH: { AND: ["MATH 1551"] },
      CS: { OR: ["CS 1301"] },
    });
    const groups = groupSlotsBySubject(slots);
    expect(groups.map((g) => g.subject)).toEqual(["ENGLISH", "MATH", "CS"]);
  });
});

describe("gtCoursesForSlot", () => {
  it("returns the single course for single slots", () => {
    const [slot] = buildSlots({ MATH: { AND: ["MATH 1551"] } });
    expect(gtCoursesForSlot(slot)).toEqual(["MATH 1551"]);
  });

  it("returns all options for choose-one slots", () => {
    const [slot] = buildSlots({ CS: { OR: ["CS 1301", "CS 1371"] } });
    expect(gtCoursesForSlot(slot)).toEqual(["CS 1301", "CS 1371"]);
  });
});
