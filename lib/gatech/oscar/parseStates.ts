import cheerio from "cheerio";

export function parseStates(html: string): string[] {
  const $ = cheerio.load(html);
  const states: string[] = [];
  $("option").each((_, element) => {
    const value = $(element).attr("value");
    if (value) states.push(value);
  });
  return states;
}
