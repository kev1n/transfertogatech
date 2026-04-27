"use client";

import { Class } from "@/types/mongo/mongotypes";
import { TableCell } from "@/components/ui/table";
import { Icons } from "@/components/icons";

interface SelectedRowDetailsProps {
  selected: Class;
  onClear: () => void;
}

/**
 * Renders the trailing three cells (title, credits, close icon) shown
 * after a user has confirmed an equivalent class for a row.
 */
export function SelectedRowDetails({
  selected,
  onClear,
}: SelectedRowDetailsProps) {
  return (
    <>
      <TableCell>{selected.title}</TableCell>
      <TableCell>{selected.creditHours}</TableCell>
      <TableCell>
        <Icons.close
          className="float-right cursor-pointer"
          onClick={onClear}
        />
      </TableCell>
    </>
  );
}
