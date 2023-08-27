import { MongoClient } from "mongodb";
import getSchoolsInState, { School } from "../api-helper/getSchoolsInState";

export default async function mongoImportSchools(client: MongoClient, states: string[]) {
  const db = client.db("transfer");
  const collection = db.collection("schools");

  const allSchools: School[] = [];
  for (let i = 0; i < states.length; i++) {
    const schools = await getSchoolsInState(states[i]);
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
