import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../lib/mongodb";
import mongoImportSchools from "../utils/mongo-helper/mongoImportSchools";
import mongoImportStates from "../utils/mongo-helper/mongoImportStates";
import mongoImportEquivalency from "../utils/mongo-helper/mongoImportEquivalency";
import mongoMonthlyRequestLimiter from "../utils/mongo-helper/mongoMonthlyRequestLimiter";

type SuccessResponseData = {
  success: true;
};

type ErrorResponseData = {
  success: false;
  error: string;
};
export type ResponseData = SuccessResponseData | ErrorResponseData;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const client = await clientPromise;
  await client.connect();

  const shouldProceed = await mongoMonthlyRequestLimiter(client);

  if (!shouldProceed) {
    return res.status(403).json({
      success: false,
      error: "This route can only be accessed once per month.",
    });
  }

  //logic
  const states = await mongoImportStates(client);
  
  const allSchools = await mongoImportSchools(client, states);
  console.log(`Gathering equivalencies for ${allSchools.length} schools`)

  for (let i = 0; i < allSchools.length; i++) {
    mongoImportEquivalency(client, allSchools[i]);
  }

  res.status(200).json({ success: true });
}
