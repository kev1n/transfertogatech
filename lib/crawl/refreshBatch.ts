import { MongoClient, AnyBulkWriteOperation } from "mongodb";
import { School } from "@/types/mongo/mongotypes";
import { TRANSFER_DB, Collections } from "@/lib/mongo/collections";
import mongoImportSchools from "@/lib/utils/mongo-helper/mongoImportSchools";
import { mapWithConcurrency } from "@/lib/utils/concurrency";
import {
  scrapeSchoolEquivalencies,
  SchoolEquivalencyScrape,
} from "./scrapeSchool";
import { advanceCrawlCursor } from "./cursor";
import {
  clearFailure,
  getFailedSchools,
  recordFailure,
} from "./failureQueue";

export const CRAWL_BATCH_SIZE = 100;
export const FAILURE_RETRY_CAP = 100;
/**
 * How many schools to scrape from Oscar in parallel. Capped low because
 * Oscar's ORDS connection pool is small (~10) and 503s when overrun.
 */
export const SCRAPE_CONCURRENCY = 5;

export interface RefreshBatchResult {
  batchSize: number;
  retriedFailures: number;
  nextCursor: number;
  equivalenciesWritten: number;
  emptyResults: number;
  scrapeErrors: number;
}

export interface RefreshBatchOptions {
  /**
   * Pre-loaded schools list. Skips the per-call mongoImportSchools fetch
   * (which itself hits Oscar 54 times) — useful when looping batches.
   */
  preloadedSchools?: readonly School[];
  scrapeConcurrency?: number;
}

async function buildWorkList(
  client: MongoClient,
  cursor: number,
  allSchools: readonly School[]
): Promise<{ failures: School[]; cursorBatch: School[] }> {
  const failures = await getFailedSchools(client, FAILURE_RETRY_CAP);
  const failureIds = new Set(failures.map((s) => s.id));
  const cursorBatch = allSchools
    .slice(cursor, cursor + CRAWL_BATCH_SIZE)
    .filter((s) => !failureIds.has(s.id));
  return { failures, cursorBatch };
}

interface ScrapeOutcome {
  scrape: SchoolEquivalencyScrape | null;
  reason?: "scrape_error" | "empty_result";
  error?: unknown;
}

async function runScrape(school: School): Promise<ScrapeOutcome> {
  try {
    const scrape = await scrapeSchoolEquivalencies(school);
    if (scrape.equivalents.length === 0) {
      console.log(
        `[${school.name}] returned 0 equivalents — refusing to overwrite existing data`
      );
      return { scrape: null, reason: "empty_result" };
    }
    console.log(
      `Gathered ${scrape.equivalents.length} equivalencies for ${school.name}`
    );
    return { scrape };
  } catch (error) {
    console.log(
      `[${school.name}] gave up after retries:`,
      (error as Error)?.message ?? error
    );
    return { scrape: null, reason: "scrape_error", error };
  }
}

function toBulkOperation(
  scrape: SchoolEquivalencyScrape,
  now: Date
): AnyBulkWriteOperation<any> {
  return {
    updateOne: {
      filter: { _id: scrape.school.id },
      update: {
        $set: {
          _id: scrape.school.id,
          school: scrape.school.name,
          equivalents: scrape.equivalents,
          term: scrape.term,
          lastScrapedAt: now,
        },
      },
      upsert: true,
    },
  };
}

async function writeEquivalencies(
  client: MongoClient,
  scrapes: SchoolEquivalencyScrape[]
): Promise<number> {
  if (scrapes.length === 0) return 0;
  const now = new Date();
  const result = await client
    .db(TRANSFER_DB)
    .collection(Collections.equivalents)
    .bulkWrite(scrapes.map((s) => toBulkOperation(s, now)));
  return result.modifiedCount + result.upsertedCount;
}

async function processOutcomes(
  client: MongoClient,
  schools: School[],
  outcomes: ScrapeOutcome[]
): Promise<{ scrapes: SchoolEquivalencyScrape[]; empty: number; errors: number }> {
  const scrapes: SchoolEquivalencyScrape[] = [];
  let empty = 0;
  let errors = 0;

  for (let i = 0; i < schools.length; i++) {
    const school = schools[i];
    const outcome = outcomes[i];
    if (outcome.scrape) {
      scrapes.push(outcome.scrape);
      await clearFailure(client, school.id);
    } else if (outcome.reason === "empty_result") {
      empty++;
      await recordFailure(client, school, "empty_result");
    } else {
      errors++;
      await recordFailure(client, school, "scrape_error", outcome.error);
    }
  }
  return { scrapes, empty, errors };
}

export async function refreshNextBatch(
  client: MongoClient,
  cursor: number,
  states: readonly string[],
  options: RefreshBatchOptions = {}
): Promise<RefreshBatchResult> {
  const allSchools =
    options.preloadedSchools ?? (await mongoImportSchools(client, states));
  const concurrency = options.scrapeConcurrency ?? SCRAPE_CONCURRENCY;

  const { failures, cursorBatch } = await buildWorkList(
    client,
    cursor,
    allSchools
  );
  const work = [...failures, ...cursorBatch];
  console.log(
    `Refreshing ${work.length} schools (${failures.length} retries, ${cursorBatch.length} from cursor ${cursor}), concurrency=${concurrency}`
  );

  const outcomes = await mapWithConcurrency(work, concurrency, runScrape);
  const { scrapes, empty, errors } = await processOutcomes(
    client,
    work,
    outcomes
  );

  const equivalenciesWritten = await writeEquivalencies(client, scrapes);
  const nextCursor =
    allSchools.length >= cursor + CRAWL_BATCH_SIZE
      ? cursor + CRAWL_BATCH_SIZE
      : 0;
  await advanceCrawlCursor(client, nextCursor);

  return {
    batchSize: cursorBatch.length,
    retriedFailures: failures.length,
    nextCursor,
    equivalenciesWritten,
    emptyResults: empty,
    scrapeErrors: errors,
  };
}
