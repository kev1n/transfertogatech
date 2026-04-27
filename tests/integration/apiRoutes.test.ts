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

let mongo: TestMongo;
let client: MongoClient;

// Replace the module-level clientPromise with our in-memory one.
vi.mock("@/lib/mongodb", () => ({
  default: (async () => client)(),
}));

beforeAll(async () => {
  mongo = await startTestMongo();
  client = mongo.client;
  (await import("@/lib/mongodb")).default; // force mock to read `client`
}, 60000);

afterAll(async () => {
  await mongo.stop();
});

beforeEach(async () => {
  const db = client.db(TRANSFER_DB);
  await db.collection(Collections.schools).deleteMany({});
  await db.collection(Collections.equivalents).deleteMany({});
  await db.collection(Collections.lastAccessed).deleteMany({});
});

describe("GET /api/mongo/getAllSchools", () => {
  it("404s when no schoolsList doc is present", async () => {
    const { GET } = await import("@/app/api/mongo/getAllSchools/route");
    const res = await GET();
    expect(res.status).toBe(404);
  });

  it("returns combobox options when schools exist", async () => {
    await client
      .db(TRANSFER_DB)
      .collection(Collections.schools)
      .insertOne({
        docType: "schoolsList",
        schools: [
          { id: "001", name: "Alpha College", state: "GA" },
          { id: "002", name: "Beta University", state: "GA" },
        ],
      });

    const { GET } = await import("@/app/api/mongo/getAllSchools/route");
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual([
      { value: "001", label: "Alpha College" },
      { value: "002", label: "Beta University" },
    ]);
  });
});

describe("GET /api/mongo/getAllEquivalentsForSchool", () => {
  it("400s when schoolId is missing", async () => {
    const { GET } = await import(
      "@/app/api/mongo/getAllEquivalentsForSchool/route"
    );
    const res = await GET(
      new Request("http://test.local/api/mongo/getAllEquivalentsForSchool")
    );
    expect(res.status).toBe(400);
  });

  it("404s for an unknown schoolId", async () => {
    const { GET } = await import(
      "@/app/api/mongo/getAllEquivalentsForSchool/route"
    );
    const res = await GET(
      new Request(
        "http://test.local/api/mongo/getAllEquivalentsForSchool?schoolId=missing"
      )
    );
    expect(res.status).toBe(404);
  });

  it("returns the equivalency document for a known school", async () => {
    await client
      .db(TRANSFER_DB)
      .collection(Collections.equivalents)
      .insertOne({
        _id: "005059" as any,
        school: "Berry College",
        equivalents: [],
        term: "202608",
      });

    const { GET } = await import(
      "@/app/api/mongo/getAllEquivalentsForSchool/route"
    );
    const res = await GET(
      new Request(
        "http://test.local/api/mongo/getAllEquivalentsForSchool?schoolId=005059"
      )
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.school).toBe("Berry College");
  });
});

describe("GET /api/mongo/dailyRefreshData rate limiting", () => {
  it("refuses when a recent run is recorded", async () => {
    await client
      .db(TRANSFER_DB)
      .collection(Collections.lastAccessed)
      .insertOne({
        routeName: "dailyMongoUpdate",
        date: new Date(),
        schoolNumber: 0,
      });

    const { GET } = await import("@/app/api/mongo/dailyRefreshData/route");
    const res = await GET();
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toMatch(/once per day/i);
  });
});
