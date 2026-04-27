import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { MongoClient } from "mongodb";
import { startTestMongo, TestMongo } from "./mongoHelpers";
import {
  isRateLimited,
  getCrawlCursor,
  stampCrawlStart,
  advanceCrawlCursor,
} from "@/lib/crawl/cursor";
import { TRANSFER_DB, Collections, CrawlRoutes } from "@/lib/mongo/collections";

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
    .collection(Collections.lastAccessed)
    .deleteMany({});
});

describe("cursor module", () => {
  it("fresh DB: not rate-limited and cursor is 0", async () => {
    expect(await isRateLimited(client)).toBe(false);
    expect(await getCrawlCursor(client)).toBe(0);
  });

  it("stampCrawlStart records a new run and gates subsequent calls", async () => {
    await stampCrawlStart(client);
    expect(await isRateLimited(client)).toBe(true);
  });

  it("advanceCrawlCursor persists the next index without resetting the timestamp", async () => {
    await stampCrawlStart(client);
    await advanceCrawlCursor(client, 100);
    expect(await getCrawlCursor(client)).toBe(100);
    expect(await isRateLimited(client)).toBe(true);
  });

  it("an old run (>22h ago) is not rate-limited", async () => {
    const longAgo = new Date(Date.now() - 23 * 60 * 60 * 1000);
    await client
      .db(TRANSFER_DB)
      .collection(Collections.lastAccessed)
      .insertOne({
        routeName: CrawlRoutes.dailyRefresh,
        date: longAgo,
        schoolNumber: 42,
      });
    expect(await isRateLimited(client)).toBe(false);
    expect(await getCrawlCursor(client)).toBe(42);
  });
});
