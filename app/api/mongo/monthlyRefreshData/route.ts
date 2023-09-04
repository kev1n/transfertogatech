import clientPromise from "@/lib/mongodb";
import mongoImportSchools from "@/lib/utils/mongo-helper/mongoImportSchools";

import mongoImportStates from "@/lib/utils/mongo-helper/mongoImportStates";
import mongoImportEquivalency from "@/lib/utils/mongo-helper/mongoImportEquivalency";
import mongoMonthlyRequestLimiter from "@/lib/utils/mongo-helper/mongoMonthlyRequestLimiter";
import { MongoClient } from "mongodb";
import { Class, School } from "@/types/mongo/mongotypes";
import getAllSubjectsInSchool from "@/lib/utils/api-helper/getAllSubjectsInSchool";
import getEquivalencyForSchool from "@/lib/utils/api-helper/getEquivalencyForSchool";

export const dynamic = "force-dynamic";

export async function GET() {
  const client = await clientPromise;
  await client.connect();

  const shouldProceed = await mongoMonthlyRequestLimiter(client);

  if (!shouldProceed) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "This route can only be accessed once per month.",
      })
    );
  }

  const allSchools = (await mongoImportSchools(client, states)).slice(0, 5);
  console.log(`Gathering equivalencies for ${allSchools.length} schools`);

  const equivalenciesForAllSchools = await gatherEquivalencies(allSchools);
  bulkImportEquivalencies(client, equivalenciesForAllSchools);
  /*
  for (let i = 0; i < allSchools.length; i++) {
    mongoImportEquivalency(client, allSchools[i]);
  }*/

  return new Response(JSON.stringify({ success: true }));
}

async function gatherEquivalencies(schools: School[]) {
  const operationsPromises = schools.map((school) =>
    gatherEquivalencyForSchool(school)
  );

  const equivalenciesForAllSchools = await Promise.all(operationsPromises);
  return equivalenciesForAllSchools.filter(Boolean); // this removes any null values
}

async function gatherEquivalencyForSchool(school: School) {
  try {
    const schoolData = await getAllSubjectsInSchool(school.state, school.id);
    const term = schoolData.terms[0].id;

    const equivalents = await getEquivalencyForSchool(
      school.state,
      school.id,
      schoolData.subjects,
      term
    );

    console.log(
      `Gathered ${equivalents.length} equivalencies for ${school.name}`
    );

    return {
      updateOne: {
        filter: { _id: school.id },
        update: {
          $set: {
            _id: school.id,
            school: school.name,
            equivalents: equivalents,
            term: term,
          },
        },
        upsert: true,
      },
    };
  } catch (error) {
    console.log(error);
    // Handle the error, e.g., retry mechanism or logging
    return null; // or a default value, or you could re-throw the error depending on your use case
  }
}

async function bulkImportEquivalencies(client: MongoClient, operations: any[]) {
  const db = client.db("transfer");
  const collection = db.collection("equivalents");
  return collection.bulkWrite(operations);
}

const states = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "DC",
  "FL",
  "GA",
  "GU",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "PR",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VI",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];
