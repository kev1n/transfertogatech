import { MongoClient } from "mongodb";
import { differenceInHours } from "date-fns";
import { TRANSFER_DB, Collections, CrawlRoutes } from "@/lib/mongo/collections";

const RATE_LIMIT_HOURS = 22;

interface LastAccessRecord {
  routeName: string;
  date?: Date;
  schoolNumber?: number;
}

function accessCollection(client: MongoClient) {
  return client
    .db(TRANSFER_DB)
    .collection<LastAccessRecord>(Collections.lastAccessed);
}

async function readLastAccess(
  client: MongoClient
): Promise<LastAccessRecord | null> {
  return accessCollection(client).findOne({
    routeName: CrawlRoutes.dailyRefresh,
  });
}

export async function isRateLimited(client: MongoClient): Promise<boolean> {
  const record = await readLastAccess(client);
  if (!record?.date) return false;
  return differenceInHours(new Date(), new Date(record.date)) < RATE_LIMIT_HOURS;
}

export async function getCrawlCursor(client: MongoClient): Promise<number> {
  const record = await readLastAccess(client);
  return record?.schoolNumber ?? 0;
}

/**
 * Stamps the run time so the rate limiter will gate subsequent calls.
 * Call this at the start of a crawl after confirming we're not rate-limited.
 */
export async function stampCrawlStart(client: MongoClient): Promise<void> {
  const cursor = await getCrawlCursor(client);
  await accessCollection(client).updateOne(
    { routeName: CrawlRoutes.dailyRefresh },
    { $set: { date: new Date(), schoolNumber: cursor } },
    { upsert: true }
  );
}

export async function advanceCrawlCursor(
  client: MongoClient,
  nextIndex: number
): Promise<void> {
  await accessCollection(client).updateOne(
    { routeName: CrawlRoutes.dailyRefresh },
    { $set: { schoolNumber: nextIndex } },
    { upsert: true }
  );
}
