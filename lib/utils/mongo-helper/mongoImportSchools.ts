import { MongoClient } from "mongodb";
import getSchoolsInState from "../api-helper/getSchoolsInState";
import { School } from "@/types/mongo/mongotypes";

export default async function mongoImportSchools(
  client: MongoClient,
  states: string[]
) {
  const db = client.db("transfer");
  const collection = db.collection("schools");

  const allSchools: School[] = [];
  for (let i = 0; i < states.length; i++) {
    const schools = await getSchoolsInState(states[i]);
    allSchools.push(...schools);
  }

  return allSchools;
}
