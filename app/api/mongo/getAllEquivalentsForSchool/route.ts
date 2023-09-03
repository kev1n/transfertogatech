import clientPromise from "@/lib/mongodb";
import { SchoolEquivalency } from "@/types/mongo/mongotypes";

//get all the equivalent courses for a school
export async function GET(req: Request) {
  //get the school id from the querystring
  const url = new URL(req.url);
  const schoolId = url.searchParams.get("schoolId")!;

  const client = await clientPromise;
  await client.connect();

  const database = client.db("transfer");
  const collection = database.collection<SchoolEquivalency>("equivalents");

  const equivalencies = await collection.findOne({
    _id: schoolId,
  });

  if (!equivalencies) {
    return new Response("No equivalencies found", { status: 404 });
  }

  return new Response(JSON.stringify(equivalencies));
}
