import { MongoClient } from "mongodb";
import { School } from "@/types/mongo/mongotypes";
import { TRANSFER_DB, Collections } from "@/lib/mongo/collections";
import { fetchSchoolsInState } from "@/lib/gatech/oscar";
import { retryWithBackoff } from "@/lib/utils/retry";
import { mapWithConcurrency } from "@/lib/utils/concurrency";

const STATE_FETCH_CONCURRENCY = 5;

export default async function mongoImportSchools(
  client: MongoClient,
  states: readonly string[]
): Promise<School[]> {
  const db = client.db(TRANSFER_DB);
  const collection = db.collection(Collections.schools);

  const schoolsByState = await mapWithConcurrency(
    states,
    STATE_FETCH_CONCURRENCY,
    (state) =>
      retryWithBackoff(() => fetchSchoolsInState(state), {
        maxAttempts: 5,
        initialDelayMs: 2_000,
        maxDelayMs: 60_000,
        factor: 2,
        jitter: true,
        onRetry: (attempt, _err, delay) =>
          console.log(
            `[schools/${state}] attempt ${attempt} failed; retrying in ${delay}ms`
          ),
      })
  );
  const allSchools = schoolsByState.flat();

  await collection.updateOne(
    { docType: "schoolsList" },
    { $set: { schools: allSchools, docType: "schoolsList" } },
    { upsert: true }
  );
  return allSchools;
}
