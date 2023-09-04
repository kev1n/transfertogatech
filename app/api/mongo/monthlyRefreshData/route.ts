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

  //logic
  const states = await mongoImportStates(client);

  const allSchools = await mongoImportSchools(client, states);
  console.log(`Gathering equivalencies for ${allSchools.length} schools`);

  for (let i = 0; i < allSchools.length; i++) {
    mongoImportEquivalency(client, allSchools[i]);
  }

  return new Response(JSON.stringify({ success: true }));
}
