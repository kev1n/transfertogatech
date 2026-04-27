import { load } from "cheerio";
import { School } from "@/types/mongo/mongotypes";

export function parseSchools(html: string, state: string): School[] {
  const $ = load(html);
  const schools: School[] = [];

  $("option").each((_, element) => {
    const id = $(element).attr("value");
    const name = $(element).text();
    if (id && name) {
      schools.push({ id, name, state });
    }
  });

  return schools;
}
