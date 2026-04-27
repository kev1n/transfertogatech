"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Eye } from "lucide-react";
import { Header } from "@/components/planner/Header";
import { Hero } from "@/components/planner/Hero";
import { InlinePicker, InlineOption } from "@/components/planner/InlinePicker";
import { PlanHeader } from "@/components/planner/PlanHeader";
import { SubjectSection } from "@/components/planner/SubjectSection";
import { ElectivesSection } from "@/components/planner/ElectivesSection";
import { CoursePicker } from "@/components/planner/CoursePicker";
import { EmptyStateGuide } from "@/components/planner/EmptyStateGuide";
import {
  PanelLayout,
  PanelProvider,
  usePanel,
} from "@/components/planner/SidePanel";
import { HotelsAllowBanner } from "@/components/hotels-allow-banner";
import { useSchoolEquivalencies } from "@/hooks/useSchoolEquivalencies";
import { usePlannerState } from "@/hooks/usePlannerState";
import getSchools from "@/lib/utils/db-consumer/getSchools";
import { majors as MAJORS_MAP } from "@/assets/gatech/majors";
import { buildSlots, groupSlotsBySubject, Slot } from "@/lib/planner/slots";
import { Pick } from "@/lib/planner/picks";

export default function PlannerPage() {
  return (
    <PanelProvider>
      <PanelLayout>
        <PlannerInner />
      </PanelLayout>
    </PanelProvider>
  );
}

function PlannerInner() {
  const planner = usePlannerState();
  const { openPanel, closePanel } = usePanel();

  const [schools, setSchools] = useState<InlineOption[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);

  useEffect(() => {
    getSchools()
      .then((opts) => {
        opts.sort((a, b) => a.label.localeCompare(b.label));
        setSchools(opts);
      })
      .finally(() => setSchoolsLoading(false));
  }, []);

  const majors = useMemo(
    () =>
      Object.keys(MAJORS_MAP)
        .sort()
        .map((m) => ({ value: m, label: m })),
    []
  );

  const equivalencies = useSchoolEquivalencies(planner.school.value);
  const equivalents = equivalencies?.equivalents ?? [];

  const slots = useMemo<Slot[]>(() => {
    const requirements = MAJORS_MAP[planner.major.value]?.requirements;
    return requirements ? buildSlots(requirements) : [];
  }, [planner.major.value]);

  const subjectGroups = useMemo(() => groupSlotsBySubject(slots), [slots]);

  const covered = slots.filter((s) => planner.picks[s.key]).length;
  const totalCredits = Object.values(planner.picks).reduce(
    (sum, pick) => sum + (pick.credits || 0),
    0
  );

  const openSlotPicker = (slot: Slot) => {
    if (planner.readOnly) return;
    openPanel({
      subtitle: "Pick a credit source",
      title: slot.kind === "single" ? slot.gtCourse : slot.label,
      body: (
        <CoursePicker
          slot={slot}
          equivalents={equivalents}
          onConfirm={(pick: Pick) => {
            planner.setPick(slot.key, pick);
            closePanel();
          }}
        />
      ),
    });
  };

  const ready = planner.school.value && planner.major.value;

  return (
    <div className="bg-warm pb-16">
      <Header getShareUrl={planner.getShareUrl} shareDisabled={!ready} />
      <div className="mx-auto max-w-6xl">
        {planner.readOnly && (
          <div className="mx-4 mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-warm-accent bg-warm-accent-soft px-3 py-2 text-[12px] text-warm-accent-ink sm:mx-6">
            <Eye size={14} aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <strong>Viewing a shared plan (read-only).</strong> Editing is
              disabled. Open your own plan to make changes.
            </div>
            <button
              type="button"
              onClick={planner.exitSharedView}
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-warm-accent px-3 py-1.5 text-[12px] font-bold text-white hover:opacity-90"
            >
              <ArrowLeft size={12} /> Open my plan
            </button>
          </div>
        )}

        {!planner.readOnly && <Hero />}
        {!planner.readOnly && (
          <InlinePicker
            schools={schools}
            schoolsLoading={schoolsLoading}
            majors={majors}
            school={planner.school.value ? planner.school : null}
            major={planner.major.value ? planner.major : null}
            onSchoolChange={planner.setSchool}
            onMajorChange={planner.setMajor}
          />
        )}

        {ready && (
          <div className="px-4 pt-4 sm:px-6">
            <PlanHeader
              schoolLabel={planner.school.label}
              majorLabel={planner.major.label}
              covered={covered}
              total={slots.length}
              totalCredits={totalCredits}
              dataTerm={equivalencies?.term}
              dataLastScrapedAt={equivalencies?.lastScrapedAt}
            />

            <div className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-widest text-ink-3">
              Core requirements
            </div>
            <div className="grid gap-2.5">
              {subjectGroups.map(({ subject, slots }) => (
                <SubjectSection
                  key={subject}
                  subject={subject}
                  slots={slots}
                  picks={planner.picks}
                  onOpenSlot={openSlotPicker}
                  onClearSlot={(slot) => planner.clearPick(slot.key)}
                  readOnly={planner.readOnly}
                />
              ))}
            </div>

            {equivalencies && !planner.readOnly && (
              <ElectivesSection
                equivalents={equivalents}
                slots={slots}
              />
            )}
          </div>
        )}

        {!ready && !planner.readOnly && <EmptyStateGuide />}

        <div className="mt-10 px-4 pb-2 sm:px-6">
          <HotelsAllowBanner utmCampaign="home-promo" />
        </div>
      </div>
    </div>
  );
}
