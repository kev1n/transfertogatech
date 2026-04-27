/**
 * Lookup of Georgia Tech course code → official title.
 *
 * Used to label AP-granted GT courses in the UI. Transfer-credit picks
 * already carry the GT title from the scraped Oscar data (`gaEquivalentTitle`),
 * so they don't need this map. AP grants reference courses by code only,
 * so we resolve here.
 *
 * Verified via catalog.gatech.edu (course-az pages, 2026). Placeholder
 * codes ending in `XXX` are GT's "any course in this dept at this level"
 * shorthand — see `formatGtCourseTitle` for handling.
 */

const TITLES: Record<string, string> = {
  // English
  "ENGL 1101": "English Composition I",
  "ENGL 1102": "English Composition II",
  // Math
  "MATH 1113": "Pre-calculus",
  "MATH 1551": "Differential Calculus",
  "MATH 1552": "Integral Calculus",
  "MATH 1553": "Introduction to Linear Algebra",
  "MATH 1554": "Linear Algebra",
  "MATH 1711": "Finite Mathematics",
  "MATH 1712": "Survey of Calculus",
  // Computer Science
  "CS 1301": "Introduction to Computing",
  "CS 1371": "Computing for Engineers",
  // Chemistry
  "CHEM 1211K": "Principles of Chemistry I",
  "CHEM 1212K": "Principles of Chemistry II",
  "CHEM 1310": "Principles of General Chemistry for Engineers",
  // Biology
  "BIOS 1107": "Principles of Biology I",
  "BIOS 1107L": "Principles of Biology I Laboratory",
  "BIOS 1108": "Principles of Biology II",
  "BIOS 1108L": "Principles of Biology II Laboratory",
  // Physics
  "PHYS 2211": "Principles of Physics I",
  "PHYS 2212": "Principles of Physics II",
  // Earth & Atmospheric Sciences
  "EAS 1600": "Introduction to Environmental Science",
  "EAS 1601": "Habitable Planet",
  "EAS 2600": "Earth Processes",
  // History / HTS / Government
  "HIST 2111": "Survey of U.S. History I",
  "HIST 2112": "Survey of U.S. History II",
  "HTS 1031": "Europe Since the Renaissance",
  "POL 1101": "Government of the United States",
  "INTA 1200": "American Government in Comparative Perspective",
  // Economics
  "ECON 2105": "Principles of Macroeconomics",
  "ECON 2106": "Principles of Microeconomics",
  // Psychology
  "PSYC 1101": "Introduction to General Psychology",
  // Music / Industrial Design
  "MUSI 2700": "Introduction to Music Theory",
  "ID 2242": "History of Art 2",
  // Languages — Spanish
  "SPAN 1001": "Elementary Spanish I",
  "SPAN 1002": "Elementary Spanish II",
  "SPAN 2001": "Intermediate Spanish I",
  "SPAN 2002": "Intermediate Spanish II",
  "SPAN 3050": "Introduction to Reading Hispanic Literature",
  // Languages — French
  "FREN 1001": "Elementary French I",
  "FREN 1002": "Elementary French II",
  "FREN 2001": "Intermediate French I",
  "FREN 2002": "Intermediate French II",
  // Languages — German
  "GRMN 1001": "Elementary German I",
  "GRMN 1002": "Elementary German II",
  "GRMN 2001": "Intermediate German I",
  "GRMN 2002": "Intermediate German II",
  // Languages — Japanese
  "JAPN 1001": "Elementary Japanese I",
  "JAPN 1002": "Elementary Japanese II",
  "JAPN 2001": "Intermediate Japanese I",
  "JAPN 2002": "Intermediate Japanese II",
  "JAPN 3001": "Advanced Japanese I",
  // Languages — Chinese
  "CHIN 1001": "Elementary Chinese I",
  "CHIN 1002": "Elementary Chinese II",
  "CHIN 2001": "Intermediate Chinese I",
  "CHIN 2002": "Intermediate Chinese II",
};

const PLACEHOLDER_DEPT_LABELS: Record<string, string> = {
  HTS: "History, Technology, and Society",
  CS: "Computer Science",
  CHIN: "Chinese",
  FREN: "French",
  GRMN: "German",
  JAPN: "Japanese",
  SPAN: "Spanish",
  LATN: "Latin",
  ARCH: "Architecture",
  MUSI: "Music",
  PHYS: "Physics",
  SS: "Social Science",
  HUM: "Humanities",
  LMC: "Literature, Media, & Communication",
};

/**
 * Returns a display-friendly title for a GT course code.
 * - Specific course (e.g., "MATH 1551") → official title.
 * - Placeholder (e.g., "CHIN 3XXX")     → "Chinese 3000-level elective".
 * - Unknown                            → undefined.
 */
export function formatGtCourseTitle(code: string): string | undefined {
  const direct = TITLES[code];
  if (direct) return direct;

  const placeholder = /^([A-Z]+)\s+(\d)X{2,3}$/.exec(code);
  if (placeholder) {
    const [, dept, level] = placeholder;
    const deptLabel = PLACEHOLDER_DEPT_LABELS[dept] ?? dept;
    return `${deptLabel} ${level}000-level elective`;
  }
  return undefined;
}
