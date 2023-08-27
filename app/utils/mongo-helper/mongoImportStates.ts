import { MongoClient } from "mongodb";
import getAllStates from "../api-helper/getAllStates";

export default async function mongoImportStates(client: MongoClient) {
  const db = client.db("transfer");
  const collection = db.collection("states");

  const states = await getAllStates();

  const filter = { docType: "statesList" };
  const update = {
    $set: { states: states, docType: "statesList" },
  };
  const options = { upsert: true };

  collection.updateOne(filter, update, options);

  return states;
}
