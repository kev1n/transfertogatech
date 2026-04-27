"use client";

import { useState } from "react";
import { ChevronDown, Layers } from "lucide-react";
import { Class } from "@/types/mongo/mongotypes";
import { Slot, gtCoursesForSlot } from "@/lib/planner/slots";
import { groupByDepartment } from "@/lib/matching/groupByDepartment";
import { normalizeCourseCode } from "@/lib/matching/normalize";
import { cn } from "@/lib/utils";

interface ElectivesSectionProps {
  equivalents: Class[];
  slots: Slot[];
}

/**
 * Renders the "all transferable classes that aren't satisfying a core
 * requirement" section. Grouped by source-school department, collapsed by
 * default.
 */
export function ElectivesSection({ equivalents, slots }: ElectivesSectionProps) {
  const requiredGT = new Set(
    slots.flatMap(gtCoursesForSlot).map(normalizeCourseCode)
  );
  const electives = equivalents.filter(
    (eq) => !requiredGT.has(normalizeCourseCode(eq.gaEquivalent))
  );
  if (electives.length === 0) return null;

  const groups = groupByDepartment(electives);
  const ordered = Object.entries(groups).sort(
    ([, a], [, b]) => b.length - a.length
  );

  return (
    <section className="mt-6">
      <div className="mb-2 flex items-baseline gap-2">
        <div className="text-[11px] font-bold uppercase tracking-widest text-ink-3">
          Electives
        </div>
        <div className="flex-1 border-b border-dotted border-warm-2" />
        <div className="text-[11px] text-ink-3">
          {electives.length} courses transfer for elective credit
        </div>
      </div>
      <p className="mb-3 max-w-2xl text-[12px] text-ink-2">
        Courses you've taken that <strong>don't satisfy a core requirement</strong>{" "}
        but transfer to GT. Useful for free electives, minors, and core-area
        requirements like humanities or social sciences.
      </p>
      <div className="grid gap-2">
        {ordered.map(([dept, items]) => (
          <ElectiveGroup key={dept} dept={dept} items={items} />
        ))}
      </div>
    </section>
  );
}

function ElectiveGroup({ dept, items }: { dept: string; items: Class[] }) {
  const [open, setOpen] = useState(false);
  const totalCredits = items.reduce(
    (a, c) => a + (parseFloat(c.creditHours) || 0),
    0
  );
  return (
    <div className="overflow-hidden rounded-2xl border border-warm bg-warm-surface">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 bg-warm-soft px-4 py-2.5 text-left"
      >
        <div className="grid h-5 w-5 place-items-center rounded-md bg-ink-3 text-white">
          <Layers size={11} />
        </div>
        <div className="flex-1 truncate text-[12px] font-extrabold uppercase tracking-wider text-ink-2">
          {dept}
        </div>
        <span className="text-[11px] font-bold text-ink-3">
          {items.length} · {totalCredits} cr
        </span>
        <ChevronDown
          size={14}
          className={cn("text-ink-3 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="divide-y divide-warm">
          {items.map((c) => (
            <div
              key={c.className + c.gaEquivalent}
              className="flex items-center gap-3 px-4 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-mono-display text-[12px] font-bold text-ink">
                    {c.className}
                  </span>
                  <span className="truncate text-[12.5px] text-ink-2">
                    {c.title}
                  </span>
                </div>
                <div className="mt-0.5 text-[11px] text-ink-3">
                  → Transfers as{" "}
                  <span className="font-mono-display text-ink-2">
                    {c.gaEquivalent}
                  </span>
                </div>
              </div>
              <div className="rounded-full border border-warm-2 px-2 py-0.5 text-[11px] font-bold text-ink-2">
                {c.creditHours} cr
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
