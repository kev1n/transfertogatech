/**
 * Bins a transferable equivalent into one of GT's elective buckets.
 * Heuristic (department-prefix based) but matches how GT classifies
 * these for elective credit. Each category ships light + dark color
 * variants so the section pills behave in dark mode.
 */

import { Class } from "@/types/mongo/mongotypes";

export type ElectiveCategoryKey =
  | "humanities"
  | "social-science"
  | "language"
  | "arts"
  | "stem-elective"
  | "wellness"
  | "other";

export interface ElectiveCategory {
  key: ElectiveCategoryKey;
  label: string;
  hue: string;
  hueSoft: string;
  hueDark: string;
  hueSoftDark: string;
  note: string;
}

export const ELECTIVE_CATEGORIES: ElectiveCategory[] = [
  {
    key: "humanities",
    label: "Humanities",
    hue: "224 60% 33%",
    hueSoft: "224 65% 90%",
    hueDark: "224 70% 70%",
    hueSoftDark: "224 35% 16%",
    note: "Lit, history, philosophy. Counts toward GT's humanities elective bucket.",
  },
  {
    key: "social-science",
    label: "Social Sciences",
    hue: "270 45% 44%",
    hueSoft: "270 50% 92%",
    hueDark: "270 55% 72%",
    hueSoftDark: "270 25% 17%",
    note: "Psychology, econ, government. Counts toward social-science elective bucket.",
  },
  {
    key: "language",
    label: "Foreign Language",
    hue: "168 73% 30%",
    hueSoft: "165 50% 90%",
    hueDark: "168 55% 60%",
    hueSoftDark: "168 30% 14%",
    note: "Two semesters of one language fulfills the language requirement for some majors.",
  },
  {
    key: "arts",
    label: "Fine Arts",
    hue: "11 53% 49%",
    hueSoft: "10 75% 90%",
    hueDark: "11 65% 65%",
    hueSoftDark: "10 35% 17%",
    note: "Music, art, film. Counts toward humanities elective bucket.",
  },
  {
    key: "stem-elective",
    label: "STEM Electives",
    hue: "215 50% 48%",
    hueSoft: "215 60% 91%",
    hueDark: "215 65% 70%",
    hueSoftDark: "215 30% 16%",
    note: "Extra math/science not used as a core lab. Useful for free electives or minors.",
  },
  {
    key: "wellness",
    label: "Wellness & PE",
    hue: "145 44% 33%",
    hueSoft: "145 35% 88%",
    hueDark: "145 50% 60%",
    hueSoftDark: "145 25% 14%",
    note: "GT requires 2 credit-hours of wellness; PE classes can satisfy it.",
  },
  {
    key: "other",
    label: "Other Transferable",
    hue: "30 11% 46%",
    hueSoft: "39 41% 86%",
    hueDark: "30 15% 60%",
    hueSoftDark: "30 10% 18%",
    note: "Transfers to GT as free elective credit.",
  },
];

export function resolveCategoryColors(
  cat: ElectiveCategory,
  isDark: boolean
): { hue: string; hueSoft: string } {
  return isDark
    ? { hue: cat.hueDark, hueSoft: cat.hueSoftDark }
    : { hue: cat.hue, hueSoft: cat.hueSoft };
}

const HUMANITIES_PREFIXES = new Set([
  "ENGL", "HIST", "PHIL", "REL", "RELS", "LIT", "HUM", "HTS",
]);
const SOCIAL_SCIENCE_PREFIXES = new Set([
  "PSYC", "PSY", "POL", "POLS", "GOVT", "ECON", "SOCI", "SOC",
  "ANTH", "ANT", "GEOG", "PUBP", "INTA", "SS",
]);
const LANGUAGE_PREFIXES = new Set([
  "SPAN", "FREN", "GRMN", "GER", "JAPN", "JPN", "CHIN", "ITAL",
  "RUSS", "KOR", "ARBC", "PERS", "LATN", "PORT", "LANG", "ML",
]);
const ARTS_PREFIXES = new Set([
  "MUSI", "MUS", "ARTH", "ART", "FILM", "THEA", "DANC", "DAN",
  "ARCH", "ID", "DRAW", "PERF",
]);
const STEM_PREFIXES = new Set([
  "MATH", "STAT", "STT", "ASTR", "AST", "GEOL", "GEO", "PHYS",
  "CHEM", "BIOS", "BIOL", "BIO", "CS", "CSC", "EAS", "ENVS",
  "ENGR", "ME", "EE", "ECE", "ISYE", "AE", "BMED", "MSE", "CHBE",
  "NRE", "NEUR", "NRSC",
]);
const WELLNESS_PREFIXES = new Set([
  "PE", "APPH", "KH", "PERS", "WELL", "HEAL",
]);

function deptOf(className: string): string {
  return className.split(/\s+/)[0]?.toUpperCase() ?? "";
}

export function categorize(equivalent: Class): ElectiveCategoryKey {
  const dept = deptOf(equivalent.className);
  if (LANGUAGE_PREFIXES.has(dept)) return "language";
  if (HUMANITIES_PREFIXES.has(dept)) return "humanities";
  if (SOCIAL_SCIENCE_PREFIXES.has(dept)) return "social-science";
  if (ARTS_PREFIXES.has(dept)) return "arts";
  if (STEM_PREFIXES.has(dept)) return "stem-elective";
  if (WELLNESS_PREFIXES.has(dept)) return "wellness";
  return "other";
}

export function groupElectivesByCategory(
  equivalents: Class[]
): Record<ElectiveCategoryKey, Class[]> {
  const result: Record<ElectiveCategoryKey, Class[]> = {
    humanities: [],
    "social-science": [],
    language: [],
    arts: [],
    "stem-elective": [],
    wellness: [],
    other: [],
  };
  for (const eq of equivalents) {
    if (eq.creditHours === "0.0") continue;
    result[categorize(eq)].push(eq);
  }
  return result;
}
