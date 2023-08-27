import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import cheerio from "cheerio";

type ResponseData = {
  schools: School[];
};

export interface School {
  id: string;
  name: string;
  state: string;
}

const url = "https://oscar.gatech.edu/pls/bprod/wwsktrna.P_find_school";

export async function getSchoolsInState(state: string | string[] | undefined) {
  // Make the request to the Oscar API with the form data of "state_in=stateSymbol"
  const response = await axios.post(url, `state_in=${state}`);

  const $ = cheerio.load(response.data); // Load the HTML into cheerio

  const schoolList: School[] = [];

  // Select all option tags and iterate over them
  $("option").each((index, element) => {
    const schoolId = $(element).attr("value");
    const schoolName = $(element).text();
    if (schoolId && schoolName) {
      schoolList.push({ id: schoolId, name: schoolName, state: state as string });
    }
  });
  return schoolList;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Get the state symbol from the request
  const state = req.query.state;

  const schoolList = await getSchoolsInState(state);

  res.status(200).json({ schools: schoolList });
}
