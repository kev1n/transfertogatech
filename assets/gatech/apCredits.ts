/**
 * AP exam → GT course credit table.
 * Source: Georgia Tech's published AP credit chart.
 *
 * Each grant is { score: 3|4|5, courses: string[], credits: number }. A score
 * earns ALL listed courses (e.g., AP Calc BC at 4+ grants both MATH 1551 +
 * MATH 1552). When multiple score tiers exist, a higher score grants the
 * higher tier (no double-counting — pickHighestGrant resolves this).
 */

export interface APGrant {
  score: 3 | 4 | 5;
  courses: string[];
  credits: number;
}

export interface APExam {
  id: string;
  name: string;
  grants: APGrant[];
  /** Optional note shown in the picker ("Counts as social-science elective"). */
  note?: string;
}

export const AP_EXAMS: APExam[] = [
  { id: "ap-african-american-studies", name: "AP African American Studies", grants: [{ score: 4, courses: ["HTS 1XXX"], credits: 3 }] },
  { id: "ap-art-history", name: "AP Art History", grants: [{ score: 4, courses: ["ID 2242"], credits: 3 }] },
  { id: "ap-biology", name: "AP Biology", grants: [{ score: 4, courses: ["BIOS 1107", "BIOS 1107L"], credits: 4 }] },
  { id: "ap-calc-ab", name: "AP Calculus AB", grants: [{ score: 4, courses: ["MATH 1551"], credits: 2 }] },
  { id: "ap-calc-bc", name: "AP Calculus BC", grants: [{ score: 4, courses: ["MATH 1551", "MATH 1552"], credits: 6 }] },
  { id: "ap-precalc", name: "AP Precalculus", grants: [{ score: 4, courses: ["MATH 1113"], credits: 4 }] },
  { id: "ap-chem", name: "AP Chemistry", grants: [
    { score: 4, courses: ["CHEM 1211K"], credits: 4 },
    { score: 5, courses: ["CHEM 1310"], credits: 4 },
  ]},
  { id: "ap-chinese", name: "AP Chinese Language and Culture", grants: [
    { score: 3, courses: ["CHIN 1001", "CHIN 1002"], credits: 8 },
    { score: 4, courses: ["CHIN 1002", "CHIN 2001", "CHIN 2002"], credits: 10 },
    { score: 5, courses: ["CHIN 2001", "CHIN 2002", "CHIN 3XXX"], credits: 9 },
  ]},
  { id: "ap-cs-a", name: "AP Computer Science A", grants: [{ score: 4, courses: ["CS 1301"], credits: 3 }] },
  { id: "ap-cs-p", name: "AP Computer Science Principles", grants: [{ score: 4, courses: ["CS 1XXX"], credits: 3 }] },
  { id: "ap-eng-lang", name: "AP English Language and Composition", grants: [{ score: 4, courses: ["ENGL 1101"], credits: 3 }] },
  { id: "ap-eng-lit", name: "AP English Literature and Composition", grants: [{ score: 4, courses: ["ENGL 1101"], credits: 3 }] },
  { id: "ap-env", name: "AP Environmental Science", grants: [{ score: 4, courses: ["EAS 1600"], credits: 4 }] },
  { id: "ap-euro-history", name: "AP European History", grants: [{ score: 4, courses: ["HTS 1031"], credits: 3 }] },
  { id: "ap-french", name: "AP French Language and Culture", grants: [
    { score: 3, courses: ["FREN 1001", "FREN 1002"], credits: 6 },
    { score: 4, courses: ["FREN 1002", "FREN 2001", "FREN 2002"], credits: 9 },
    { score: 5, courses: ["FREN 2001", "FREN 2002", "FREN 3XXX"], credits: 9 },
  ]},
  { id: "ap-german", name: "AP German Language and Culture", grants: [
    { score: 3, courses: ["GRMN 1001", "GRMN 1002"], credits: 6 },
    { score: 4, courses: ["GRMN 1002", "GRMN 2001", "GRMN 2002"], credits: 9 },
    { score: 5, courses: ["GRMN 2001", "GRMN 2002", "GRMN 3XXX"], credits: 9 },
  ]},
  { id: "ap-gov-comparative", name: "AP Government and Politics: Comparative", grants: [{ score: 4, courses: ["INTA 1200"], credits: 3 }] },
  { id: "ap-gov-us", name: "AP Government and Politics: U.S.", grants: [{ score: 4, courses: ["POL 1101"], credits: 3 }] },
  { id: "ap-human-geo", name: "AP Human Geography", grants: [{ score: 4, courses: ["SS 1XXX"], credits: 3 }] },
  { id: "ap-japanese", name: "AP Japanese Language and Culture", grants: [
    { score: 3, courses: ["JAPN 1001", "JAPN 1002"], credits: 8 },
    { score: 4, courses: ["JAPN 1002", "JAPN 2001", "JAPN 2002"], credits: 10 },
    { score: 5, courses: ["JAPN 2001", "JAPN 2002", "JAPN 3001"], credits: 9 },
  ]},
  { id: "ap-latin", name: "AP Latin", grants: [{ score: 4, courses: ["LATN 2XXX"], credits: 6 }] },
  { id: "ap-macro", name: "AP Macroeconomics", grants: [{ score: 4, courses: ["ECON 2105"], credits: 3 }] },
  { id: "ap-micro", name: "AP Microeconomics", grants: [{ score: 4, courses: ["ECON 2106"], credits: 3 }] },
  { id: "ap-music-theory", name: "AP Music Theory", grants: [{ score: 4, courses: ["MUSI 2700"], credits: 3 }] },
  { id: "ap-phys-b", name: "AP Physics B", grants: [{ score: 4, courses: ["PHYS 2XXX"], credits: 3 }] },
  { id: "ap-phys-c-mech", name: "AP Physics C: Mechanics", grants: [{ score: 5, courses: ["PHYS 2211"], credits: 4 }] },
  { id: "ap-phys-c-em", name: "AP Physics C: E&M", grants: [{ score: 5, courses: ["PHYS 2212"], credits: 4 }] },
  { id: "ap-phys-1", name: "AP Physics 1: Algebra-Based", grants: [{ score: 4, courses: ["PHYS 2XXX"], credits: 3 }] },
  { id: "ap-phys-2", name: "AP Physics 2: Algebra-Based", grants: [{ score: 4, courses: ["PHYS 2XXX"], credits: 3 }] },
  { id: "ap-psych", name: "AP Psychology", grants: [{ score: 4, courses: ["PSYC 1101"], credits: 3 }] },
  { id: "ap-spanish-lang", name: "AP Spanish Language and Culture", grants: [
    { score: 3, courses: ["SPAN 1001", "SPAN 1002"], credits: 6 },
    { score: 4, courses: ["SPAN 1002", "SPAN 2001", "SPAN 2002"], credits: 9 },
    { score: 5, courses: ["SPAN 2001", "SPAN 2002", "SPAN 3XXX"], credits: 9 },
  ]},
  { id: "ap-spanish-lit", name: "AP Spanish Literature and Culture", grants: [
    { score: 3, courses: ["SPAN 1001", "SPAN 1002"], credits: 6 },
    { score: 4, courses: ["SPAN 1002", "SPAN 2001", "SPAN 2002"], credits: 9 },
    { score: 5, courses: ["SPAN 2001", "SPAN 2002", "SPAN 3050"], credits: 9 },
  ]},
  { id: "ap-studio-2d", name: "AP Studio Art: 2-D Design", grants: [{ score: 4, courses: ["ARCH 1XXX"], credits: 3 }] },
  { id: "ap-studio-3d", name: "AP Studio Art: 3-D Design", grants: [{ score: 4, courses: ["ARCH 1XXX"], credits: 3 }] },
  { id: "ap-us-history", name: "AP U.S. History", grants: [{ score: 4, courses: ["HIST 2111"], credits: 3 }] },
  { id: "ap-world-history", name: "AP World History", grants: [{ score: 4, courses: ["HTS 1XXX"], credits: 3 }] },
];

const AP_INDEX: Record<string, APExam> = Object.fromEntries(
  AP_EXAMS.map((e) => [e.id, e])
);

export function findAPExam(id: string): APExam | undefined {
  return AP_INDEX[id];
}

/**
 * Returns the highest-tier grant for a given score (e.g., score=5 on AP
 * Chemistry returns the score-5 grant, not the score-4 grant).
 */
export function pickGrantForScore(
  exam: APExam,
  score: 3 | 4 | 5
): APGrant | undefined {
  const eligible = exam.grants.filter((g) => g.score <= score);
  if (eligible.length === 0) return undefined;
  return eligible.reduce((best, g) => (g.score > best.score ? g : best));
}

/**
 * Returns AP exams that grant credit for a given GT course code, paired
 * with the minimum score required.
 */
export function apExamsThatGrant(gtCourse: string): Array<{
  exam: APExam;
  minScore: 3 | 4 | 5;
}> {
  const result: Array<{ exam: APExam; minScore: 3 | 4 | 5 }> = [];
  for (const exam of AP_EXAMS) {
    const granting = exam.grants.find((g) => g.courses.includes(gtCourse));
    if (granting) result.push({ exam, minScore: granting.score });
  }
  return result;
}
