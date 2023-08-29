import clientPromise from "@/lib/mongodb";
import { School } from "@/types/mongo/mongotypes";

interface MongoSchoolResponse {
  schools: School[];
  docType: "schoolsList";
}

export async function GET() {
  const client = await clientPromise;
  await client.connect();

  const database = client.db("transfer");
  const collection = database.collection<MongoSchoolResponse>("schools");

  const schools = (await collection.findOne({
    docType: "schoolsList",
  })) as MongoSchoolResponse; // Retrieve the schools from the collection

  if (!schools) {
    return new Response("No schools found", { status: 404 });
  }

  //{ value: string; label: string }
  const parsedSchools = schools.schools.map((school) => {
    return {
      value: school.id,
      label: school.name,
    };
  });

  return new Response(JSON.stringify(parsedSchools));
}
