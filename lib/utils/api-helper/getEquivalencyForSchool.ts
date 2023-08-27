import axios from "axios";
import cheerio from "cheerio";

interface Class {
  className: string;
  title: string;
  level: string;
  minimumGrade: string;
  gaEquivalent: string;
  gaEquivalentTitle: string;
  creditHours: string;
}

const url =
  "https://oscar.gatech.edu/pls/bprod/wwsktrna.P_find_subj_levl_classes";

export default async function getEquivalencyForSchool(
  state: string | string[],
  schoolId: string | string[],
  subject: string | string[],
  term: string | string[]
) {
  let params = new URLSearchParams();
  params.append("state_in", state as string);
  params.append("nation_in", "");
  params.append("levl_in", "US");
  params.append("term_in", term as string);
  params.append("sbgi_in", schoolId as string);
  params.append("school_in", "");

  for (let i = 0; i < subject.length; i++) {
    params.append("sel_subj", subject[i]);
  }

  const config = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };
  const response = await axios.post(
    "https://oscar.gatech.edu/pls/bprod/wwsktrna.P_find_subj_levl_classes",
    new URLSearchParams(params),
    config
  );

  const $ = cheerio.load(response.data);

  const table = $("table[CLASS='datadisplaytable']");

  const rows = table.find("tr");
  const classes: Class[] = [];

  rows.each((index, row) => {
    // Ignore the header
    if (index < 2) return; //get rid of header

    const columns = $(row).find("td");

    if (columns.length > 0) {
      const classEntry: Class = {
        className: $(columns[0]).text().trim(),
        title: $(columns[1]).text().trim(),
        level: $(columns[2]).text().trim(),
        minimumGrade: $(columns[4]).text().trim(),
        gaEquivalent: $(columns[7]).text().trim(),
        gaEquivalentTitle: $(columns[8]).text().trim(),
        creditHours: $(columns[9]).text().trim(),
      };

      classes.push(classEntry);
    }
  });
  return classes;
}
