"use client";

import { useState } from "react";
import { Check, ChevronDown, Layers } from "lucide-react";
import { Class } from "@/types/mongo/mongotypes";
import { Slot, gtCoursesForSlot } from "@/lib/planner/slots";
import { normalizeCourseCode } from "@/lib/matching/normalize";
import {
  ELECTIVE_CATEGORIES,
  ElectiveCategory,
  groupElectivesByCategory,
  resolveCategoryColors,
} from "@/lib/planner/electiveCategories";
import { readableInkOnHsl } from "@/lib/planner/subjectPalette";
import { useIsDark } from "@/hooks/useIsDark";
import { cn } from "@/lib/utils";

interface ElectivesSectionProps {
  equivalents: Class[];
  slots: Slot[];
}

const creditsOf = (c: Class) => parseFloat(c.creditHours) || 0;

export function ElectivesSection({ equivalents, slots }: ElectivesSectionProps) {
  const requiredGT = new Set(
    slots.flatMap(gtCoursesForSlot).map(normalizeCourseCode)
  );
  const electives = equivalents.filter(
    (eq) => !requiredGT.has(normalizeCourseCode(eq.gaEquivalent))
  );
  if (electives.length === 0) return null;

  const grouped = groupElectivesByCategory(electives);
  const populated = ELECTIVE_CATEGORIES.filter(
    (cat) => grouped[cat.key].length > 0
  );

  // Local "I've taken this" toggles per elective. Not persisted to URL.
  const [picked, setPicked] = useState<Record<string, boolean>>({});

  const totalAvail = electives.reduce((a, c) => a + creditsOf(c), 0);
  const totalPicked = electives.reduce(
    (a, c) =>
      picked[c.className + c.gaEquivalent] ? a + creditsOf(c) : a,
    0
  );

  const togglePicked = (key: string) =>
    setPicked((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <section className="mt-6">
      <div className="mb-2 flex items-baseline gap-2">
        <div className="text-[11px] font-bold uppercase tracking-widest text-ink-3">
          Electives
        </div>
        <div className="flex-1 border-b border-dotted border-warm-2" />
        <div className="text-[11px] text-ink-3">
          {totalPicked > 0 && (
            <>
              <span className="font-bold text-warm-good">
                +{totalPicked} cr selected
              </span>{" "}
              ·{" "}
            </>
          )}
          {totalAvail} cr available across {electives.length} courses
        </div>
      </div>
      <p className="mb-3 max-w-2xl text-[12px] text-ink-2">
        Courses you've taken that <strong>don't satisfy a core requirement</strong>{" "}
        but transfer to GT for elective credit. Grouped by how GT classifies
        them — pick the buckets that matter for your degree plan.
      </p>
      <div className="grid gap-2">
        {populated.map((cat) => (
          <CategoryGroup
            key={cat.key}
            category={cat}
            items={grouped[cat.key]}
            picked={picked}
            onToggle={togglePicked}
          />
        ))}
      </div>
    </section>
  );
}

function deptOf(className: string): string {
  return className.split(/\s+/)[0]?.toUpperCase() ?? "OTHER";
}

function groupByDept(items: Class[]): Array<[string, Class[]]> {
  const map: Record<string, Class[]> = {};
  for (const c of items) {
    const dept = deptOf(c.className);
    (map[dept] ??= []).push(c);
  }
  // Sort depts: alphabetical (predictable scanning).
  return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
}

function CategoryGroup({
  category,
  items,
  picked,
  onToggle,
}: {
  category: ElectiveCategory;
  items: Class[];
  picked: Record<string, boolean>;
  onToggle: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const { hue, hueSoft } = resolveCategoryColors(category, useIsDark());
  const iconInk = readableInkOnHsl(hue);
  const grpTotal = items.reduce((a, c) => a + creditsOf(c), 0);
  const grpPicked = items.reduce(
    (a, c) => (picked[c.className + c.gaEquivalent] ? a + creditsOf(c) : a),
    0
  );
  const deptGroups = groupByDept(items);

  return (
    <div className="overflow-hidden rounded-2xl border border-warm bg-warm-surface">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-left"
        style={{ backgroundColor: `hsl(${hueSoft})` }}
      >
        <div
          className="grid h-5 w-5 shrink-0 place-items-center rounded-md"
          style={{ backgroundColor: `hsl(${hue})`, color: iconInk }}
        >
          <Layers size={11} />
        </div>
        <div className="min-w-0 flex-1">
          <div
            className="truncate text-[12px] font-extrabold uppercase tracking-wider"
            style={{ color: `hsl(${hue})` }}
          >
            {category.label}
          </div>
          <div className="mt-0.5 truncate text-[11px] leading-snug text-ink-2">
            {category.note}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {grpPicked > 0 && (
            <span className="rounded-full bg-warm-good-soft px-2 py-0.5 text-[11px] font-bold text-warm-good">
              +{grpPicked} cr
            </span>
          )}
          <span className="text-[11px] font-bold text-ink-3">
            {items.length} · {grpTotal} cr
          </span>
          <ChevronDown
            size={14}
            className={cn("text-ink-3 transition-transform", open && "rotate-180")}
          />
        </div>
      </button>
      {open && (
        <div className="divide-y divide-warm">
          {deptGroups.map(([dept, deptItems]) => (
            <DepartmentGroup
              key={dept}
              dept={dept}
              items={deptItems}
              picked={picked}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DepartmentGroup({
  dept,
  items,
  picked,
  onToggle,
}: {
  dept: string;
  items: Class[];
  picked: Record<string, boolean>;
  onToggle: (key: string) => void;
}) {
  // Closed by default — open if dept has at least one selection so the user
  // can immediately see what's been picked there.
  const hasPicksOnMount = items.some(
    (c) => picked[c.className + c.gaEquivalent]
  );
  const [open, setOpen] = useState(hasPicksOnMount);

  const deptTotal = items.reduce((a, c) => a + creditsOf(c), 0);
  const deptPicked = items.reduce(
    (a, c) => (picked[c.className + c.gaEquivalent] ? a + creditsOf(c) : a),
    0
  );
  const deptPickedCount = items.reduce(
    (a, c) => (picked[c.className + c.gaEquivalent] ? a + 1 : a),
    0
  );
  const isActive = deptPickedCount > 0;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center gap-2 px-4 py-1.5 text-left transition-colors",
          isActive
            ? "bg-warm-good-soft hover:brightness-95"
            : "bg-warm-soft hover:bg-warm"
        )}
      >
        <span
          className={cn(
            "font-mono-display text-[11px] font-bold",
            isActive ? "text-warm-good" : "text-ink-2"
          )}
        >
          {dept}
        </span>
        <div className="flex-1" />
        {isActive ? (
          <span className="text-[10.5px] font-bold text-warm-good">
            {deptPickedCount} of {items.length} class
            {items.length === 1 ? "" : "es"} · +{deptPicked} cr
          </span>
        ) : (
          <span className="text-[10.5px] text-ink-3">
            {items.length} class{items.length === 1 ? "" : "es"} · {deptTotal} cr
          </span>
        )}
        <ChevronDown
          size={12}
          className={cn(
            "transition-transform",
            isActive ? "text-warm-good" : "text-ink-3",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="divide-y divide-warm">
          {items.map((c) => {
            const key = c.className + c.gaEquivalent;
            const on = !!picked[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => onToggle(key)}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-[filter,background-color,box-shadow]",
                  on
                    ? "bg-warm-good-soft hover:brightness-95 hover:ring-1 hover:ring-warm-good hover:ring-inset dark:hover:brightness-110"
                    : "hover:bg-warm-soft hover:ring-1 hover:ring-warm-2 hover:ring-inset"
                )}
              >
                <div
                  className={cn(
                    "grid h-[18px] w-[18px] shrink-0 place-items-center rounded-md border-[1.5px]",
                    on
                      ? "border-warm-good bg-warm-good"
                      : "border-warm-2 bg-transparent"
                  )}
                >
                  {on && <Check size={11} className="text-white" />}
                </div>
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
                <div className="shrink-0 rounded-full border border-warm-2 bg-warm-surface px-2 py-0.5 text-[11px] font-bold text-ink-2">
                  {c.creditHours} cr
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
