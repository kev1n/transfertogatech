"use client";

import { useContext } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SchoolMajorContext } from "./config-form";
import { majors } from "@/assets/gatech/majors";
import { useSchoolEquivalencies } from "@/hooks/useSchoolEquivalencies";
import { groupByCoreArea } from "@/lib/matching/groupByCoreArea";
import { groupByDepartment } from "@/lib/matching/groupByDepartment";
import { SubjectRows } from "./class-picker/SubjectRows";
import { ElectivePicker } from "./class-picker/ElectivePicker";

export default function ClassPickerForm() {
  const { schoolLabel, schoolValue, majorValue } =
    useContext(SchoolMajorContext);

  const equivalencies = useSchoolEquivalencies(schoolValue);
  const requirements = majors[majorValue]?.requirements;
  const equivalents = equivalencies?.equivalents;

  const coreAreaGroups = groupByCoreArea(equivalents);
  const departmentGroups = groupByDepartment(equivalents);

  const showElectives = Boolean(equivalencies && schoolValue && majorValue);

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
          schoolValue &&
          Object.entries(requirements).map(([subjectName, requirement]) => (
            <SubjectRows
              key={schoolValue + subjectName}
              subjectName={subjectName}
              requirement={requirement}
              equivalents={equivalents}
            />
          ))}
        {showElectives && (
          <>
            <ElectivePicker
              groupedEquivalents={coreAreaGroups}
              title="Core GT Classes"
            />
            <ElectivePicker
              groupedEquivalents={departmentGroups}
              title="All Transferable Classes"
            />
          </>
        )}
      </TableBody>
    </Table>
  );
}
