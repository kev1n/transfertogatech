"use client";

import { Class } from "@/types/mongo/mongotypes";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface EquivalencyCardProps {
  equivalent: Class;
  selected: boolean;
  onClick: () => void;
}

export function EquivalencyCard({
  equivalent,
  selected,
  onClick,
}: EquivalencyCardProps) {
  return (
    <Card
      className={`cursor-pointer hover:border-primary ${
        selected ? "border-primary" : ""
      }`}
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle>
          <div className="flex items-center justify-between">
            {equivalent.className}
            <SelectionDot selected={selected} />
          </div>
        </CardTitle>
        <CardDescription>{equivalent.title}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          {equivalent.className} -&gt; {equivalent.gaEquivalent}
        </p>
      </CardContent>
      <CardFooter>
        <p>{equivalent.creditHours} credits</p>
      </CardFooter>
    </Card>
  );
}

function SelectionDot({ selected }: { selected: boolean }) {
  return (
    <div className="w-7 h-7 border-2 border-gray-800 dark:border-gray-200 rounded-full relative">
      {selected && (
        <div className="absolute bg-gray-800 dark:bg-gray-200 rounded-full w-5 h-5 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
      )}
    </div>
  );
}
