/**
 * GT requires up to two lab-science electives. The major catalog encodes
 * these as `LAB1` and `LAB2` requirements. The UI labels them generically
 * (since they're a pick-from-many) and `LAB2` carries a CS-specific
 * disclaimer that the two-course sequence rule applies.
 */

export const LAB_SUBJECT_KEYS = ["LAB1", "LAB2"] as const;
export type LabSubjectKey = (typeof LAB_SUBJECT_KEYS)[number];

export const LAB_REQUIREMENT_LABEL = "CHEM, BIO, PHYS, or EAS lab";

export function isLabSubject(subjectName: string): subjectName is LabSubjectKey {
  return (LAB_SUBJECT_KEYS as readonly string[]).includes(subjectName);
}

export function labDisclaimer(
  subjectName: LabSubjectKey
): string | undefined {
  if (subjectName === "LAB2") {
    return "NOTE: If you are in computer science, you need a two-course lab science SEQUENCE.";
  }
  return undefined;
}
