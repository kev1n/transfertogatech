"use client";

import { useState } from "react";
import { ChevronRight, GraduationCap, School } from "lucide-react";
import { Class } from "@/types/mongo/mongotypes";
import { Slot, gtCoursesForSlot } from "@/lib/planner/slots";
import { Pick } from "@/lib/planner/picks";
import {
  AP_EXAMS,
  APExam,
  pickGrantForScore,
} from "@/assets/gatech/apCredits";
import { filterByAnyCourse } from "@/lib/matching/matchRequirement";
import { formatGtCourseTitle } from "@/assets/gatech/gtCatalog";
import posthog from "posthog-js";
import { cn } from "@/lib/utils";

interface CoursePickerProps {
  slot: Slot;
  equivalents: Class[];
  onConfirm: (pick: Pick) => void;
}

type Tab = "transfer" | "ap";

export function CoursePicker({ slot, equivalents, onConfirm }: CoursePickerProps) {
  const [tab, setTab] = useState<Tab>("transfer");
  const gtCourses = gtCoursesForSlot(slot);
  const transferOptions = filterByAnyCourse(equivalents, gtCourses);
  const apOptions = AP_EXAMS.filter((exam) =>
    exam.grants.some((g) => g.courses.some((c) => gtCourses.includes(c)))
  );

  return (
    <div className="flex h-full flex-col">
      <div className="-mt-1 mb-3 flex border-b border-warm">
        <TabButton
          active={tab === "transfer"}
          onClick={() => setTab("transfer")}
          icon={<School size={13} />}
          label={`Transfer (${transferOptions.length})`}
        />
        <TabButton
          active={tab === "ap"}
          onClick={() => {
            setTab("ap");
            posthog.capture("ap_tab_viewed", {
              gt_courses: gtCourses,
              ap_options_count: apOptions.length,
            });
          }}
          icon={<GraduationCap size={13} />}
          label={`AP credit (${apOptions.length})`}
        />
      </div>

      {tab === "transfer" ? (
        <TransferList
          options={transferOptions}
          onPick={(eq) => {
            posthog.capture("course_picked", {
              kind: "transfer",
              source_code: eq.className,
              gt_course: eq.gaEquivalent,
              credits: parseFloat(eq.creditHours) || 0,
            });
            onConfirm({
              kind: "transfer",
              sourceCode: eq.className,
              sourceTitle: eq.title,
              gtCourse: eq.gaEquivalent,
              gtTitle: eq.gaEquivalentTitle || formatGtCourseTitle(eq.gaEquivalent) || "",
              credits: parseFloat(eq.creditHours) || 0,
            });
          }}
        />
      ) : (
        <APList
          options={apOptions}
          gtCourses={gtCourses}
          onPick={(exam, score, gtCourse, credits) => {
            posthog.capture("course_picked", {
              kind: "ap",
              exam_id: exam.id,
              exam_name: exam.name,
              score,
              gt_course: gtCourse,
              credits,
            });
            onConfirm({
              kind: "ap",
              examId: exam.id,
              score,
              gtCourse,
              gtTitle: formatGtCourseTitle(gtCourse) || "",
              credits,
            });
          }}
        />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "-mb-px flex items-center gap-1.5 px-3.5 py-2.5 text-[12.5px] font-semibold transition-colors",
        active
          ? "border-b-2 border-warm-accent text-ink"
          : "border-b-2 border-transparent text-ink-3 hover:text-ink-2"
      )}
    >
      {icon} {label}
    </button>
  );
}

function TransferList({
  options,
  onPick,
}: {
  options: Class[];
  onPick: (eq: Class) => void;
}) {
  if (options.length === 0) {
    return (
      <Empty text="No equivalent transfer course found at this school. Try AP credit instead, or check back — we re-crawl Oscar regularly." />
    );
  }
  return (
    <div className="grid gap-2">
      {options.map((eq) => (
        <button
          key={eq.className + eq.gaEquivalent}
          type="button"
          onClick={() => onPick(eq)}
          className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border border-warm bg-warm p-3 text-left transition-[filter,box-shadow] hover:brightness-95 hover:ring-1 hover:ring-warm-accent dark:hover:brightness-110"
        >
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-[hsl(224_60%_33%)] text-[11px] font-extrabold text-white">
            {eq.className.split(/\s+/)[0]}
          </div>
          <div className="min-w-0">
            <div className="font-mono-display text-[13.5px] font-bold text-ink">
              {eq.className}
            </div>
            <div className="truncate text-[12px] text-ink-2">{eq.title}</div>
            <div className="mt-0.5 text-[10.5px] text-ink-3">
              → Satisfies{" "}
              <span className="font-mono-display">{eq.gaEquivalent}</span>
            </div>
          </div>
          <div className="rounded-full border border-warm-2 px-2 py-0.5 text-[12px] font-bold text-ink-2">
            {eq.creditHours} cr
          </div>
        </button>
      ))}
    </div>
  );
}

function APList({
  options,
  gtCourses,
  onPick,
}: {
  options: APExam[];
  gtCourses: string[];
  onPick: (exam: APExam, score: 3 | 4 | 5, gtCourse: string, credits: number) => void;
}) {
  if (options.length === 0) {
    return <Empty text="No AP exam grants credit for this requirement." />;
  }
  return (
    <div className="grid gap-2">
      {options.map((exam) => {
        const relevant = exam.grants
          .filter((g) => g.courses.some((c) => gtCourses.includes(c)))
          .sort((a, b) => a.score - b.score);
        return (
          <APExamCard
            key={exam.id}
            exam={exam}
            relevantGrants={relevant}
            gtCourses={gtCourses}
            onPick={onPick}
          />
        );
      })}
    </div>
  );
}

function APExamCard({
  exam,
  relevantGrants,
  gtCourses,
  onPick,
}: {
  exam: APExam;
  relevantGrants: APExam["grants"];
  gtCourses: string[];
  onPick: (exam: APExam, score: 3 | 4 | 5, gtCourse: string, credits: number) => void;
}) {
  const courseFor = (grant: APExam["grants"][number]) =>
    grant.courses.find((c) => gtCourses.includes(c)) ?? grant.courses[0];

  const header = (
    <div className="flex items-start gap-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-warm-accent text-[11px] font-extrabold text-white">
        AP
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13.5px] font-bold text-ink">{exam.name}</div>
        {exam.note && (
          <div className="text-[11px] text-ink-2">{exam.note}</div>
        )}
      </div>
    </div>
  );

  // Single grant → whole card is one click target.
  if (relevantGrants.length === 1) {
    const grant = relevantGrants[0];
    return (
      <button
        type="button"
        onClick={() => onPick(exam, grant.score, courseFor(grant), grant.credits)}
        className="block w-full rounded-xl border border-warm-accent bg-warm-accent-soft p-3 text-left transition-[filter,box-shadow] hover:brightness-95 hover:ring-1 hover:ring-warm-accent dark:hover:brightness-110"
      >
        {header}
        <div className="mt-2.5">
          <span className="rounded-full bg-warm-surface px-3 py-1 text-[11.5px] font-bold text-warm-accent-ink">
            {formatScoreThreshold(grant.score)} → {grant.credits} cr
          </span>
        </div>
      </button>
    );
  }

  // Multi-tier → header is informational; each score chip is its own button.
  // Each grant is a *tier* tied to that exact score, NOT a "X or higher"
  // threshold (a 5 on AP Chem doesn't grant the score-4 tier — it grants its
  // own different tier). So labels are "Score 4", "Score 5", no "+".
  return (
    <div className="rounded-xl border border-warm-accent bg-warm-accent-soft p-3">
      {header}
      <div className="mt-2 text-[11px] font-bold uppercase tracking-wider text-warm-accent-ink">
        Choose the score you earned →
      </div>
      <div className="mt-2 grid gap-1.5">
        {relevantGrants.map((grant) => (
          <button
            key={grant.score}
            type="button"
            onClick={() => onPick(exam, grant.score, courseFor(grant), grant.credits)}
            className="group flex w-full items-center gap-2 rounded-lg bg-warm-accent px-3 py-2 text-left text-[13px] font-bold text-white shadow-sm transition-[filter,transform] hover:brightness-95 active:translate-y-px dark:hover:brightness-110"
          >
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-extrabold">
              Score {grant.score}
            </span>
            <span className="flex-1">{grant.credits} GT credits awarded</span>
            <ChevronRight size={14} className="opacity-80 group-hover:translate-x-0.5 transition-transform" />
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Single-grant exams qualify with `minScore` OR HIGHER (e.g., AP Calc AB at
 * score 4 also gives you the credit if you scored a 5). Enumerate all
 * qualifying scores so users don't read "Score 5+" and wonder if there's
 * something above 5.
 */
function formatScoreThreshold(minScore: 3 | 4 | 5): string {
  if (minScore === 5) return "Score 5";
  if (minScore === 4) return "Score 4 or 5";
  return "Score 3, 4, or 5";
}

function Empty({ text }: { text: string }) {
  return (
    <div className="px-4 py-10 text-center text-[13px] text-ink-3">{text}</div>
  );
}

// Quiet unused-import error for pickGrantForScore; kept in surface API.
void pickGrantForScore;
