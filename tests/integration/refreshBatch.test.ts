import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  vi,
} from "vitest";
import { MongoClient } from "mongodb";
import { startTestMongo, TestMongo } from "./mongoHelpers";
import { TRANSFER_DB, Collections } from "@/lib/mongo/collections";
import { School } from "@/types/mongo/mongotypes";

vi.mock("@/lib/gatech/oscar", () => ({
  fetchSchoolsInState: vi.fn(),
  fetchSubjectsInSchool: vi.fn(),
  fetchEquivalencies: vi.fn(),
}));

import * as oscar from "@/lib/gatech/oscar";
import { refreshNextBatch } from "@/lib/crawl/refreshBatch";

const fetchSchoolsInState = oscar.fetchSchoolsInState as unknown as ReturnType<
  typeof vi.fn
>;
const fetchSubjects = oscar.fetchSubjectsInSchool as unknown as ReturnType<
  typeof vi.fn
>;
const fetchEquivs = oscar.fetchEquivalencies as unknown as ReturnType<
  typeof vi.fn
>;

let mongo: TestMongo;
let client: MongoClient;

const ALPHA: School = { id: "001", name: "Alpha", state: "GA" };
const BETA: School = { id: "002", name: "Beta", state: "GA" };
const SAMPLE_TERM = { id: "202608", name: "Fall 2026" };

const goodEquivalent = {
  className: "MAT 101",
  title: "Calc",
  level: "LD",
  minimumGrade: "C",
  gaEquivalent: "MATH 1551",
  gaEquivalentTitle: "Calc 1",
  creditHours: "3.0",
};

beforeAll(async () => {
  mongo = await startTestMongo();
  client = mongo.client;
}, 60000);

afterAll(async () => {
  await mongo.stop();
});

beforeEach(async () => {
  fetchSchoolsInState.mockReset();
  fetchSubjects.mockReset();
  fetchEquivs.mockReset();
  const db = client.db(TRANSFER_DB);
  await db.collection(Collections.schools).deleteMany({});
  await db.collection(Collections.equivalents).deleteMany({});
  await db.collection(Collections.crawlFailures).deleteMany({});
  await db.collection(Collections.lastAccessed).deleteMany({});

  fetchSchoolsInState.mockResolvedValue([ALPHA, BETA]);
});

describe("refreshNextBatch durability", () => {
  it("stamps lastScrapedAt on every successful upsert", async () => {
    fetchSubjects.mockResolvedValue({
      subjects: ["MAT"],
      levels: [],
      terms: [SAMPLE_TERM],
    });
    fetchEquivs.mockResolvedValue([goodEquivalent]);

    const before = new Date();
    await refreshNextBatch(client, 0, ["GA"]);

    const docs = await client
      .db(TRANSFER_DB)
      .collection(Collections.equivalents)
      .find({})
      .toArray();
    expect(docs).toHaveLength(2);
    for (const doc of docs) {
      expect(doc.lastScrapedAt).toBeInstanceOf(Date);
      expect((doc.lastScrapedAt as Date).getTime()).toBeGreaterThanOrEqual(
        before.getTime()
      );
    }
  });

  it("refuses to overwrite existing data with an empty result + queues failure", async () => {
    // Seed an existing good document for ALPHA
    const existing = {
      _id: ALPHA.id as any,
      school: ALPHA.name,
      equivalents: [goodEquivalent],
      term: "old-term",
      lastScrapedAt: new Date("2020-01-01"),
    };
    await client
      .db(TRANSFER_DB)
      .collection(Collections.equivalents)
      .insertOne(existing);

    // Both schools come back from Oscar with empty equivalencies
    fetchSubjects.mockResolvedValue({
      subjects: ["MAT"],
      levels: [],
      terms: [SAMPLE_TERM],
    });
    fetchEquivs.mockResolvedValue([]);

    const result = await refreshNextBatch(client, 0, ["GA"]);
    expect(result.emptyResults).toBe(2);
    expect(result.equivalenciesWritten).toBe(0);

    // Existing ALPHA doc untouched
    const alpha = await client
      .db(TRANSFER_DB)
      .collection(Collections.equivalents)
      .findOne({ _id: ALPHA.id as any });
    expect(alpha).toMatchObject({
      term: "old-term",
      equivalents: [goodEquivalent],
    });

    // Both schools recorded as failures
    const failures = await client
      .db(TRANSFER_DB)
      .collection(Collections.crawlFailures)
      .find({})
      .sort({ _id: 1 })
      .toArray();
    expect(failures).toHaveLength(2);
    expect(failures.map((f) => f.reason)).toEqual([
      "empty_result",
      "empty_result",
    ]);
  });

  it("retries queued failures on the next batch and clears them on success", async () => {
    // Pre-seed a failure for ALPHA
    await client
      .db(TRANSFER_DB)
      .collection(Collections.crawlFailures)
      .insertOne({
        _id: ALPHA.id as any,
        school: ALPHA,
        reason: "scrape_error",
        firstFailedAt: new Date("2026-04-01"),
        lastFailedAt: new Date("2026-04-01"),
        attempts: 1,
      });

    // Both schools succeed this time. fetchSchoolsInState only returns BETA
    // (cursor batch), so without the failure-queue retry, ALPHA wouldn't be
    // touched at all.
    fetchSchoolsInState.mockResolvedValue([BETA]);
    fetchSubjects.mockResolvedValue({
      subjects: ["MAT"],
      levels: [],
      terms: [SAMPLE_TERM],
    });
    fetchEquivs.mockResolvedValue([goodEquivalent]);

    const result = await refreshNextBatch(client, 0, ["GA"]);
    expect(result.retriedFailures).toBe(1);
    expect(result.equivalenciesWritten).toBeGreaterThanOrEqual(2);

    // ALPHA cleared from failure queue
    const failures = await client
      .db(TRANSFER_DB)
      .collection(Collections.crawlFailures)
      .find({})
      .toArray();
    expect(failures).toHaveLength(0);

    // ALPHA's equivalency doc was written
    const alpha = await client
      .db(TRANSFER_DB)
      .collection(Collections.equivalents)
      .findOne({ _id: ALPHA.id as any });
    expect(alpha?.equivalents).toHaveLength(1);
    expect(alpha?.lastScrapedAt).toBeInstanceOf(Date);
  });

  it("dedups: a school in both the failure queue and the cursor batch only scrapes once", async () => {
    await client
      .db(TRANSFER_DB)
      .collection(Collections.crawlFailures)
      .insertOne({
        _id: ALPHA.id as any,
        school: ALPHA,
        reason: "scrape_error",
        firstFailedAt: new Date(),
        lastFailedAt: new Date(),
        attempts: 1,
      });

    // ALPHA also appears in cursor batch (via fetchSchoolsInState)
    fetchSubjects.mockResolvedValue({
      subjects: ["MAT"],
      levels: [],
      terms: [SAMPLE_TERM],
    });
    fetchEquivs.mockResolvedValue([goodEquivalent]);

    await refreshNextBatch(client, 0, ["GA"]);

    // ALPHA scraped once (via failure queue), BETA scraped once (cursor batch)
    expect(fetchSubjects).toHaveBeenCalledTimes(2);
  });

  it("REPLACES the equivalents array on rescrape (no append, courses removed from Oscar disappear)", async () => {
    // Seed ALPHA with two existing courses; one will be present in the new
    // scrape, one will not (simulating an Oscar removal).
    const stillThere = goodEquivalent;
    const goingAway = {
      ...goodEquivalent,
      className: "MAT 999",
      gaEquivalent: "MATH 9999",
    };
    await client
      .db(TRANSFER_DB)
      .collection(Collections.equivalents)
      .insertOne({
        _id: ALPHA.id as any,
        school: ALPHA.name,
        equivalents: [stillThere, goingAway],
        term: "old-term",
        lastScrapedAt: new Date("2020-01-01"),
      });

    fetchSchoolsInState.mockResolvedValue([ALPHA]);
    fetchSubjects.mockResolvedValue({
      subjects: ["MAT"],
      levels: [],
      terms: [SAMPLE_TERM],
    });
    // New scrape returns ONLY the still-there course.
    fetchEquivs.mockResolvedValue([stillThere]);

    await refreshNextBatch(client, 0, ["GA"]);

    const alpha = await client
      .db(TRANSFER_DB)
      .collection(Collections.equivalents)
      .findOne({ _id: ALPHA.id as any });
    expect(alpha?.equivalents).toHaveLength(1);
    expect(alpha?.equivalents?.[0].className).toBe("MAT 101");
    // The dropped course must not survive in the array.
    expect(
      (alpha?.equivalents as Array<{ className: string }>).some(
        (e) => e.className === "MAT 999"
      )
    ).toBe(false);
    // Term + lastScrapedAt updated to the fresh scrape values.
    expect(alpha?.term).toBe(SAMPLE_TERM.id);
    expect(alpha?.lastScrapedAt).toBeInstanceOf(Date);
    expect((alpha?.lastScrapedAt as Date) > new Date("2020-01-01")).toBe(true);
  });
});
