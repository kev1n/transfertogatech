import { describe, it, expect, vi, beforeEach } from "vitest";
import { School } from "@/types/mongo/mongotypes";

// Mock the high-level Oscar API. Each test sets up its own fail/success pattern.
vi.mock("@/lib/gatech/oscar", () => ({
  fetchSubjectsInSchool: vi.fn(),
  fetchEquivalencies: vi.fn(),
}));

import * as oscar from "@/lib/gatech/oscar";
import { scrapeSchoolEquivalencies } from "@/lib/crawl/scrapeSchool";

const fetchSubjects = oscar.fetchSubjectsInSchool as unknown as ReturnType<
  typeof vi.fn
>;
const fetchEquivs = oscar.fetchEquivalencies as unknown as ReturnType<
  typeof vi.fn
>;

const SCHOOL: School = { id: "001", name: "Test U", state: "GA" };

beforeEach(() => {
  fetchSubjects.mockReset();
  fetchEquivs.mockReset();
});

describe("scrapeSchoolEquivalencies retry behavior", () => {
  it("returns immediately when the scrape succeeds first try", async () => {
    fetchSubjects.mockResolvedValue({
      subjects: ["MAT"],
      levels: [],
      terms: [{ id: "202608", name: "Fall 2026" }],
    });
    fetchEquivs.mockResolvedValue([
      {
        className: "MAT 101",
        title: "Calc",
        level: "LD",
        minimumGrade: "C",
        gaEquivalent: "MATH 1551",
        gaEquivalentTitle: "Calc 1",
        creditHours: "3.0",
      },
    ]);

    const result = await scrapeSchoolEquivalencies(SCHOOL, {
      sleep: vi.fn(),
    });
    expect(result.equivalents).toHaveLength(1);
    expect(result.term).toBe("202608");
    expect(fetchSubjects).toHaveBeenCalledTimes(1);
  });

  it("retries on transient failure and eventually succeeds", async () => {
    fetchSubjects
      .mockRejectedValueOnce(new Error("ECONNRESET"))
      .mockRejectedValueOnce(new Error("502 Bad Gateway"))
      .mockResolvedValue({
        subjects: ["MAT"],
        levels: [],
        terms: [{ id: "202608", name: "Fall 2026" }],
      });
    fetchEquivs.mockResolvedValue([]);

    const sleep = vi.fn().mockResolvedValue(undefined);
    const result = await scrapeSchoolEquivalencies(SCHOOL, {
      sleep,
      jitter: false,
      initialDelayMs: 10,
      maxAttempts: 5,
    });
    expect(result.term).toBe("202608");
    expect(fetchSubjects).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenCalledTimes(2);
  });

  it("exhausts attempts and throws when Oscar keeps failing", async () => {
    fetchSubjects.mockRejectedValue(new Error("Oscar down"));
    const sleep = vi.fn().mockResolvedValue(undefined);

    await expect(
      scrapeSchoolEquivalencies(SCHOOL, {
        sleep,
        jitter: false,
        initialDelayMs: 1,
        maxAttempts: 3,
      })
    ).rejects.toThrow("Oscar down");

    expect(fetchSubjects).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenCalledTimes(2);
  });

  it("throws when no terms are returned (rather than indexing undefined)", async () => {
    fetchSubjects.mockResolvedValue({
      subjects: [],
      levels: [],
      terms: [],
    });

    await expect(
      scrapeSchoolEquivalencies(SCHOOL, {
        sleep: vi.fn(),
        jitter: false,
        initialDelayMs: 1,
        maxAttempts: 1,
      })
    ).rejects.toThrow(/No terms/);
  });
});
