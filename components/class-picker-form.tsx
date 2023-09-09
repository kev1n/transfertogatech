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
import { cores } from "@/assets/gatech/core";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

  //Core classes grouped
  let groupedEquivalentsCore: GroupedEquivalents = {};

  for (const core in cores) {
    const coreCourses = cores[core].courses.map((course) =>
      removeSpacesAndLowercase(course)
    );

    const matches: Class[] = [];
    const equivalents = equivalencies?.equivalents!;
    for (const equivalent in equivalents) {
      const equivalentCourse = removeSpacesAndLowercase(
        equivalents[equivalent].gaEquivalent
      );
      if (coreCourses.includes(equivalentCourse)) {
        matches.push(equivalents[equivalent]);
      }
    }
    groupedEquivalentsCore[core] = matches;
  }

  //Electives grouped
  const groupedEquivalentsElectives = equivalencies?.equivalents!.reduce(
    (acc: GroupedEquivalents, equivalent) => {
      //note: the split on the next line uses an invisible character
      const department = equivalent.className.split("  ")[0]; // Assuming the format is always "DEPARTMENT NUMBER"

      if (equivalent.creditHours == "0.0") return acc;
      if (!acc[department]) {
        acc[department] = [];
      }
      acc[department].push(equivalent);
      return acc;
    },
    {}
  );

  return (
    <Table>
      <TableCaption>
        {schoolValue && majorValue
          ? `Transfer Plan from ${schoolLabel} to Georgia Tech`
          : "Select the school and major to get started."}
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[75px]">Subject</TableHead>
          <TableHead className="w-[150px]">GT Class</TableHead>
          <TableHead className="w-[250px]">Equivalent</TableHead>
          <TableHead className="w-[150px]">Class Name</TableHead>
          <TableHead className="w-[30px]">Credits</TableHead>
          <TableHead className="w-[30px] text-right">Close</TableHead>
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
        {equivalencies && schoolValue && majorValue && (
          <>
            <ElectiveAndCoreRow
              groupedEquivalents={groupedEquivalentsCore}
              title="Core GT Classes"
            />
            <ElectiveAndCoreRow
              groupedEquivalents={groupedEquivalentsElectives!}
              title="All Transferable Classes"
            />
          </>
        )}
      </TableBody>
    </Table>
  );
}

interface MultipleOrRowProps {
  subjectName: string;
  requirements: Requirement;
  equivalents?: Class[];
  label: string;
  disclaimer?: string;
}

function MultipleOrRow({
  subjectName,
  requirements,
  equivalents,
  label,
  disclaimer,
}: MultipleOrRowProps) {
  const parsedValidGTClasses = requirements.OR?.map((gtClass) =>
    removeSpacesAndLowercase(gtClass)
  );
  const matchedEquivalencies = equivalents?.filter((equivalent) =>
    parsedValidGTClasses?.includes(
      removeSpacesAndLowercase(equivalent.gaEquivalent)
    )
  );

  let popoverLabel = "";
  //return a string of the gtClasses
  requirements.OR?.map((req) => {
    popoverLabel += popoverLabel ? ` OR ${req}` : req;
  });

  return (
    <>
      <ClassRow
        subject={subjectName}
        gtClass={label}
        equivalencies={matchedEquivalencies}
        popoverLabel={popoverLabel}
        disclaimer={disclaimer}
      />
    </>
  );
}

interface SubjectRowProps {
  subjectName: string;
  schoolValue: string;
  requirements: Requirement;
  equivalents?: Class[];
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
        <MultipleOrRow
          key={subjectName}
          subjectName={subjectName}
          requirements={requirements}
          equivalents={equivalents}
          label={"CHEM, BIO, PHYS, or EAS lab"}
          disclaimer={
            subjectName === "LAB2"
              ? "NOTE: If you are in computer science, you need a two-course lab science SEQUENCE."
              : undefined
          }
        />
      ) : requirements.OR ? (
        <MultipleOrRow
          key={subjectName}
          subjectName={subjectName}
          requirements={requirements}
          equivalents={equivalents}
          label={`Multiple ${subjectName} options`}
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
  popoverLabel?: string;
  disclaimer?: string;
}

function ClassRow({
  subject,
  gtClass,
  equivalencies,
  popoverLabel,
  disclaimer,
}: RowProps) {
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
              className="w-full h-full"
            >
              {selectedClassConfirmed
                ? selectedClassConfirmed.className
                : "+ Choose Equivalent Class"}
            </Button>
          </DialogTrigger>
          {/*<DialogContent className="overflow-y-scroll max-h-screen">*/}
          <DialogContent className="max-w-screen-lg mt-5 overflow-y-scroll max-h-screen">
            <DialogHeader>
              <DialogTitle className="text-xl">
                Options For Georgia's {popoverLabel ? popoverLabel : gtClass}
              </DialogTitle>
              <DialogDescription>
                <h1 className="text-lg">{disclaimer}</h1>
                {equivalencies?.length === 0 &&
                  "No equivalencies found. This could either mean that this school does not have the necessary courses to satisfy the GT requirement, or that not all of the appropriate courses have been evaluated yet. If you have AP credit for this course, you may not need an equivalent."}

                <div className="mt-2 grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 xs:grid-cols-1 gap-2">
                  {equivalencies?.map((equivalent) => (
                    <Card
                      key={equivalent.className}
                      className={`cursor-pointer hover:border-primary ${
                        selectedClass?.className === equivalent.className &&
                        "border-primary"
                      }`}
                      onClick={() => {
                        if (selectedClass?.className === equivalent.className) {
                          setSelectedClass(undefined);
                        } else {
                          setSelectedClass(equivalent);
                        }
                      }}
                    >
                      <CardHeader>
                        <CardTitle>
                          <div className="flex items-center justify-between">
                            {equivalent.className}
                            <div className="w-7 h-7 border-2 border-gray-800 dark:border-gray-200 rounded-full relative">
                              {selectedClass?.className ===
                                equivalent.className && (
                                <div className="absolute bg-gray-800 dark:bg-gray-200 rounded-full w-5 h-5 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                              )}
                            </div>
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
                  ))}
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant={selectedClass ? "default" : "secondary"}
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

interface ElectiveAndCoreRowProps {
  groupedEquivalents: GroupedEquivalents;
  title: string;
}
type GroupedEquivalents = {
  [key: string]: Class[]; // or be more specific with the type if you have one for `equivalent`
};

function ElectiveAndCoreRow({
  groupedEquivalents,
  title,
}: ElectiveAndCoreRowProps) {
  const [selectedElective, setSelectedElective] = useState<Class>();
  const [selectedElectiveConfirmed, setSelectedElectiveConfirmed] =
    useState<Class>();
  const [subject, setSubject] = useState<string>("");

  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow>
        <TableCell>{title}</TableCell>
        <TableCell>{subject}</TableCell>
        <TableCell>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                variant={selectedElectiveConfirmed ? "outline" : "ghost"}
                className="w-full h-full"
              >
                {selectedElectiveConfirmed
                  ? selectedElectiveConfirmed.className
                  : "+ Choose Equivalent Elective"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-screen-lg mt-5 overflow-y-scroll max-h-screen">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  Options For {title}
                </DialogTitle>
                <DialogDescription>
                  <Accordion type="single" collapsible>
                    {groupedEquivalents &&
                      Object.entries(groupedEquivalents).map(
                        ([department, deptEquivalents]) => (
                          <AccordionItem
                            key={department}
                            value={`item-${department}`}
                          >
                            <AccordionTrigger className="text-lg">
                              {`${department}: ${deptEquivalents.length} options`}
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="mt-2 grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 xs:grid-cols-1 gap-2">
                                {deptEquivalents.map(
                                  (equivalent) =>
                                    equivalent.creditHours != "0.0" && (
                                      <Card
                                        key={
                                          equivalent.className +
                                          equivalent.gaEquivalent
                                        }
                                        className={`cursor-pointer hover:border-primary ${
                                          selectedElective?.className ===
                                            equivalent.className &&
                                          "border-primary"
                                        }`}
                                        onClick={() => {
                                          if (
                                            selectedElective?.className ===
                                            equivalent.className
                                          ) {
                                            setSelectedElective(undefined);
                                            setSubject("");
                                          } else {
                                            setSelectedElective(equivalent);
                                            setSubject(department);
                                          }
                                        }}
                                      >
                                        <CardHeader>
                                          <CardTitle>
                                            <div className="flex items-center justify-between">
                                              {equivalent.className}
                                              <div className="w-7 h-7 border-2 border-gray-800 dark:border-gray-200 rounded-full relative">
                                                {selectedElective?.className ===
                                                  equivalent.className && (
                                                  <div className="absolute bg-gray-800 dark:bg-gray-200 rounded-full w-5 h-5 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                                                )}
                                              </div>
                                            </div>
                                          </CardTitle>
                                          <CardDescription>
                                            {equivalent.title}
                                          </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                          <p>
                                            {equivalent.className} -&gt;{" "}
                                            {equivalent.gaEquivalent}
                                          </p>
                                        </CardContent>
                                        <CardFooter>
                                          <p>
                                            {equivalent.creditHours} credits
                                          </p>
                                        </CardFooter>
                                      </Card>
                                    )
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        )
                      )}
                  </Accordion>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant={selectedElective ? "default" : "secondary"}
                  className="w-full"
                  onClick={() => {
                    setSelectedElectiveConfirmed(selectedElective);
                    setOpen(false);
                  }}
                >
                  {selectedElective ? "Select Elective" : "Close"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TableCell>
        {selectedElectiveConfirmed && (
          <>
            <TableCell>{selectedElectiveConfirmed.title}</TableCell>
            <TableCell>{selectedElectiveConfirmed.creditHours}</TableCell>
            <TableCell>
              <Icons.close
                className="float-right cursor-pointer"
                onClick={() => {
                  setSelectedElective(undefined);
                  setSelectedElectiveConfirmed(undefined);
                }}
              />
            </TableCell>
          </>
        )}
      </TableRow>
      {selectedElectiveConfirmed && (
        <ElectiveAndCoreRow
          groupedEquivalents={groupedEquivalents}
          title={title}
        />
      )}
    </>
  );
}
