/**
 * End-to-end smoke test: scrapes one known school live from Oscar,
 * writes through the real Mongo connection using the same primitives
 * `refreshNextBatch` would, and reports before/after.
 *
 * Run: npx tsx scripts/e2e-scrape.ts
 *
 * Bounded to a single school so it's safe to run against production —
 * always run scripts/backup-mongo.ts first.
 */
import { config } from "dotenv";
config();

import { MongoClient } from "mongodb";
import { TRANSFER_DB, Collections } from "../lib/mongo/collections";
import { scrapeSchoolEquivalencies } from "../lib/crawl/scrapeSchool";
import {
  recordFailure,
  clearFailure,
} from "../lib/crawl/failureQueue";
import { School, SchoolEquivalency } from "../types/mongo/mongotypes";

const TARGET: School = { id: "005059", name: "Berry College", state: "GA" };

function summarize(doc: SchoolEquivalency | null) {
  if (!doc) return "(no doc)";
  return `${doc.equivalents.length} equivs, term=${doc.term}, lastScrapedAt=${doc.lastScrapedAt ?? "none"}`;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set");

  const client = new MongoClient(uri);
  await client.connect();
  const equivalentsColl = client
    .db(TRANSFER_DB)
    .collection<SchoolEquivalency>(Collections.equivalents);

  console.log(`\n=== E2E scrape smoke test: ${TARGET.name} (${TARGET.id}) ===\n`);

  // 1. Baseline
  const before = await equivalentsColl.findOne({ _id: TARGET.id });
  console.log(`Before: ${summarize(before)}`);

  // 2. Live scrape (full retry+backoff path)
  console.log(`\nScraping live from oscar.gatech.edu...`);
  let scrape;
  try {
    scrape = await scrapeSchoolEquivalencies(TARGET);
  } catch (error) {
    console.error(`Scrape failed: ${(error as Error).message}`);
    await recordFailure(client, TARGET, "scrape_error", error);
    console.log("Recorded in failure queue. Aborting.");
    await client.close();
    process.exit(1);
  }
  console.log(
    `Scraped ${scrape.equivalents.length} equivalents, term=${scrape.term}`
  );
  console.log(`First 3 rows:`);
  for (const c of scrape.equivalents.slice(0, 3)) {
    console.log(`  ${c.className} -> ${c.gaEquivalent} (${c.title})`);
  }

  // 3. Empty-result guard (matches refreshBatch behavior)
  if (scrape.equivalents.length === 0) {
    console.error("\nEmpty result — refusing to overwrite existing data.");
    await recordFailure(client, TARGET, "empty_result");
    await client.close();
    process.exit(1);
  }

  // 4. Upsert with lastScrapedAt stamp
  const now = new Date();
  const writeResult = await equivalentsColl.updateOne(
    { _id: TARGET.id },
    {
      $set: {
        _id: TARGET.id,
        school: TARGET.name,
        equivalents: scrape.equivalents,
        term: scrape.term,
        lastScrapedAt: now,
      },
    },
    { upsert: true }
  );
  console.log(
    `\nWrite: matched=${writeResult.matchedCount} modified=${writeResult.modifiedCount} upserted=${writeResult.upsertedCount}`
  );
  await clearFailure(client, TARGET.id);

  // 5. Read-back verification
  const after = await equivalentsColl.findOne({ _id: TARGET.id });
  console.log(`After: ${summarize(after)}`);

  // 6. Sanity assertions
  const ok =
    after !== null &&
    after.equivalents.length === scrape.equivalents.length &&
    after.lastScrapedAt instanceof Date &&
    after.term === scrape.term;
  console.log(`\nE2E pipeline: ${ok ? "PASS ✓" : "FAIL ✗"}`);

  await client.close();
  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
