import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { parseSchools } from "@/lib/gatech/oscar/parseSchools";

const fixturePath = path.resolve(__dirname, "../fixtures/oscar_schools_GA.html");

describe("parseSchools", () => {
  it("extracts schools with id, name, and the passed-in state", () => {
    const html = fs.readFileSync(fixturePath, "utf-8");
    const schools = parseSchools(html, "GA");
    expect(schools.length).toBeGreaterThan(20);

    const berry = schools.find((s) => s.name === "Berry College");
    expect(berry).toBeDefined();
    expect(berry?.id).toBe("005059");
    expect(berry?.state).toBe("GA");
  });

  it("returns [] for empty HTML", () => {
    expect(parseSchools("", "GA")).toEqual([]);
  });
});
