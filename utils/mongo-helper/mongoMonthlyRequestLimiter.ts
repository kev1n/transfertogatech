import { differenceInCalendarMonths } from "date-fns";
import { MongoClient } from "mongodb";
import { NextApiResponse } from "next";
import { ResponseData } from "../../pages/api/monthlyMongoUpdate";

export default async function mongoMonthlyRequestLimiter(
  client: MongoClient,
  res: NextApiResponse<ResponseData>
) {
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
      return res.status(403).json({
        success: false,
        error: "This route can only be accessed once per month.",
      });
    }
  }

  await accessCollection.updateOne(
    { routeName: "monthlyMongoUpdate" },
    { $set: { date: now } },
    { upsert: true }
  );
}
