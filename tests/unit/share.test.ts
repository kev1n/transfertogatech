import { describe, it, expect } from "vitest";
import { encodeShare, decodeShare, SharePayload } from "@/lib/share/encode";

const sample: SharePayload = {
  school: { value: "005059", label: "Berry College" },
  major: { value: "Computer Science", label: "Computer Science" },
  picks: {
    "ENGLISH:ENGL 1101": {
      kind: "transfer",
      sourceCode: "ENG 101",
      sourceTitle: "English Composition I",
      gtCourse: "ENGL 1101",
      gtTitle: "English Composition I",
      credits: 3,
    },
    "MATH:MATH 1552": {
      kind: "ap",
      examId: "ap-calc-bc",
      score: 5,
      gtCourse: "MATH 1552",
      gtTitle: "Integral Calculus",
      credits: 4,
    },
  },
};

describe("share encode/decode", () => {
  it("round-trips a full payload", () => {
    const encoded = encodeShare(sample);
    const decoded = decodeShare(encoded);
    expect(decoded).toEqual(sample);
  });

  it("starts with version tag '1.'", () => {
    expect(encodeShare(sample).startsWith("1.")).toBe(true);
  });

  it("compressed length is shorter than naive JSON", () => {
    const encoded = encodeShare(sample);
    const naive = encodeURIComponent(JSON.stringify(sample));
    expect(encoded.length).toBeLessThan(naive.length);
  });

  it("returns null for malformed input", () => {
    expect(decodeShare("")).toBeNull();
    expect(decodeShare("not-a-share")).toBeNull();
    expect(decodeShare("99.gibberish")).toBeNull();
  });

  it("preserves slot keys with colons in them", () => {
    const decoded = decodeShare(encodeShare(sample));
    expect(decoded?.picks).toHaveProperty("ENGLISH:ENGL 1101");
    expect(decoded?.picks).toHaveProperty("MATH:MATH 1552");
  });

  it("decodes legacy 5-element picks (gtTitle absent → empty string)", () => {
    // Hand-craft a v1 payload with the OLD encoding (no gtTitle).
    const LZ = require("lz-string");
    const legacy = {
      v: 1,
      sv: "001",
      sl: "Old School",
      mv: "Computer Science",
      ml: "Computer Science",
      p: {
        "ENGLISH:ENGL 1101": ["t", "ENG 101", "English Comp", "ENGL 1101", 3],
        "MATH:MATH 1552": ["a", "ap-calc-bc", 5, "MATH 1552", 4],
      },
    };
    const encoded = "1." + LZ.compressToEncodedURIComponent(JSON.stringify(legacy));
    const decoded = decodeShare(encoded);
    expect(decoded?.picks["ENGLISH:ENGL 1101"]).toMatchObject({
      kind: "transfer",
      sourceCode: "ENG 101",
      gtCourse: "ENGL 1101",
      gtTitle: "",
      credits: 3,
    });
    expect(decoded?.picks["MATH:MATH 1552"]).toMatchObject({
      kind: "ap",
      examId: "ap-calc-bc",
      score: 5,
      gtCourse: "MATH 1552",
      gtTitle: "",
      credits: 4,
    });
  });
});
