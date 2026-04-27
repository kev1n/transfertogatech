"use client";

import { ArrowRight, Pencil, Plus, Trash2 } from "lucide-react";
import { Slot } from "@/lib/planner/slots";
import { Pick } from "@/lib/planner/picks";
import { findAPExam } from "@/assets/gatech/apCredits";
import { formatGtCourseTitle } from "@/assets/gatech/gtCatalog";
import posthog from "posthog-js";
import { cn } from "@/lib/utils";

interface SlotRowProps {
  slot: Slot;
  pick?: Pick;
  onOpen: () => void;
  onClear: () => void;
  isLast: boolean;
  readOnly?: boolean;
}

export function SlotRow({
  slot,
  pick,
  onOpen,
  onClear,
  isLast,
  readOnly = false,
}: SlotRowProps) {
  const interactive = !readOnly;

  const handleRowClick = () => {
    if (!interactive) return;
    onOpen();
  };

  const handleRowKey = (e: React.KeyboardEvent) => {
    if (!interactive) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen();
    }
  };

  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={handleRowClick}
      onKeyDown={handleRowKey}
      aria-label={pick ? "Change selection" : "Add a transfer course or AP credit"}
      className={cn(
        "flex items-start gap-3 px-4 py-3 transition-colors",
        isLast ? "" : "border-b border-warm",
        interactive
          ? "cursor-pointer hover:bg-warm-soft focus-visible:bg-warm-soft focus-visible:outline-none"
          : ""
      )}
    >
      <div className="min-w-0 flex-1">
        {pick ? (
          <PickedMapping pick={pick} />
        ) : (
          <UnfilledRequirement slot={slot} />
        )}
      </div>

      {interactive &&
        (pick ? (
          <div className="mt-0.5 flex shrink-0 items-center gap-1 text-ink-3">
            <Pencil size={13} aria-hidden="true" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                posthog.capture("course_pick_cleared", {
                  slot_key: slot.key,
                  gt_course: pick?.gtCourse,
                  pick_kind: pick?.kind,
                });
                onClear();
              }}
              aria-label="Clear selection"
              className="rounded-full border border-warm bg-warm-surface p-1.5 hover:bg-warm hover:text-ink"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ) : (
          <div className="mt-0.5 inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-[12px] font-bold text-warm-accent-ink dark:text-warm-accent">
            <Plus size={12} /> Add
          </div>
        ))}
    </div>
  );
}

function UnfilledRequirement({ slot }: { slot: Slot }) {
  const code = slot.kind === "single" ? slot.gtCourse : slot.label;
  const title =
    slot.kind === "single" ? formatGtCourseTitle(slot.gtCourse) : undefined;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-block h-2 w-2 rounded-full border-2 border-warm-2 bg-transparent" />
        <span className="font-mono-display text-[12px] font-semibold text-ink-2">
          {code}
        </span>
        {title && <span className="text-[12px] text-ink-3">· {title}</span>}
      </div>
      <div className="mt-0.5 pl-[14px] text-[11px] text-ink-3">
        Required by your major
      </div>
    </div>
  );
}

function PickedMapping({ pick }: { pick: Pick }) {
  return (
    <div>
      {/* Source code chip → GT code chip */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="inline-block h-2 w-2 shrink-0 rounded-full border-2 border-warm-good bg-warm-good" />
        <SourcePill pick={pick} />
        <ArrowRight size={13} className="shrink-0 text-ink-3" aria-label="transfers as" />
        <span className="font-mono-display rounded-full border border-warm-2 bg-warm px-2 py-0.5 text-[11px] font-bold text-ink">
          {pick.gtCourse}
        </span>
      </div>
      {/* Plain-English: source title → GT title */}
      <div className="mt-1 pl-[14px] text-[11.5px] leading-snug text-ink-3">
        <SourceTitle pick={pick} />
        {pick.gtTitle && (
          <>
            {" "}
            <ArrowRight
              size={11}
              className="inline-block align-[-1px] text-ink-3"
              aria-hidden="true"
            />{" "}
            <span className="text-ink-2">{pick.gtTitle}</span>
          </>
        )}
      </div>
      {/* Credits — neutral palette so it doesn't compete with the "selected"
          green or the AP gold. */}
      <div className="mt-1 pl-[14px]">
        <span className="rounded-full border border-warm-2 bg-warm-soft px-2 py-0.5 text-[11px] font-bold text-ink-2">
          {pick.credits} GT credit{pick.credits === 1 ? "" : "s"} awarded
        </span>
      </div>
    </div>
  );
}

function SourcePill({ pick }: { pick: Pick }) {
  if (pick.kind === "ap") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-warm-accent-soft px-2 py-0.5 text-[11px] font-bold text-warm-accent-ink">
        AP score {pick.score}
      </span>
    );
  }
  return (
    <span className="font-mono-display rounded-full bg-warm-good-soft px-2 py-0.5 text-[11px] font-bold text-warm-good">
      {pick.sourceCode}
    </span>
  );
}

function SourceTitle({ pick }: { pick: Pick }) {
  if (pick.kind === "ap") {
    const exam = findAPExam(pick.examId);
    return <span>{exam?.name ?? pick.examId}</span>;
  }
  return <span>{pick.sourceTitle}</span>;
}
