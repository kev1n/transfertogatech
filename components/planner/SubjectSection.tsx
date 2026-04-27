"use client";

import { BookOpen } from "lucide-react";
import { Slot } from "@/lib/planner/slots";
import { Pick, PicksMap } from "@/lib/planner/picks";
import { subjectStyle } from "@/lib/planner/subjectPalette";
import { SlotRow } from "./SlotRow";

interface SubjectSectionProps {
  subject: string;
  slots: Slot[];
  picks: PicksMap;
  onOpenSlot: (slot: Slot) => void;
  onClearSlot: (slot: Slot) => void;
}

export function SubjectSection({
  subject,
  slots,
  picks,
  onOpenSlot,
  onClearSlot,
}: SubjectSectionProps) {
  const style = subjectStyle(subject);
  return (
    <div className="overflow-hidden rounded-2xl border border-warm bg-warm-surface">
      <div
        className="flex items-center gap-2.5 px-4 py-2.5"
        style={{ backgroundColor: `hsl(${style.hueSoft})` }}
      >
        <div
          className="grid h-5 w-5 place-items-center rounded-md text-white"
          style={{ backgroundColor: `hsl(${style.hue})` }}
        >
          <BookOpen size={11} />
        </div>
        <div
          className="flex-1 truncate text-[11.5px] font-bold uppercase tracking-wider"
          style={{ color: `hsl(${style.hue})` }}
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
        />
      ))}
    </div>
  );
}
