import { MongoClient } from "mongodb";
import { School } from "@/types/mongo/mongotypes";
import { TRANSFER_DB, Collections } from "@/lib/mongo/collections";

export type FailureReason = "scrape_error" | "empty_result";

export interface CrawlFailure {
  _id: string; // school id
  school: School;
  reason: FailureReason;
  lastError?: string;
  firstFailedAt: Date;
  lastFailedAt: Date;
  attempts: number;
}

function failureCollection(client: MongoClient) {
  return client
    .db(TRANSFER_DB)
    .collection<CrawlFailure>(Collections.crawlFailures);
}

/**
 * Records (or upserts) a failure. Increments `attempts` and updates
 * `lastFailedAt`/`lastError`; preserves `firstFailedAt`.
 */
export async function recordFailure(
  client: MongoClient,
  school: School,
  reason: FailureReason,
  error?: unknown
): Promise<void> {
  const now = new Date();
  const message =
    error instanceof Error ? error.message : error ? String(error) : undefined;

  await failureCollection(client).updateOne(
    { _id: school.id },
    {
      $set: {
        school,
        reason,
        lastError: message,
        lastFailedAt: now,
      },
      $setOnInsert: { firstFailedAt: now },
      $inc: { attempts: 1 },
    },
    { upsert: true }
  );
}

export async function clearFailure(
  client: MongoClient,
  schoolId: string
): Promise<void> {
  await failureCollection(client).deleteOne({ _id: schoolId });
}

/**
 * Returns failed schools to retry, oldest-failure-first, capped at `limit`.
 */
export async function getFailedSchools(
  client: MongoClient,
  limit: number
): Promise<School[]> {
  const records = await failureCollection(client)
    .find({})
    .sort({ firstFailedAt: 1 })
    .limit(limit)
    .toArray();
  return records.map((r) => r.school);
}
