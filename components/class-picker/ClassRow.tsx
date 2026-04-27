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
import { EquivalencyGrid } from "./EquivalencyGrid";
import { SelectedRowDetails } from "./SelectedRowDetails";

interface ClassRowProps {
  subject?: string;
  gtClassLabel: string;
  dialogTitleSuffix: string;
  equivalents: Class[];
  disclaimer?: string;
}

const NO_EQUIVALENTS_MESSAGE =
  "No equivalencies found. This could either mean that this school does not have the necessary courses to satisfy the GT requirement, or that not all of the appropriate courses have been evaluated yet. If you have AP credit for this course, you may not need an equivalent.";

export function ClassRow({
  subject,
  gtClassLabel,
  dialogTitleSuffix,
  equivalents,
  disclaimer,
}: ClassRowProps) {
  const [pending, setPending] = useState<Class>();
  const [confirmed, setConfirmed] = useState<Class>();
  const [open, setOpen] = useState(false);

  const confirmPending = () => {
    setConfirmed(pending);
    setOpen(false);
  };

  const clearConfirmed = () => {
    setPending(undefined);
    setConfirmed(undefined);
  };

  return (
    <TableRow>
      <TableCell>{subject}</TableCell>
      <TableCell>{gtClassLabel}</TableCell>
      <TableCell>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant={confirmed ? "outline" : "secondary"}
              className="w-full h-full"
            >
              {confirmed ? confirmed.className : "+ Choose Equivalent Class"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-screen-lg mt-5 overflow-y-scroll max-h-screen">
            <DialogHeader>
              <DialogTitle className="text-xl">
                Options For Georgia's {dialogTitleSuffix}
              </DialogTitle>
              {disclaimer && (
                <DialogDescription className="text-lg">
                  {disclaimer}
                </DialogDescription>
              )}
            </DialogHeader>
            <div>
              {equivalents.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {NO_EQUIVALENTS_MESSAGE}
                </p>
              )}
              <EquivalencyGrid
                equivalents={equivalents}
                selected={pending}
                onSelect={setPending}
              />
            </div>
            <DialogFooter>
              <Button
                variant={pending ? "default" : "secondary"}
                className="w-full"
                onClick={confirmPending}
              >
                {equivalents.length === 0 ? "Close" : "Select Class"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TableCell>
      {confirmed && (
        <SelectedRowDetails selected={confirmed} onClear={clearConfirmed} />
      )}
    </TableRow>
  );
}
