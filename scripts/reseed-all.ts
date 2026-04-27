/**
 * Full re-seed: walks the entire schools list and refreshes every
 * equivalency doc through the same `refreshNextBatch` path the cron uses.
 * Bypasses the 22h rate gate (that lives in the route handler, not the
 * batch function), so it's safe to run alongside the prod cron — they
 * cooperate via the cursor.
 *
 * Run: npx tsx scripts/reseed-all.ts
 */
import { config } from "dotenv";
config();

import { MongoClient } from "mongodb";
import { TRANSFER_DB, Collections } from "../lib/mongo/collections";
import {
  refreshNextBatch,
  CRAWL_BATCH_SIZE,
} from "../lib/crawl/refreshBatch";
import mongoImportSchools from "../lib/utils/mongo-helper/mongoImportSchools";
import { US_STATES_AND_TERRITORIES } from "../lib/gatech/states";

const POLITE_PAUSE_MS = 1000;

const sleep = (ms: number) =>
  new Promise<void>((r) => setTimeout(r, ms));

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set");

  const client = new MongoClient(uri);
  await client.connect();

  console.log(`\n=== Full re-seed ===\n`);
  console.log("Loading schools list (one-time, for batch planning)...");
  const allSchools = await mongoImportSchools(
    client,
    US_STATES_AND_TERRITORIES
  );
  const totalSchools = allSchools.length;
  const expectedBatches = Math.ceil(totalSchools / CRAWL_BATCH_SIZE);
  console.log(
    `${totalSchools} schools → ${expectedBatches} batches of ${CRAWL_BATCH_SIZE}\n`
  );

  const startTime = Date.now();
  let cursor = 0;
  let totalsWritten = 0;
  let totalsEmpty = 0;
  let totalsErrors = 0;

  for (let i = 1; i <= expectedBatches; i++) {
    const batchStart = Date.now();
    const result = await refreshNextBatch(
      client,
      cursor,
      US_STATES_AND_TERRITORIES,
      { preloadedSchools: allSchools }
    );
    cursor = result.nextCursor;
    totalsWritten += result.equivalenciesWritten;
    totalsEmpty += result.emptyResults;
    totalsErrors += result.scrapeErrors;
    const sec = ((Date.now() - batchStart) / 1000).toFixed(1);
    console.log(
      `Batch ${i}/${expectedBatches} (${sec}s): cursor→${cursor}, retried=${result.retriedFailures}, written=${result.equivalenciesWritten}, empty=${result.emptyResults}, errors=${result.scrapeErrors}`
    );
    if (i < expectedBatches) await sleep(POLITE_PAUSE_MS);
  }

  const totalMin = ((Date.now() - startTime) / 60_000).toFixed(1);

  // Failure-queue summary
  const failures = await client
    .db(TRANSFER_DB)
    .collection(Collections.crawlFailures)
    .find({})
    .toArray();
  const byReason = failures.reduce<Record<string, number>>((acc, f) => {
    acc[f.reason] = (acc[f.reason] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`\n=== Re-seed complete in ${totalMin} min ===`);
  console.log(`  ${totalsWritten} equivalency docs written`);
  console.log(`  ${totalsEmpty} schools returned empty (preserved existing data)`);
  console.log(`  ${totalsErrors} schools failed scraping after retries`);
  console.log(`  ${failures.length} schools currently in crawlFailures queue:`);
  for (const [reason, count] of Object.entries(byReason)) {
    console.log(`    ${reason}: ${count}`);
  }

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
