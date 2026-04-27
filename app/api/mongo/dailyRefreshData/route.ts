import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import {
  isRateLimited,
  getCrawlCursor,
  stampCrawlStart,
} from "@/lib/crawl/cursor";
import { refreshNextBatch } from "@/lib/crawl/refreshBatch";
import { US_STATES_AND_TERRITORIES } from "@/lib/gatech/states";

export const dynamic = "force-dynamic";

export async function GET() {
  const client = await clientPromise;

  if (await isRateLimited(client)) {
    return NextResponse.json({
      success: false,
      error: "This route can only be accessed once per day.",
    });
  }

  await stampCrawlStart(client);
  const cursor = await getCrawlCursor(client);
  const result = await refreshNextBatch(client, cursor, US_STATES_AND_TERRITORIES);

  return NextResponse.json({ success: true, ...result });
}
