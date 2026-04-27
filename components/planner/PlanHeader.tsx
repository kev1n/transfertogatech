interface PlanHeaderProps {
  schoolLabel: string;
  majorLabel: string;
  covered: number;
  total: number;
}

export function PlanHeader({
  schoolLabel,
  majorLabel,
  covered,
  total,
}: PlanHeaderProps) {
  const pct = total ? covered / total : 0;
  const r = 28;
  const c = 2 * Math.PI * r;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-warm bg-warm-surface p-4">
      <div className="relative h-[68px] w-[68px] flex-shrink-0">
        <svg width="68" height="68">
          <circle
            cx="34"
            cy="34"
            r={r}
            fill="none"
            stroke="hsl(var(--warm-line))"
            strokeWidth="5"
          />
          <circle
            cx="34"
            cy="34"
            r={r}
            fill="none"
            stroke="hsl(var(--warm-accent))"
            strokeWidth="5"
            strokeDasharray={`${c * pct} ${c}`}
            strokeDashoffset={c * 0.25}
            strokeLinecap="round"
            transform="rotate(-90 34 34)"
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-[13px] font-extrabold text-ink">
          {Math.round(pct * 100)}%
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10.5px] font-bold uppercase tracking-widest text-ink-3">
          Your transfer plan
        </div>
        <div className="font-serif-display mt-0.5 truncate text-[26px] leading-tight text-ink">
          Georgia Tech <span className="text-ink-3">·</span>{" "}
          <span className="italic text-warm-accent-ink">{majorLabel || "—"}</span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[12px] text-ink-3">
          <span>Transferring from</span>
          <span className="font-semibold text-ink-2">{schoolLabel || "—"}</span>
          <span>·</span>
          <span>
            {covered} of {total} requirements covered
          </span>
        </div>
      </div>
    </div>
  );
}
