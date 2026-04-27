/**
 * Course-code normalizer. Strips all whitespace (including the non-breaking
 * space Oscar injects between department and number) and lowercases.
 *
 * Why: scraped `className` uses "DEPT  NUMBER", while static GT
 * course IDs use regular spaces — they must compare equal.
 */
export function normalizeCourseCode(value: string): string {
  return value.replace(/\s/g, "").toLowerCase();
}
