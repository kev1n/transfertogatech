import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { SchoolEquivalency } from "@/types/mongo/mongotypes";
import { TRANSFER_DB, Collections } from "@/lib/mongo/collections";
import { getPostHogClient } from "@/lib/posthog-server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const schoolId = new URL(req.url).searchParams.get("schoolId");
  if (!schoolId) {
    return new Response("schoolId required", { status: 400 });
  }

  const client = await clientPromise;
  const collection = client
    .db(TRANSFER_DB)
    .collection<SchoolEquivalency>(Collections.equivalents);

  const equivalencies = await collection.findOne({ _id: schoolId });
  if (!equivalencies) {
    return new Response("No equivalencies found", { status: 404 });
  }

  getPostHogClient().capture({
    distinctId: "server",
    event: "equivalencies_fetched",
    properties: {
      school_id: schoolId,
      equivalency_count: equivalencies.equivalents?.length ?? 0,
    },
  });

  return NextResponse.json(equivalencies);
}
