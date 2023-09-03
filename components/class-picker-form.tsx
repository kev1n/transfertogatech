"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useContext, useEffect, useState } from "react";
import { SchoolMajorContext } from "./config-form";
import { Requirement, majors } from "@/assets/gatech/majors";
import getEquivalencies from "@/lib/utils/db-consumer/getEquivalencies";
import { Class, SchoolEquivalency } from "@/types/mongo/mongotypes";
import { Button } from "./ui/button";
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "./icons";

export default function ClassPickerForm() {
  const { schoolLabel, schoolValue, majorLabel, majorValue } =
    useContext(SchoolMajorContext);
  const [equivalencies, setEquivalencies] = useState<SchoolEquivalency>();

  const requirements = majors[majorValue] && majors[majorValue].requirements;

  useEffect(() => {
    if (!schoolValue) return;

    async function fetchTheEquivalencies(schoolValue: string) {
      const equivalencies = await getEquivalencies(schoolValue);
      setEquivalencies(equivalencies);
    }

    fetchTheEquivalencies(schoolValue);
  }, [schoolValue]);

  return (
    <Table>
      <TableCaption>Select the school and major to get started.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Subject</TableHead>
          <TableHead>GT Class</TableHead>
          <TableHead>Your Equivalent</TableHead>
          <TableHead>Class Name</TableHead>
          <TableHead>Transfer Credits</TableHead>
          <TableHead className="text-right">Close</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requirements &&
          Object.entries(requirements).map(([subjectName, requirements]) => (
            <>
              <SubjectRows
                key={schoolValue + subjectName}
                subjectName={subjectName}
                schoolValue={schoolValue}
                requirements={requirements}
                equivalents={equivalencies?.equivalents}
              />
            </>
          ))}
      </TableBody>
    </Table>
  );
}

interface SubjectRowProps {
  subjectName: string;
  schoolValue?: string;
  requirements: Requirement;
  equivalents?: Class[];
}

function LabScienceRow({
  subjectName,
  requirements,
  equivalents,
}: SubjectRowProps) {
  const parsedValidGTClasses = requirements.OR?.map((gtClass) =>
    removeSpacesAndLowercase(gtClass)
  );

  return (
    <>
      <ClassRow
        subject={subjectName}
        gtClass="CHEM, BIO, PHYS, or EAS lab"
        equivalencies={equivalents?.filter((equivalent) =>
          parsedValidGTClasses?.includes(
            removeSpacesAndLowercase(equivalent.gaEquivalent)
          )
        )}
      />
    </>
  );
}
function SubjectRows({
  subjectName,
  schoolValue,
  requirements,
  equivalents,
}: SubjectRowProps) {
  if (!schoolValue) return null;

  const firstRowGTClass =
    (requirements.AND && requirements.AND[0]) ||
    (requirements.OR && requirements.OR[0]);
  return (
    <>
      {subjectName === "LAB1" || subjectName === "LAB2" ? (
        <LabScienceRow
          key={subjectName}
          subjectName={subjectName}
          schoolValue={schoolValue}
          requirements={requirements}
          equivalents={equivalents}
        />
      ) : (
        <>
          <ClassRow
            key={firstRowGTClass}
            subject={subjectName}
            gtClass={firstRowGTClass}
            equivalencies={equivalents?.filter(
              (equivalent) =>
                removeSpacesAndLowercase(equivalent.gaEquivalent) ===
                removeSpacesAndLowercase(firstRowGTClass!)
            )}
          />
          {requirements.AND && (
            <>
              {requirements.AND.length > 1 && <IrrelevantRow option="AND" />}
              {requirements.AND.slice(1, requirements.AND.length).map((item) =>
                item == "MATH 1552" ? (
                  <ClassRow
                    key={item}
                    gtClass={item}
                    equivalencies={equivalents?.filter((equivalent) =>
                      ["math1552", "math1x52", "math15x2"].includes(
                        removeSpacesAndLowercase(equivalent.gaEquivalent)
                      )
                    )}
                  />
                ) : (
                  <ClassRow
                    key={item}
                    gtClass={item}
                    equivalencies={equivalents?.filter(
                      (equivalent) =>
                        removeSpacesAndLowercase(equivalent.gaEquivalent) ===
                        removeSpacesAndLowercase(item)
                    )}
                  />
                )
              )}
            </>
          )}
          {requirements.OR && (
            <>
              {requirements.OR.length > 1 && <IrrelevantRow option="OR" />}
              {requirements.OR.slice(1, requirements.OR.length).map((item) => (
                <ClassRow
                  key={item}
                  gtClass={item}
                  equivalencies={equivalents?.filter(
                    (equivalent) =>
                      removeSpacesAndLowercase(equivalent.gaEquivalent) ===
                      removeSpacesAndLowercase(item)
                  )}
                />
              ))}
            </>
          )}
        </>
      )}
    </>
  );
}

function IrrelevantRow({ option }: { option: "AND" | "OR" }) {
  return (
    <TableRow>
      <TableCell></TableCell>
      <TableCell>{option}</TableCell>
    </TableRow>
  );
}

interface RowProps {
  subject?: string;
  gtClass?: string;
  equivalencies?: Class[];
}

function ClassRow({ subject, gtClass, equivalencies }: RowProps) {
  const [selectedClass, setSelectedClass] = useState<Class>();
  const [selectedClassConfirmed, setSelectedClassConfirmed] = useState<Class>();

  const [open, setOpen] = useState(false);

  return (
    <TableRow>
      <TableCell>{subject}</TableCell>
      <TableCell>{gtClass}</TableCell>
      <TableCell>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant={selectedClassConfirmed ? "outline" : "secondary"}
              className="w-full"
            >
              {selectedClassConfirmed
                ? selectedClassConfirmed.className
                : "+ Choose Equivalent Class"}
            </Button>
          </DialogTrigger>
          {/*<DialogContent className="overflow-y-scroll max-h-screen">*/}
          <DialogContent className="max-w-screen-md mt-5 overflow-y-scroll max-h-screen">
            <DialogHeader>
              <DialogTitle>Options For Georgia's {gtClass}</DialogTitle>
              <DialogDescription>
                {equivalencies?.length === 0 &&
                  "No equivalencies found. This could either mean that this school does not have the necessary courses to satisfy the GT requirement, or that not all of the appropriate courses have been evaluated yet"}
                <div className="mt-2 grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-2">
                  {equivalencies?.map((equivalent) => (
                    <Card
                      key={equivalent.className}
                      className={`cursor-pointer hover:border-primary ${
                        selectedClass?.className === equivalent.className &&
                        "border-primary"
                      }`}
                      onClick={() => setSelectedClass(equivalent)}
                    >
                      <CardHeader>
                        <CardTitle>{equivalent.className}</CardTitle>
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
                  ))}
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                className="w-full"
                onClick={() => {
                  setSelectedClassConfirmed(selectedClass);
                  setOpen(false);
                }}
              >
                {equivalencies?.length === 0 ? "Close" : "Select Class"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TableCell>
      {selectedClassConfirmed && (
        <>
          <TableCell>{selectedClassConfirmed.title}</TableCell>
          <TableCell>{selectedClassConfirmed.creditHours}</TableCell>
          <TableCell>
            <Icons.close
              className="float-right cursor-pointer"
              onClick={() => {
                setSelectedClass(undefined);
                setSelectedClassConfirmed(undefined);
              }}
            />
          </TableCell>
        </>
      )}
    </TableRow>
  );
}

//function that takes in a string and removes all spaces and lowercases the string
function removeSpacesAndLowercase(str: string) {
  return str.replace(/\s/g, "").toLowerCase();
}
