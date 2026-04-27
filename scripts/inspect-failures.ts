/**
 * Prints the current crawlFailures queue. Read-only.
 * Run: npx tsx scripts/inspect-failures.ts
 */
import { config } from "dotenv";
config();

import { MongoClient } from "mongodb";
import { TRANSFER_DB, Collections } from "../lib/mongo/collections";

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();

  const failures = await client
    .db(TRANSFER_DB)
    .collection(Collections.crawlFailures)
    .find({})
    .sort({ firstFailedAt: 1 })
    .toArray();

  console.log(`${failures.length} schools in crawlFailures:\n`);
  for (const f of failures) {
    console.log(
      `  [${f.reason}] ${f.school.name} (${f.school.id}, ${f.school.state}) — attempts=${f.attempts}, last="${f.lastError ?? ""}"`
    );
  }

  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
