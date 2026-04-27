import { Class } from "@/types/mongo/mongotypes";
import type { GroupedEquivalents } from "./groupByCoreArea";

/**
 * Parses the scraped className ("DEPT NUM") and returns the department prefix.
 * The Oscar page emits a non-breaking space between dept and number, so the
 * raw string contains *two* whitespace chars — any split on whitespace works.
 */
function departmentFrom(className: string): string {
  return className.split(/\s+/)[0] ?? className;
}

function hasRealCredits(equivalent: Class): boolean {
  return equivalent.creditHours !== "0.0";
}

/**
 * Groups every transferable class for a school by its source department.
 * Skips 0-credit entries (placeholders / cross-listed nulls).
 */
export function groupByDepartment(
  equivalents: Class[] | undefined
): GroupedEquivalents {
  const result: GroupedEquivalents = {};
  if (!equivalents) return result;

  for (const equivalent of equivalents) {
    if (!hasRealCredits(equivalent)) continue;
    const dept = departmentFrom(equivalent.className);
    (result[dept] ??= []).push(equivalent);
  }
  return result;
}
