import { Sparkles } from "lucide-react";

const SEO_CHIPS = [
  "GT transfer planner",
  "GATech equivalency tool",
  "AP credit calculator",
  "Freshman requirements",
  "Course mapper",
];

export function Hero() {
  return (
    <section className="px-4 pb-3 pt-8 sm:px-6 sm:pt-12">
      <div className="inline-flex items-center gap-1.5 rounded-full bg-warm-accent-soft px-3 py-1 text-[11px] font-bold text-warm-accent-ink">
        <Sparkles size={12} /> NEW · AP credit + transfer planner
      </div>
      <h1 className="font-serif-display mt-3 max-w-3xl text-[44px] leading-[1.05] tracking-tight text-ink sm:text-[52px]">
        The free <em className="italic text-warm-accent-ink">Georgia Tech</em>{" "}
        transfer credit tool
      </h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-2">
        Match every freshman-year course at your current college to its
        equivalent at <strong>GT</strong> (GATech). Layer in{" "}
        <strong>AP credit</strong> from high school. Built by transfers, for
        transfer students.
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {SEO_CHIPS.map((c) => (
          <span
            key={c}
            className="rounded-full border border-warm bg-warm-surface px-2.5 py-1 text-[11px] font-semibold text-ink-3"
          >
            {c}
          </span>
        ))}
      </div>
    </section>
  );
}
