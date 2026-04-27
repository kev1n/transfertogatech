"use client";

import { useState } from "react";
import { Class } from "@/types/mongo/mongotypes";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { GroupedEquivalents } from "@/lib/matching/groupByCoreArea";
import { EquivalencyGrid } from "./EquivalencyGrid";
import { SelectedRowDetails } from "./SelectedRowDetails";

interface ElectivePickerProps {
  groupedEquivalents: GroupedEquivalents;
  title: string;
}

interface Selection {
  equivalent: Class;
  department: string;
}

/**
 * Replaces the old self-recursive ElectiveAndCoreRow. Owns a list of
 * confirmed selections and renders an "add another" row at the bottom.
 */
export function ElectivePicker({
  groupedEquivalents,
  title,
}: ElectivePickerProps) {
  const [selections, setSelections] = useState<Selection[]>([]);

  const addSelection = (selection: Selection) =>
    setSelections((prev) => [...prev, selection]);

  const removeAt = (index: number) =>
    setSelections((prev) => prev.filter((_, i) => i !== index));

  return (
    <>
      {selections.map((selection, index) => (
        <ConfirmedElectiveRow
          key={`${selection.equivalent.className}-${index}`}
          title={title}
          selection={selection}
          onRemove={() => removeAt(index)}
        />
      ))}
      <PickElectiveRow
        groupedEquivalents={groupedEquivalents}
        title={title}
        onConfirm={addSelection}
      />
    </>
  );
}

interface ConfirmedElectiveRowProps {
  title: string;
  selection: Selection;
  onRemove: () => void;
}

function ConfirmedElectiveRow({
  title,
  selection,
  onRemove,
}: ConfirmedElectiveRowProps) {
  return (
    <TableRow>
      <TableCell>{title}</TableCell>
      <TableCell>{selection.department}</TableCell>
      <TableCell>
        <Button variant="outline" className="w-full h-full" disabled>
          {selection.equivalent.className}
        </Button>
      </TableCell>
      <SelectedRowDetails selected={selection.equivalent} onClear={onRemove} />
    </TableRow>
  );
}

interface PickElectiveRowProps {
  groupedEquivalents: GroupedEquivalents;
  title: string;
  onConfirm: (selection: Selection) => void;
}

function PickElectiveRow({
  groupedEquivalents,
  title,
  onConfirm,
}: PickElectiveRowProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<Selection>();

  const confirm = () => {
    if (pending) {
      onConfirm(pending);
      setPending(undefined);
    }
    setOpen(false);
  };

  return (
    <TableRow>
      <TableCell>{title}</TableCell>
      <TableCell></TableCell>
      <TableCell>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" className="w-full h-full">
              + Choose Equivalent Elective
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-screen-lg mt-5 overflow-y-scroll max-h-screen">
            <DialogHeader>
              <DialogTitle className="text-xl">Options For {title}</DialogTitle>
            </DialogHeader>
            <div>
              <DepartmentAccordion
                groupedEquivalents={groupedEquivalents}
                pending={pending}
                onSelect={setPending}
              />
            </div>
            <DialogFooter>
              <Button
                variant={pending ? "default" : "secondary"}
                className="w-full"
                onClick={confirm}
              >
                {pending ? "Select Elective" : "Close"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TableCell>
    </TableRow>
  );
}

interface DepartmentAccordionProps {
  groupedEquivalents: GroupedEquivalents;
  pending: Selection | undefined;
  onSelect: (selection: Selection | undefined) => void;
}

function DepartmentAccordion({
  groupedEquivalents,
  pending,
  onSelect,
}: DepartmentAccordionProps) {
  const departments = Object.entries(groupedEquivalents).filter(
    ([, equivalents]) => equivalents.length > 0
  );

  return (
    <Accordion type="single" collapsible>
      {departments.map(([department, equivalents]) => (
        <AccordionItem key={department} value={`item-${department}`}>
          <AccordionTrigger className="text-lg">
            {`${department}: ${equivalents.length} options`}
          </AccordionTrigger>
          <AccordionContent>
            <EquivalencyGrid
              equivalents={equivalents.filter((eq) => eq.creditHours !== "0.0")}
              selected={
                pending?.department === department ? pending.equivalent : undefined
              }
              onSelect={(equivalent) =>
                onSelect(equivalent ? { equivalent, department } : undefined)
              }
            />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
