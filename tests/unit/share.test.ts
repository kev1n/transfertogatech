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
      credits: 3,
    },
    "MATH:MATH 1552": {
      kind: "ap",
      examId: "ap-calc-bc",
      score: 5,
      gtCourse: "MATH 1552",
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
});
