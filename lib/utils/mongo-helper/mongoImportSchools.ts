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
  const promises = states.map((state) => getSchoolsInState(state));

  const schoolsArrays = await Promise.all(promises);
  for (const schools of schoolsArrays) {
    allSchools.push(...schools);
  }

  const filter = { docType: "schoolsList" };
  const update = {
    $set: { schools: allSchools, docType: "schoolsList" },
  };

  const options = { upsert: true };

  collection.updateOne(filter, update, options);
  return allSchools;
}
