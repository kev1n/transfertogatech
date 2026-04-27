import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { parseStates } from "@/lib/gatech/oscar/parseStates";

const fixturePath = path.resolve(__dirname, "../fixtures/oscar_states.html");

describe("parseStates", () => {
  it("extracts state codes from an Oscar states page fixture", () => {
    const html = fs.readFileSync(fixturePath, "utf-8");
    const states = parseStates(html);
    expect(states).toContain("GA");
    expect(states).toContain("CA");
    expect(states.length).toBeGreaterThan(10);
  });

  it("returns [] for empty HTML", () => {
    expect(parseStates("")).toEqual([]);
  });
});
