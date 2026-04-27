import cheerio from "cheerio";

export type Level = { id: "GS" | "US"; name: "Graduate" | "Undergraduate" };
export type Term = { id: string; name: string };

export interface SchoolSubjects {
  subjects: string[];
  levels: Level[];
  terms: Term[];
}

function isLevel(id: string | undefined, name: string): Level | null {
  if (id === "GS" && name === "Graduate") return { id, name };
  if (id === "US" && name === "Undergraduate") return { id, name };
  return null;
}

export function parseSubjects(html: string): SchoolSubjects {
  const $ = cheerio.load(html);

  const subjects: string[] = [];
  $('select[name="sel_subj"] > option').each((_, el) => {
    subjects.push($(el).text());
  });

  const levels: Level[] = [];
  $('select[name="levl_in"] > option').each((_, el) => {
    const level = isLevel($(el).attr("value"), $(el).text().trim());
    if (level) levels.push(level);
  });

  const terms: Term[] = [];
  $('select[name="term_in"] > option').each((_, el) => {
    const id = $(el).attr("value");
    const name = $(el).text().trim();
    if (id && name) terms.push({ id, name });
  });

  return { subjects, levels, terms };
}
