"use client";

import { Trash2 } from "lucide-react";
import { Slot } from "@/lib/planner/slots";
import { Pick } from "@/lib/planner/picks";
import { findAPExam } from "@/assets/gatech/apCredits";

interface SlotRowProps {
  slot: Slot;
  pick?: Pick;
  onOpen: () => void;
  onClear: () => void;
  isLast: boolean;
}

export function SlotRow({ slot, pick, onOpen, onClear, isLast }: SlotRowProps) {
  const display =
    slot.kind === "choose-one" ? slot.label : slot.gtCourse;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 ${
        isLast ? "" : "border-b border-warm"
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-block h-2 w-2 rounded-full border-2 ${
              pick
                ? "border-warm-good bg-warm-good"
                : "border-warm-2 bg-transparent"
            }`}
          />
          <span className="font-mono-display text-[12px] font-semibold text-ink-2">
            {display}
          </span>
        </div>
        {pick && <PickPill pick={pick} />}
      </div>

      {pick ? (
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={onOpen}
            className="rounded-full border border-warm bg-warm-surface px-3 py-1.5 text-[12px] font-semibold text-ink-2 hover:bg-warm-soft"
          >
            Change
          </button>
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear selection"
            className="rounded-full border border-warm bg-warm-surface px-2 py-1.5 text-ink-3 hover:bg-warm-soft"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onOpen}
          className="shrink-0 whitespace-nowrap rounded-full bg-ink px-3.5 py-1.5 text-[12px] font-bold text-warm hover:opacity-90"
        >
          + Add
        </button>
      )}
    </div>
  );
}

function PickPill({ pick }: { pick: Pick }) {
  if (pick.kind === "ap") {
    const exam = findAPExam(pick.examId);
    return (
      <div className="mt-1 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-warm-accent-soft px-2 py-0.5 text-[11px] font-bold text-warm-accent-ink">
          AP {pick.score} · {exam?.name.replace(/^AP /, "") ?? pick.examId}
        </span>
        <span className="text-[11px] text-ink-3">· {pick.credits} cr</span>
      </div>
    );
  }
  return (
    <div className="mt-1 flex flex-wrap items-center gap-1.5">
      <span className="font-mono-display rounded-full bg-warm-good-soft px-2 py-0.5 text-[11px] font-bold text-warm-good">
        {pick.sourceCode}
      </span>
      <span className="truncate text-[12px] text-ink-2">
        {pick.sourceTitle}
      </span>
      <span className="text-[11px] text-ink-3">· {pick.credits} cr</span>
    </div>
  );
}
