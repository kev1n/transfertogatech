/**
 * Visual identity per subject. Each style ships both light and dark
 * variants so the section pills don't blow out the eyes in dark mode.
 *
 * `hue` = vivid color (icon bg, section label).
 * `hueSoft` = tinted section background.
 */

export interface SubjectStyle {
  label: string;
  hue: string;
  hueSoft: string;
  hueDark: string;
  hueSoftDark: string;
}

const PALETTE: Record<string, SubjectStyle> = {
  ENGLISH: { label: "English",         hue: "224 60% 33%", hueSoft: "224 65% 90%", hueDark: "224 70% 70%", hueSoftDark: "224 35% 16%" },
  MATH:    { label: "Mathematics",     hue: "39 65% 44%",  hueSoft: "41 89% 88%",  hueDark: "39 75% 65%",  hueSoftDark: "39 35% 16%" },
  CS:      { label: "Computer Science",hue: "270 45% 44%", hueSoft: "270 50% 92%", hueDark: "270 55% 72%", hueSoftDark: "270 25% 17%" },
  CHEM1:   { label: "Chemistry",       hue: "168 73% 30%", hueSoft: "165 50% 90%", hueDark: "168 55% 60%", hueSoftDark: "168 30% 14%" },
  CHEM2:   { label: "Chemistry II",    hue: "168 73% 30%", hueSoft: "165 50% 90%", hueDark: "168 55% 60%", hueSoftDark: "168 30% 14%" },
  PHYS:    { label: "Physics",         hue: "215 50% 48%", hueSoft: "215 60% 91%", hueDark: "215 65% 70%", hueSoftDark: "215 30% 16%" },
  BIOLOGY: { label: "Biology",         hue: "145 44% 33%", hueSoft: "145 35% 88%", hueDark: "145 50% 60%", hueSoftDark: "145 25% 14%" },
  LAB1:    { label: "Lab Science 1",   hue: "11 53% 49%",  hueSoft: "10 75% 90%",  hueDark: "11 65% 65%",  hueSoftDark: "10 35% 17%" },
  LAB2:    { label: "Lab Science 2",   hue: "11 53% 49%",  hueSoft: "10 75% 90%",  hueDark: "11 65% 65%",  hueSoftDark: "10 35% 17%" },
};

const FALLBACK: SubjectStyle = {
  label: "",
  hue: "30 11% 46%",
  hueSoft: "39 41% 86%",
  hueDark: "30 15% 60%",
  hueSoftDark: "30 10% 18%",
};

export function subjectStyle(subject: string): SubjectStyle {
  return PALETTE[subject] ?? { ...FALLBACK, label: subject };
}

export function resolveStyle(
  style: SubjectStyle,
  isDark: boolean
): { hue: string; hueSoft: string } {
  return isDark
    ? { hue: style.hueDark, hueSoft: style.hueSoftDark }
    : { hue: style.hue, hueSoft: style.hueSoft };
}

/**
 * Picks a high-contrast text/icon color for an HSL background. Returns the
 * literal CSS color (not a class) so it works for both Tailwind utility
 * classes can't reach. Threshold of 55 lightness was tuned against the
 * warm-almanac palette (gold sits at L=44% in light mode and L=65% in dark
 * mode, so the dark-mode variant correctly flips to ink).
 */
export function readableInkOnHsl(hsl: string): string {
  const match = /^\s*\d+\s+\d+%\s+(\d+)%\s*$/.exec(hsl);
  const lightness = match ? Number(match[1]) : 50;
  return lightness > 55 ? "hsl(30 41% 7%)" /* warm ink */ : "#ffffff";
}
