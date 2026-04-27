/**
 * Live smoke test: hits oscar.gatech.edu directly. Network-dependent, so
 * skipped by default. Run explicitly with:
 *   RUN_LIVE=1 npx vitest run tests/integration/oscarLive.test.ts
 */
import { describe, it, expect } from "vitest";
import {
  fetchStates,
  fetchSchoolsInState,
  fetchSubjectsInSchool,
  fetchEquivalencies,
} from "@/lib/gatech/oscar";

const live = process.env.RUN_LIVE === "1" ? describe : describe.skip;

live("Oscar live", () => {
  it("fetchStates returns at least 50 entries including GA", async () => {
    const states = await fetchStates();
    expect(states.length).toBeGreaterThan(50);
    expect(states).toContain("GA");
  }, 30000);

  it("fetchSchoolsInState('GA') returns Berry College (005059)", async () => {
    const schools = await fetchSchoolsInState("GA");
    expect(schools.length).toBeGreaterThan(20);
    const berry = schools.find((s) => s.id === "005059");
    expect(berry?.name).toBe("Berry College");
  }, 30000);

  it("fetchSubjectsInSchool('GA', '005059') returns subjects + a term", async () => {
    const result = await fetchSubjectsInSchool("GA", "005059");
    expect(result.subjects.length).toBeGreaterThan(0);
    expect(result.terms.length).toBeGreaterThan(0);
  }, 30000);

  it("fetchEquivalencies for Berry returns ≥1 mapped class", async () => {
    const { subjects, terms } = await fetchSubjectsInSchool("GA", "005059");
    const equivalencies = await fetchEquivalencies(
      "GA",
      "005059",
      subjects,
      terms[0].id
    );
    expect(equivalencies.length).toBeGreaterThan(0);
    for (const c of equivalencies) {
      expect(c.className).toBeTruthy();
      expect(c.gaEquivalent).toBeTruthy();
    }
  }, 60000);
});
