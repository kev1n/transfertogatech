/**
 * Visual identity per subject: hue + label. Colors are HSL strings consumed
 * via inline style or Tailwind arbitrary values. Each subject pairs a
 * "strong" hue with a "soft" tinted background.
 */

export interface SubjectStyle {
  label: string;
  hue: string;     // HSL — used for accents (text, button bg)
  hueSoft: string; // HSL — used for section background tint
}

const PALETTE: Record<string, SubjectStyle> = {
  ENGLISH: { label: "English", hue: "224 60% 33%", hueSoft: "224 65% 90%" },
  MATH:    { label: "Mathematics", hue: "39 65% 44%", hueSoft: "41 89% 88%" },
  CS:      { label: "Computer Science", hue: "270 45% 44%", hueSoft: "270 50% 92%" },
  CHEM1:   { label: "Chemistry", hue: "168 73% 30%", hueSoft: "165 50% 90%" },
  CHEM2:   { label: "Chemistry II", hue: "168 73% 30%", hueSoft: "165 50% 90%" },
  PHYS:    { label: "Physics", hue: "215 50% 48%", hueSoft: "215 60% 91%" },
  BIOLOGY: { label: "Biology", hue: "145 44% 33%", hueSoft: "145 35% 88%" },
  LAB1:    { label: "Lab Science 1", hue: "11 53% 49%", hueSoft: "10 75% 90%" },
  LAB2:    { label: "Lab Science 2", hue: "11 53% 49%", hueSoft: "10 75% 90%" },
};

export function subjectStyle(subject: string): SubjectStyle {
  return PALETTE[subject] ?? { label: subject, hue: "30 11% 46%", hueSoft: "39 41% 86%" };
}
