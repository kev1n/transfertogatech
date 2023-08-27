import axios from "axios";
import cheerio from "cheerio";

const url = "https://oscar.gatech.edu/pls/bprod/wwsktrna.P_find_state";

export default async function getAllStates() {
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