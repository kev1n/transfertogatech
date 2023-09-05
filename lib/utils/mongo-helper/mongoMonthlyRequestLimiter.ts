import { differenceInHours } from "date-fns";
import { MongoClient } from "mongodb";

export default async function mongoDailyRequestLimiter(
  client: MongoClient
): Promise<number | null> {
  const accessCollection = client.db("transfer").collection("lastAccessed");

  // Check the last time the route was accesseds
  const lastAccessed = await accessCollection.findOne({
    routeName: "dailyMongoUpdate",
  });

  const now = new Date();
  let schoolNumber = 0;
  if (lastAccessed) {
    const lastAccessDate = new Date(lastAccessed.date);

    // Check if a month has passed since the last access
    if (differenceInHours(now, lastAccessDate) < 22) {
      return null;
    } else {
      schoolNumber = lastAccessed.schoolNumber;
    }
  }

  await accessCollection.updateOne(
    { routeName: "dailyMongoUpdate" },
    { $set: { date: now, schoolNumber: schoolNumber } },
    { upsert: true }
  );

  return schoolNumber;
}
