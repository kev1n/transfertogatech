import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { School } from "@/types/mongo/mongotypes";
import { TRANSFER_DB, Collections } from "@/lib/mongo/collections";

export const dynamic = "force-dynamic";

interface SchoolsListDoc {
  schools: School[];
  docType: "schoolsList";
}

export async function GET() {
  const client = await clientPromise;
  const collection = client
    .db(TRANSFER_DB)
    .collection<SchoolsListDoc>(Collections.schools);

  const doc = await collection.findOne({ docType: "schoolsList" });
  if (!doc) {
    return new Response("No schools found", { status: 404 });
  }

  const options = doc.schools.map((school) => ({
    value: school.id,
    label: school.name,
  }));
  return NextResponse.json(options);
}
