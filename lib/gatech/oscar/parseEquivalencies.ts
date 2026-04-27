import cheerio from "cheerio";
import { Class } from "@/types/mongo/mongotypes";

/**
 * Oscar renders equivalency tables as HTML. Some transfer courses map to
 * multiple GT courses — they appear as a primary row followed by one or
 * more continuation rows with an empty first column. Each continuation
 * extends the previous class with an additional GT equivalent.
 */
export function parseEquivalencies(html: string): Class[] {
  const $ = cheerio.load(html);
  const rows = $("table[CLASS='datadisplaytable']").find("tr");
  const classes: Class[] = [];

  rows.each((index, row) => {
    if (index < 2) return; // header rows
    const columns = $(row).find("td");
    if (columns.length === 0) return;

    const isContinuationRow = !$(columns[0]).text().trim();
    if (isContinuationRow) {
      const previous = classes[classes.length - 1];
      if (!previous) return;
      classes.push({
        ...previous,
        gaEquivalent: $(columns[1]).text().trim(),
        gaEquivalentTitle: $(columns[2]).text().trim(),
        creditHours: $(columns[3]).text().trim(),
      });
      return;
    }

    classes.push({
      className: $(columns[0]).text().trim(),
      title: $(columns[1]).text().trim(),
      level: $(columns[2]).text().trim(),
      minimumGrade: $(columns[4]).text().trim(),
      gaEquivalent: $(columns[7]).text().trim(),
      gaEquivalentTitle: $(columns[8]).text().trim(),
      creditHours: $(columns[9]).text().trim(),
    });
  });

  return classes;
}
