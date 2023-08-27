import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";
import { getAllStates } from "./getAllStates";
import { School, getSchoolsInState } from "./getSchoolsInState";
import { MongoClient } from "mongodb";
import { getAllSubjectsInSchool } from "./getAllSubjectsInSchool";
import { getEquivalencyForSchool } from "./getEquivalencyForSchool";
import { all } from "axios";

type ResponseData = {
  schools: "";
};

async function mongoImportStates(client: MongoClient) {
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

async function mongoImportSchools(client: MongoClient, states: string[]) {
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

async function mongoImportEquivalencyForASchool(
  client: MongoClient,
  school: School
) {
  const db = client.db("transfer");
  const collection = db.collection("equivalents");

  const schoolData = await getAllSubjectsInSchool(school.state, school.id);
  const term = schoolData.terms[0].id;

  const equivalents = await getEquivalencyForSchool(
    school.state,
    school.id,
    schoolData.subjects,
    term
  );

  const filter = { _id: school.id };
  const update = {
    $set: {
      _id: school.id,
      school: school.name,
      equivalents: equivalents,
      term: term,
    },
  };
  const options = { upsert: true };

  collection.updateOne(filter, update, options);

  console.log(`Imported ${equivalents.length} equivalencies for ${school.name}`);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const client = await clientPromise;
  await client.connect();
  
  const states = await mongoImportStates(client);

  const allSchools = await mongoImportSchools(client, states);
  console.log(`Gathering equivalencies for ${allSchools.length} schools`)

  for (let i = 0; i < allSchools.length; i++) {
    mongoImportEquivalencyForASchool(client, allSchools[i]);
  }

  res.status(200).json({ schools: "" });
}
