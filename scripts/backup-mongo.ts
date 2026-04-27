/**
 * Dumps every collection in the transfer database to JSON files under
 * backups/<timestamp>/. Read-only — does not modify the source.
 *
 * Run:  npx tsx scripts/backup-mongo.ts
 */
import { MongoClient } from "mongodb";
import * as fs from "fs";
import * as path from "path";
import { config } from "dotenv";
import { TRANSFER_DB } from "../lib/mongo/collections";

config(); // load .env

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI not set");
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(TRANSFER_DB);

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outDir = path.resolve(__dirname, "..", "backups", stamp);
  fs.mkdirSync(outDir, { recursive: true });

  const collections = await db.listCollections().toArray();
  console.log(`Found ${collections.length} collections in "${TRANSFER_DB}"`);

  const summary: Record<string, number> = {};
  for (const { name } of collections) {
    const docs = await db.collection(name).find({}).toArray();
    const file = path.join(outDir, `${name}.json`);
    fs.writeFileSync(file, JSON.stringify(docs, null, 2), "utf-8");
    summary[name] = docs.length;
    console.log(`  ${name.padEnd(20)} ${docs.length} docs → ${path.relative(process.cwd(), file)}`);
  }

  fs.writeFileSync(
    path.join(outDir, "_summary.json"),
    JSON.stringify(
      { db: TRANSFER_DB, stamp, totalCollections: collections.length, counts: summary },
      null,
      2
    ),
    "utf-8"
  );

  await client.close();
  console.log(`\nBackup complete: ${path.relative(process.cwd(), outDir)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
