"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/planner/Header";
import { Hero } from "@/components/planner/Hero";
import { InlinePicker, InlineOption } from "@/components/planner/InlinePicker";
import { PlanHeader } from "@/components/planner/PlanHeader";
import { SubjectSection } from "@/components/planner/SubjectSection";
import { ElectivesSection } from "@/components/planner/ElectivesSection";
import { CoursePicker } from "@/components/planner/CoursePicker";
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

  const openSlotPicker = (slot: Slot) => {
    openPanel({
      subtitle: "Pick a credit source",
      title:
        slot.kind === "single"
          ? slot.gtCourse
          : slot.label,
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
      <Header
        getShareUrl={planner.getShareUrl}
        shareDisabled={!ready}
      />
      <div className="mx-auto max-w-6xl">
        <div className="px-4 pt-3 sm:px-6">
          <HotelsAllowBanner utmCampaign="home-promo" />
        </div>
        <Hero />
        <InlinePicker
          schools={schools}
          schoolsLoading={schoolsLoading}
          majors={majors}
          school={planner.school.value ? planner.school : null}
          major={planner.major.value ? planner.major : null}
          onSchoolChange={planner.setSchool}
          onMajorChange={planner.setMajor}
        />

        {ready && (
          <div className="px-4 pt-4 sm:px-6">
            <PlanHeader
              schoolLabel={planner.school.label}
              majorLabel={planner.major.label}
              covered={covered}
              total={slots.length}
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
                />
              ))}
            </div>

            {equivalencies && (
              <ElectivesSection
                equivalents={equivalents}
                slots={slots}
              />
            )}
          </div>
        )}

        {!ready && (
          <div className="px-4 py-12 text-center text-[13px] text-ink-3 sm:px-6">
            Select a school and major above to start your transfer plan.
          </div>
        )}
      </div>
    </div>
  );
}
