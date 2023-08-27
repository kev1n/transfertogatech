import axios from "axios";
import cheerio from "cheerio";

interface Level {
  id: "GS" | "US";
  name: "Graduate" | "Undergraduate";
}

interface Term {
  id: string;
  name: string;
}

const url = "https://oscar.gatech.edu/pls/bprod/wwsktrna.P_find_subj_levl";

export default async function getAllSubjectsInSchool(
  state: string | string[] | undefined,
  schoolId: string | string[] | undefined
) {
  // Send a post request with data of "state_in=stateSymbol" and "sbgi_in=schoolId"
  const response = await axios.post(
    url,
    `state_in=${state}&sbgi_in=${schoolId}`
  );
  const data = response.data;

  // Load HTML into cheerio
  const $ = cheerio.load(data);

  // Extract subjects, levels, and terms from the select elements
  const subjects: string[] = [];
  const levels: Level[] = [];
  const terms: Term[] = [];

  // Parse subjects
  $('select[name="sel_subj"]')
    .children("option")
    .each((index, element) => {
      subjects.push($(element).text());
    });

  // Parse levels
  $('select[name="levl_in"]')
    .children("option")
    .each((index, element) => {
      const id = $(element).attr("value");
      const name = $(element).text().trim();
      if (
        id &&
        (id === "GS" || id === "US") &&
        (name === "Graduate" || name === "Undergraduate")
      ) {
        levels.push({ id, name });
      }
    });

  // Parse terms
  $('select[name="term_in"]')
    .children("option")
    .each((index, element) => {
      const id = $(element).attr("value");
      const name = $(element).text().trim();
      if (id && name) {
        terms.push({ id, name });
      }
    });

  return { subjects, levels, terms };
}
