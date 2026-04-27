"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, GraduationCap, School as SchoolIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InlineOption {
  value: string;
  label: string;
}

interface InlineComboboxProps {
  icon: React.ReactNode;
  placeholder: string;
  value: InlineOption | null;
  onChange: (option: InlineOption) => void;
  options: InlineOption[];
  loading?: boolean;
}

function InlineCombobox({
  icon,
  placeholder,
  value,
  onChange,
  options,
  loading,
}: InlineComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const filtered = query
    ? options.filter((o) =>
        o.label.toLowerCase().includes(query.toLowerCase())
      )
    : options;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center gap-2 rounded-xl border bg-warm px-3.5 py-3 text-left text-[13px] font-medium",
          open ? "border-warm-accent" : "border-warm",
          value ? "text-ink" : "text-ink-3"
        )}
      >
        <span className="text-ink-2">{icon}</span>
        <span className="min-w-0 flex-1 truncate">
          {loading ? "Loading…" : value?.label ?? placeholder}
        </span>
        <ChevronDown size={14} className="text-ink-3" />
      </button>
      {open && !loading && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 flex max-h-72 flex-col overflow-hidden rounded-xl border border-warm bg-warm-surface shadow-2xl">
          <div className="border-b border-warm p-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full bg-transparent px-2 py-1 text-[13px] text-ink outline-none placeholder:text-ink-3"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="px-4 py-6 text-center text-[13px] text-ink-3">
                No matches
              </div>
            )}
            {filtered.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o);
                  setOpen(false);
                  setQuery("");
                }}
                className={cn(
                  "block w-full px-3.5 py-2 text-left text-[13px] hover:bg-warm-soft",
                  o.value === value?.value
                    ? "bg-warm-soft font-semibold text-ink"
                    : "text-ink-2"
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface InlinePickerProps {
  schools: InlineOption[];
  schoolsLoading: boolean;
  majors: InlineOption[];
  school: InlineOption | null;
  major: InlineOption | null;
  onSchoolChange: (option: InlineOption) => void;
  onMajorChange: (option: InlineOption) => void;
}

export function InlinePicker({
  schools,
  schoolsLoading,
  majors,
  school,
  major,
  onSchoolChange,
  onMajorChange,
}: InlinePickerProps) {
  return (
    <div className="mx-4 mt-4 grid gap-2 rounded-2xl border border-warm bg-warm-surface p-3.5 sm:mx-6 sm:grid-cols-2">
      <InlineCombobox
        icon={<SchoolIcon size={15} />}
        placeholder="Pick your current school"
        value={school}
        onChange={onSchoolChange}
        options={schools}
        loading={schoolsLoading}
      />
      <InlineCombobox
        icon={<GraduationCap size={15} />}
        placeholder="Pick your GT major"
        value={major}
        onChange={onMajorChange}
        options={majors}
      />
    </div>
  );
}
