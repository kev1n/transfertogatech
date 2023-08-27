import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import cheerio from "cheerio";

type StatesData = {
  states: string[];
};

const url = "https://oscar.gatech.edu/pls/bprod/wwsktrna.P_find_state";

export async function getAllStates() {
  const request = await axios.post(url);
  const data = request.data;

  const $ = cheerio.load(data); // Load the HTML into cheerio

  const stateList: string[] = [];

  // Select all option tags and iterate over them
  $("option").each((index, element) => {
    const state = $(element).attr("value");
    if (state) {
      stateList.push(state);
    }
  });

  return stateList;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StatesData>
) {
  const stateList = await getAllStates();

  res.status(200).json({ states: stateList });
}
