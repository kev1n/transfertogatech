"use client";

import { Class } from "@/types/mongo/mongotypes";
import { Requirement } from "@/assets/gatech/majors";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  resolveRequirement,
  filterByCourse,
} from "@/lib/matching/matchRequirement";
import {
  isLabSubject,
  labDisclaimer,
  LAB_REQUIREMENT_LABEL,
} from "@/lib/matching/labRequirements";
import { ClassRow } from "./ClassRow";

interface SubjectRowsProps {
  subjectName: string;
  requirement: Requirement;
  equivalents?: Class[];
}

export function SubjectRows({
  subjectName,
  requirement,
  equivalents,
}: SubjectRowsProps) {
  if (isLabSubject(subjectName)) {
    return (
      <MultiOptionRow
        subject={subjectName}
        requirement={requirement}
        equivalents={equivalents}
        label={LAB_REQUIREMENT_LABEL}
        disclaimer={labDisclaimer(subjectName)}
      />
    );
  }

  if (requirement.OR) {
    return (
      <MultiOptionRow
        subject={subjectName}
        requirement={requirement}
        equivalents={equivalents}
        label={`Multiple ${subjectName} options`}
      />
    );
  }

  return (
    <AndRequirementRows
      subjectName={subjectName}
      requirement={requirement}
      equivalents={equivalents}
    />
  );
}

interface MultiOptionRowProps {
  subject: string;
  requirement: Requirement;
  equivalents?: Class[];
  label: string;
  disclaimer?: string;
}

function MultiOptionRow({
  subject,
  requirement,
  equivalents,
  label,
  disclaimer,
}: MultiOptionRowProps) {
  const [resolved] = resolveRequirement(requirement, equivalents);
  if (!resolved) return null;
  return (
    <ClassRow
      subject={subject}
      gtClassLabel={label}
      dialogTitleSuffix={resolved.label}
      equivalents={resolved.matches}
      disclaimer={disclaimer}
    />
  );
}

function AndRequirementRows({
  subjectName,
  requirement,
  equivalents,
}: Omit<SubjectRowsProps, "equivalents"> & { equivalents?: Class[] }) {
  const andCourses = requirement.AND ?? [];
  if (andCourses.length === 0) return null;

  const [firstCourse, ...restCourses] = andCourses;

  return (
    <>
      <ClassRow
        subject={subjectName}
        gtClassLabel={firstCourse}
        dialogTitleSuffix={firstCourse}
        equivalents={filterByCourse(equivalents, firstCourse)}
      />
      {restCourses.length > 0 && <AndSeparatorRow />}
      {restCourses.map((course) => (
        <ClassRow
          key={course}
          gtClassLabel={course}
          dialogTitleSuffix={course}
          equivalents={filterByCourse(equivalents, course)}
        />
      ))}
    </>
  );
}

function AndSeparatorRow() {
  return (
    <TableRow>
      <TableCell></TableCell>
      <TableCell>AND</TableCell>
    </TableRow>
  );
}
