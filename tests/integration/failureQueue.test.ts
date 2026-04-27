import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { MongoClient } from "mongodb";
import { startTestMongo, TestMongo } from "./mongoHelpers";
import {
  recordFailure,
  clearFailure,
  getFailedSchools,
} from "@/lib/crawl/failureQueue";
import { TRANSFER_DB, Collections } from "@/lib/mongo/collections";
import { School } from "@/types/mongo/mongotypes";

let mongo: TestMongo;
let client: MongoClient;

beforeAll(async () => {
  mongo = await startTestMongo();
  client = mongo.client;
}, 60000);

afterAll(async () => {
  await mongo.stop();
});

beforeEach(async () => {
  await client
    .db(TRANSFER_DB)
    .collection(Collections.crawlFailures)
    .deleteMany({});
});

const SCHOOL_A: School = { id: "001", name: "Alpha", state: "GA" };
const SCHOOL_B: School = { id: "002", name: "Beta", state: "GA" };

describe("failureQueue", () => {
  it("recordFailure inserts on first failure, increments on subsequent", async () => {
    await recordFailure(client, SCHOOL_A, "scrape_error", new Error("boom"));
    await recordFailure(client, SCHOOL_A, "scrape_error", new Error("boom2"));

    const records = await client
      .db(TRANSFER_DB)
      .collection(Collections.crawlFailures)
      .find({})
      .toArray();
    expect(records).toHaveLength(1);
    expect(records[0].attempts).toBe(2);
    expect(records[0].lastError).toBe("boom2");
    expect(records[0].firstFailedAt).toBeInstanceOf(Date);
  });

  it("clearFailure removes the record", async () => {
    await recordFailure(client, SCHOOL_A, "scrape_error");
    await clearFailure(client, SCHOOL_A.id);
    const records = await getFailedSchools(client, 100);
    expect(records).toHaveLength(0);
  });

  it("getFailedSchools returns oldest-first up to limit", async () => {
    await recordFailure(client, SCHOOL_A, "scrape_error");
    // Force a small gap so timestamps differ
    await new Promise((r) => setTimeout(r, 10));
    await recordFailure(client, SCHOOL_B, "empty_result");

    const failures = await getFailedSchools(client, 10);
    expect(failures.map((s) => s.id)).toEqual(["001", "002"]);

    const limited = await getFailedSchools(client, 1);
    expect(limited.map((s) => s.id)).toEqual(["001"]);
  });
});
