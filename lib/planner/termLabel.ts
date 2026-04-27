/**
 * Decodes Oscar/Banner term IDs into human-readable labels.
 *
 * Format: YYYYTT where YYYY is the academic year and TT is the semester.
 * Conventional Banner codes:
 *   02 = Spring
 *   05 = Summer
 *   08 = Fall
 *
 * The crawler always picks `terms[0].id` from Oscar's response, which is
 * the most recent / upcoming term — so this is the term the equivalency
 * data is currently valid for.
 */

const SEMESTER_NAMES: Record<string, string> = {
  "02": "Spring",
  "05": "Summer",
  "08": "Fall",
};

export function formatTermLabel(termId: string | undefined): string {
  if (!termId) return "Unknown term";
  const match = /^(\d{4})(\d{2})$/.exec(termId);
  if (!match) return termId;
  const [, year, code] = match;
  const season = SEMESTER_NAMES[code];
  if (!season) return `Term ${termId}`;
  return `${season} ${year}`;
}
