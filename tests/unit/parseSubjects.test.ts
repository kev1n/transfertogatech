import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { parseSubjects } from "@/lib/gatech/oscar/parseSubjects";

const fixturePath = path.resolve(
  __dirname,
  "../fixtures/oscar_subjects_berry.html"
);

describe("parseSubjects", () => {
  it("extracts subjects, levels, and terms from a real Oscar response", () => {
    const html = fs.readFileSync(fixturePath, "utf-8");
    const { subjects, levels, terms } = parseSubjects(html);

    expect(subjects).toContain("ACC");
    expect(subjects.length).toBeGreaterThan(5);

    // Levels filter keeps only US/GS with matching names
    for (const level of levels) {
      expect(["GS", "US"]).toContain(level.id);
      expect(["Graduate", "Undergraduate"]).toContain(level.name);
    }

    // Terms always have id + name
    expect(terms.length).toBeGreaterThan(0);
    expect(terms[0].id).toBeTruthy();
    expect(terms[0].name).toBeTruthy();
  });
});
