import { load } from "cheerio";

export function parseStates(html: string): string[] {
  const $ = load(html);
  const states: string[] = [];
  $("option").each((_, element) => {
    const value = $(element).attr("value");
    if (value) states.push(value);
  });
  return states;
}
