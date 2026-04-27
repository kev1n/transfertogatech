import { Requirement } from "@/assets/gatech/majors";

/**
 * A slot is a single "row" in the planner — one thing the student needs
 * to satisfy. It's a flattened view of the major's nested requirements:
 *
 *   AND requirements → one slot per course
 *   OR requirements  → one slot in "choose-one" mode
 *
 * Slot keys are unique within a major and are what the share URL
 * references (so the URL stays stable across re-renders).
 */

export type Slot =
  | {
      kind: "single";
      key: string;
      subject: string;
      gtCourse: string;
    }
  | {
      kind: "choose-one";
      key: string;
      subject: string;
      label: string;
      options: string[];
    };

const SUBJECT_LABELS: Record<string, string> = {
  ENGLISH: "English",
  MATH: "Mathematics",
  CS: "Computer Science",
  CHEM1: "Chemistry I",
  CHEM2: "Chemistry II",
  PHYS: "Physics",
  BIOLOGY: "Biology",
  LAB1: "Lab Science 1",
  LAB2: "Lab Science 2",
};

export function subjectLabel(subject: string): string {
  return SUBJECT_LABELS[subject] ?? subject;
}

const LAB_SUBJECT_LABEL = "CHEM, BIO, PHYS, or EAS lab";

/**
 * Flattens a major's requirements map into an ordered list of slots.
 * AND → one slot per course; OR → one choose-one slot.
 */
export function buildSlots(
  requirements: Record<string, Requirement>
): Slot[] {
  const slots: Slot[] = [];
  for (const [subject, req] of Object.entries(requirements)) {
    if (req.AND) {
      req.AND.forEach((gtCourse) => {
        slots.push({
          kind: "single",
          key: `${subject}:${gtCourse}`,
          subject,
          gtCourse,
        });
      });
    } else if (req.OR) {
      slots.push({
        kind: "choose-one",
        key: `${subject}:OR`,
        subject,
        label:
          subject === "LAB1" || subject === "LAB2"
            ? LAB_SUBJECT_LABEL
            : `Pick one ${subjectLabel(subject)} option`,
        options: req.OR,
      });
    }
  }
  return slots;
}

/**
 * Groups slots back by subject for rendering as colored sections.
 */
export function groupSlotsBySubject(
  slots: Slot[]
): Array<{ subject: string; slots: Slot[] }> {
  const ordered: string[] = [];
  const groups: Record<string, Slot[]> = {};
  for (const slot of slots) {
    if (!groups[slot.subject]) {
      groups[slot.subject] = [];
      ordered.push(slot.subject);
    }
    groups[slot.subject].push(slot);
  }
  return ordered.map((subject) => ({ subject, slots: groups[subject] }));
}

/**
 * Returns the GT-course set this slot is allowed to satisfy.
 * - single → just gtCourse
 * - choose-one → all options
 */
export function gtCoursesForSlot(slot: Slot): string[] {
  return slot.kind === "single" ? [slot.gtCourse] : slot.options;
}
