import { differenceInCalendarMonths } from "date-fns";
import { MongoClient } from "mongodb";

export default async function mongoMonthlyRequestLimiter(
  client: MongoClient
): Promise<boolean> {
  const accessCollection = client.db("transfer").collection("lastAccessed");

  // Check the last time the route was accessed
  const lastAccessed = await accessCollection.findOne({
    routeName: "monthlyMongoUpdate",
  });

  const now = new Date();
  if (lastAccessed) {
    const lastAccessDate = new Date(lastAccessed.date);

    // Check if a month has passed since the last access
    if (differenceInCalendarMonths(now, lastAccessDate) < 1) {
      return false;
    }
  }

  await accessCollection.updateOne(
    { routeName: "monthlyMongoUpdate" },
    { $set: { date: now } },
    { upsert: true }
  );

  return true;
}
