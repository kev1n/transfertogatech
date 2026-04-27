"use client";

import {
  Atom,
  Code2,
  FlaskConical,
  LucideIcon,
  Microscope,
  PenLine,
  Sigma,
  TestTube,
} from "lucide-react";
import { Slot } from "@/lib/planner/slots";
import { Pick, PicksMap } from "@/lib/planner/picks";
import {
  readableInkOnHsl,
  resolveStyle,
  subjectStyle,
} from "@/lib/planner/subjectPalette";
import { useIsDark } from "@/hooks/useIsDark";
import { SlotRow } from "./SlotRow";

const SUBJECT_ICONS: Record<string, LucideIcon> = {
  ENGLISH: PenLine,
  MATH: Sigma,
  CS: Code2,
  CHEM1: FlaskConical,
  CHEM2: FlaskConical,
  PHYS: Atom,
  BIOLOGY: Microscope,
  LAB1: TestTube,
  LAB2: TestTube,
};

interface SubjectSectionProps {
  subject: string;
  slots: Slot[];
  picks: PicksMap;
  onOpenSlot: (slot: Slot) => void;
  onClearSlot: (slot: Slot) => void;
  readOnly?: boolean;
}

export function SubjectSection({
  subject,
  slots,
  picks,
  onOpenSlot,
  onClearSlot,
  readOnly = false,
}: SubjectSectionProps) {
  const style = subjectStyle(subject);
  const { hue, hueSoft } = resolveStyle(style, useIsDark());
  const SubjectIcon = SUBJECT_ICONS[subject] ?? PenLine;
  const iconInk = readableInkOnHsl(hue);
  return (
    <div className="overflow-hidden rounded-2xl border border-warm bg-warm-surface">
      <div
        className="flex items-center gap-2.5 px-4 py-2.5"
        style={{ backgroundColor: `hsl(${hueSoft})` }}
      >
        <div
          className="grid h-5 w-5 place-items-center rounded-md"
          style={{ backgroundColor: `hsl(${hue})`, color: iconInk }}
        >
          <SubjectIcon size={11} />
        </div>
        <div
          className="flex-1 truncate text-[11.5px] font-bold uppercase tracking-wider"
          style={{ color: `hsl(${hue})` }}
        >
          {style.label}
        </div>
        <span className="text-[10.5px] font-bold text-ink-3">
          {slots.length} req{slots.length !== 1 ? "s" : ""}
        </span>
      </div>
      {slots.map((slot, i) => (
        <SlotRow
          key={slot.key}
          slot={slot}
          pick={picks[slot.key] as Pick | undefined}
          onOpen={() => onOpenSlot(slot)}
          onClear={() => onClearSlot(slot)}
          isLast={i === slots.length - 1}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}
