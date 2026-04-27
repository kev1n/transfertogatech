import { Class } from "@/types/mongo/mongotypes";
import { cores } from "@/assets/gatech/core";
import { normalizeCourseCode } from "./normalize";

export type GroupedEquivalents = Record<string, Class[]>;

/**
 * Groups a school's transferable classes by Georgia Tech's core-curriculum
 * areas (Area A1, Area C, Ethics, Wellness, etc.).
 */
export function groupByCoreArea(
  equivalents: Class[] | undefined
): GroupedEquivalents {
  const result: GroupedEquivalents = {};
  const safeEquivalents = equivalents ?? [];

  for (const [areaName, area] of Object.entries(cores)) {
    const normalizedCourses = new Set(area.courses.map(normalizeCourseCode));
    result[areaName] = safeEquivalents.filter((eq) =>
      normalizedCourses.has(normalizeCourseCode(eq.gaEquivalent))
    );
  }
  return result;
}
