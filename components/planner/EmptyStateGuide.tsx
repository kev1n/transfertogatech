import {
  ArrowUp,
  GraduationCap,
  School as SchoolIcon,
  Sparkles,
  ScrollText,
  CheckCircle2,
  ListChecks,
  ShieldCheck,
} from "lucide-react";

const STEPS = [
  {
    icon: SchoolIcon,
    title: "Pick your current school",
    body: "1,800+ accredited US institutions, scraped fresh from GT's official equivalency table.",
  },
  {
    icon: GraduationCap,
    title: "Pick your GT major",
    body: "39 undergraduate majors. We map each major's freshman-year requirements automatically.",
  },
  {
    icon: ListChecks,
    title: "Build your plan",
    body: "See which of your courses transfer, layer in AP credit, and copy a share link to send your advisor.",
  },
];

const FEATURES = [
  {
    icon: ScrollText,
    label: "Real, current data",
    body: "Every equivalency comes from oscar.gatech.edu — the same table GT advisors use. We re-scrape regularly so the term you see is the term GT publishes.",
  },
  {
    icon: Sparkles,
    label: "AP credit, side-by-side",
    body: "36 AP exams covered. Click any requirement to compare a transfer course or an AP grant — including multi-tier exams like Calc BC and AP Chem.",
  },
  {
    icon: ShieldCheck,
    label: "Free, private, shareable",
    body: "Your plan saves to your browser only. Share a read-only link with anyone — your saved plan stays yours.",
  },
];

export function EmptyStateGuide() {
  return (
    <section className="px-4 py-10 sm:px-6 sm:py-12">
      {/* Pointer to picker above */}
      <div className="mb-10 flex flex-col items-center gap-2 text-ink-3">
        <ArrowUp size={18} className="animate-bounce" aria-hidden="true" />
        <p className="text-[12px]">
          Pick a school and major above to start your plan.
        </p>
      </div>

      {/* How it works */}
      <div className="mb-12">
        <div className="mb-3 flex items-baseline gap-2">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-3">
            How it works
          </h2>
          <div className="flex-1 border-b border-dotted border-warm-2" />
          <span className="text-[11px] text-ink-3">3 steps · ~30 seconds</span>
        </div>
        <ol className="grid gap-3 sm:grid-cols-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <li
                key={step.title}
                className="rounded-2xl border border-warm bg-warm-surface p-4"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-warm-accent text-[11px] font-extrabold text-white">
                    {i + 1}
                  </span>
                  <Icon size={15} className="text-warm-accent-ink" />
                </div>
                <div className="font-serif-display text-[20px] leading-tight text-ink">
                  {step.title}
                </div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-ink-2">
                  {step.body}
                </p>
              </li>
            );
          })}
        </ol>
      </div>

      {/* What you get */}
      <div className="mb-12">
        <div className="mb-3 flex items-baseline gap-2">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-3">
            What you get
          </h2>
          <div className="flex-1 border-b border-dotted border-warm-2" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.label}
                className="rounded-2xl border border-warm bg-warm-surface p-4"
              >
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-warm-accent-soft px-2.5 py-1 text-[11px] font-bold text-warm-accent-ink">
                  <Icon size={12} /> {feature.label}
                </div>
                <p className="text-[12.5px] leading-relaxed text-ink-2">
                  {feature.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats strip */}
      <div className="rounded-2xl border border-warm bg-warm-soft p-4">
        <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
          <Stat value="1,800+" label="accredited schools" />
          <Stat value="39" label="GT undergrad majors" />
          <Stat value="36" label="AP exams covered" />
          <Stat value="Free" label="forever" />
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="font-serif-display text-[26px] leading-none text-ink">
        {value}
      </div>
      <div className="mt-1 flex items-center gap-1 text-[11px] text-ink-3">
        <CheckCircle2 size={11} className="text-warm-good" />
        {label}
      </div>
    </div>
  );
}
