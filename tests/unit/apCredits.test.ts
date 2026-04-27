import { describe, it, expect } from "vitest";
import {
  AP_EXAMS,
  apExamsThatGrant,
  findAPExam,
  pickGrantForScore,
} from "@/assets/gatech/apCredits";

describe("AP credit tables", () => {
  it("AP Calculus BC at score 4+ grants both MATH 1551 and MATH 1552", () => {
    const exam = findAPExam("ap-calc-bc")!;
    expect(exam).toBeDefined();
    const grant = pickGrantForScore(exam, 4);
    expect(grant?.courses).toEqual(["MATH 1551", "MATH 1552"]);
  });

  it("AP Chemistry at score 5 grants the higher tier (CHEM 1310)", () => {
    const exam = findAPExam("ap-chem")!;
    const grant5 = pickGrantForScore(exam, 5);
    expect(grant5?.courses).toEqual(["CHEM 1310"]);
    const grant4 = pickGrantForScore(exam, 4);
    expect(grant4?.courses).toEqual(["CHEM 1211K"]);
  });

  it("apExamsThatGrant finds all AP exams that satisfy a GT course", () => {
    const grants = apExamsThatGrant("MATH 1551");
    const ids = grants.map((g) => g.exam.id).sort();
    expect(ids).toEqual(["ap-calc-ab", "ap-calc-bc"].sort());
  });

  it("returns undefined for sub-threshold scores", () => {
    const exam = findAPExam("ap-calc-ab")!;
    expect(pickGrantForScore(exam, 3)).toBeUndefined();
  });

  it("every exam has at least one grant", () => {
    for (const exam of AP_EXAMS) {
      expect(exam.grants.length).toBeGreaterThan(0);
      for (const g of exam.grants) {
        expect([3, 4, 5]).toContain(g.score);
        expect(g.courses.length).toBeGreaterThan(0);
      }
    }
  });
});
