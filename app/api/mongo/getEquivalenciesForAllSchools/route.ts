import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";
import { SchoolEquivalency } from "@/types/mongo/mongotypes";

export async function GET() {
  const client = await clientPromise;
  await client.connect();

  const database = client.db("transfer");
  const collection = database.collection<SchoolEquivalency>("equivalents");

  const schools = (await collection.find().toArray()) as SchoolEquivalency[];

  return new Response(JSON.stringify(schools));
}
