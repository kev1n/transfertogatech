import { Class } from "@/types/mongo/mongotypes";
import { Requirement } from "@/assets/gatech/majors";
import { normalizeCourseCode } from "./normalize";

/**
 * GT uses these wildcards so a school's calc-2 equivalent matches even
 * when catalog numbers differ. Only applies to MATH 1552.
 */
const MATH_1552_ALIASES = new Set(["math1552", "math1x52", "math15x2"]);

export function matchesCourse(
  equivalent: Class,
  gtCourse: string
): boolean {
  const normalized = normalizeCourseCode(equivalent.gaEquivalent);
  if (gtCourse === "MATH 1552") {
    return MATH_1552_ALIASES.has(normalized);
  }
  return normalized === normalizeCourseCode(gtCourse);
}

export function filterByCourse(
  equivalents: Class[] | undefined,
  gtCourse: string
): Class[] {
  if (!equivalents) return [];
  return equivalents.filter((eq) => matchesCourse(eq, gtCourse));
}

export function filterByAnyCourse(
  equivalents: Class[] | undefined,
  gtCourses: string[]
): Class[] {
  if (!equivalents) return [];
  const targets = new Set(gtCourses.map(normalizeCourseCode));
  return equivalents.filter((eq) =>
    targets.has(normalizeCourseCode(eq.gaEquivalent))
  );
}

export interface ResolvedRequirement {
  kind: "single" | "any";
  gtCourses: string[];
  matches: Class[];
  label: string;
}

/**
 * Given a requirement from a major, find matching transfer equivalents.
 * - AND requirements → one entry per GT course (rendered as separate rows).
 * - OR requirements → a single "any of" entry.
 */
export function resolveRequirement(
  requirement: Requirement,
  equivalents: Class[] | undefined
): ResolvedRequirement[] {
  if (requirement.OR) {
    return [
      {
        kind: "any",
        gtCourses: requirement.OR,
        matches: filterByAnyCourse(equivalents, requirement.OR),
        label: requirement.OR.join(" OR "),
      },
    ];
  }
  if (requirement.AND) {
    return requirement.AND.map((gtCourse) => ({
      kind: "single",
      gtCourses: [gtCourse],
      matches: filterByCourse(equivalents, gtCourse),
      label: gtCourse,
    }));
  }
  return [];
}
