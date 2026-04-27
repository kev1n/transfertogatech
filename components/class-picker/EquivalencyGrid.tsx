"use client";

import { Class } from "@/types/mongo/mongotypes";
import { EquivalencyCard } from "./EquivalencyCard";

interface EquivalencyGridProps {
  equivalents: Class[];
  selected?: Class;
  onSelect: (equivalent: Class | undefined) => void;
}

export function EquivalencyGrid({
  equivalents,
  selected,
  onSelect,
}: EquivalencyGridProps) {
  const isSelected = (eq: Class) => selected?.className === eq.className;
  const toggle = (eq: Class) => onSelect(isSelected(eq) ? undefined : eq);

  return (
    <div className="mt-2 grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 xs:grid-cols-1 gap-2">
      {equivalents.map((equivalent) => (
        <EquivalencyCard
          key={equivalent.className + equivalent.gaEquivalent}
          equivalent={equivalent}
          selected={isSelected(equivalent)}
          onClick={() => toggle(equivalent)}
        />
      ))}
    </div>
  );
}
