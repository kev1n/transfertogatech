import clientPromise from "@/lib/mongodb";
import mongoImportSchools from "@/lib/utils/mongo-helper/mongoImportSchools";

import mongoImportStates from "@/lib/utils/mongo-helper/mongoImportStates";
import mongoImportEquivalency from "@/lib/utils/mongo-helper/mongoImportEquivalency";
import mongoMonthlyRequestLimiter from "@/lib/utils/mongo-helper/mongoMonthlyRequestLimiter";

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

  const allSchools = await mongoImportSchools(client, states);
  console.log(`Gathering equivalencies for ${allSchools.length} schools`);

  for (let i = 0; i < allSchools.length; i++) {
    mongoImportEquivalency(client, allSchools[i]);
  }

  return new Response(JSON.stringify({ success: true }));
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
