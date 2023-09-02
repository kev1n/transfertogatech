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
import { useContext } from "react";
import { SchoolMajorContext } from "./config-form";
import { Requirement, majors } from "@/assets/gatech/majors";

export default function ClassPickerForm() {
  const { schoolLabel, schoolValue, majorLabel, majorValue } =
    useContext(SchoolMajorContext);

  const requirements = majors[majorValue] && majors[majorValue].requirements;

  return (
    <Table>
      <TableCaption>A list of your recent invoices. {schoolLabel}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Subject</TableHead>
          <TableHead>GT Class</TableHead>
          <TableHead>Your School Equivalent</TableHead>
          <TableHead className="text-right">Credits</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requirements &&
          Object.entries(requirements).map(([subjectName, value]) => (
            <>
              <SubjectRows subjectName={subjectName} value={value} />
            </>
          ))}
      </TableBody>
    </Table>
  );
}

interface SubjectRowProps {
  subjectName: string;
  value: Requirement;
}

function SubjectRows({ subjectName, value }: SubjectRowProps) {
  return (
    <>
      {subjectName === "LAB1" || subjectName === "LAB2" ? (
        <ClassRow subject={subjectName} gtClass="CHEM, BIO, PHYS, or EAS lab" />
      ) : (
        <>
          <ClassRow
            subject={subjectName}
            gtClass={(value.AND && value.AND[0]) || (value.OR && value.OR[0])}
          />
          {value.AND && (
            <>
              {value.AND.length > 1 && <IrrelevantRow option="AND" />}
              {value.AND.slice(1, value.AND.length).map((item) => (
                <ClassRow gtClass={item} />
              ))}
            </>
          )}
          {value.OR && (
            <>
              {value.OR.length > 1 && <IrrelevantRow option="OR" />}
              {value.OR.slice(1, value.OR.length).map((item) => (
                <ClassRow gtClass={item} />
              ))}
            </>
          )}
        </>
      )}
    </>
  );
}

interface RowProps {
  subject?: string;
  gtClass?: string;
}

function IrrelevantRow({ option }: { option: "AND" | "OR" }) {
  return (
    <TableRow>
      <TableCell></TableCell>
      <TableCell>{option}</TableCell>
    </TableRow>
  );
}

function ClassRow({ subject, gtClass }: RowProps) {
  return (
    <TableRow key={gtClass}>
      <TableCell>{subject}</TableCell>
      <TableCell>{gtClass}</TableCell>
    </TableRow>
  );
}
