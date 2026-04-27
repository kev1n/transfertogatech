import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { parseEquivalencies } from "@/lib/gatech/oscar/parseEquivalencies";

const fixturePath = path.resolve(
  __dirname,
  "../fixtures/oscar_equivalents_berry.html"
);

describe("parseEquivalencies (Berry College fixture)", () => {
  it("parses rows from the datadisplaytable", () => {
    const html = fs.readFileSync(fixturePath, "utf-8");
    const classes = parseEquivalencies(html);
    expect(classes.length).toBeGreaterThan(0);
  });

  it("every row has a className and gaEquivalent", () => {
    const html = fs.readFileSync(fixturePath, "utf-8");
    const classes = parseEquivalencies(html);
    for (const c of classes) {
      expect(c.className).toBeTruthy();
      expect(c.gaEquivalent).toBeTruthy();
    }
  });

  it("continuation rows extend the previous class with a different GT equivalent", () => {
    const html = fs.readFileSync(fixturePath, "utf-8");
    const classes = parseEquivalencies(html);

    // If a class appears twice, the second occurrence should be a continuation
    // (same className, same title, different gaEquivalent).
    const countsByClassName = classes.reduce<Record<string, number>>(
      (acc, c) => {
        acc[c.className] = (acc[c.className] ?? 0) + 1;
        return acc;
      },
      {}
    );
    const duplicates = Object.entries(countsByClassName).filter(
      ([, n]) => n > 1
    );

    if (duplicates.length === 0) return; // nothing to assert if no continuations

    const [dupName] = duplicates[0];
    const instances = classes.filter((c) => c.className === dupName);
    const equivalents = new Set(instances.map((c) => c.gaEquivalent));
    // Each continuation must widen the gaEquivalent set
    expect(equivalents.size).toBe(instances.length);
  });

  it("returns [] for HTML with no datadisplaytable", () => {
    expect(parseEquivalencies("<html></html>")).toEqual([]);
  });
});
