"use client";

import { createContext, Dispatch, SetStateAction, useContext, useState } from "react";
import { Combobox } from "./combobox";
import getSchools from "@/lib/utils/db-consumer/getSchools";
import { getMajors } from "@/assets/gatech/majors";

interface Selection {
  value: string;
  label: string;
}

const EMPTY: Selection = { value: "", label: "" };

interface SchoolMajorContextValue {
  school: Selection;
  setSchool: Dispatch<SetStateAction<Selection>>;
  major: Selection;
  setMajor: Dispatch<SetStateAction<Selection>>;
  // Backward-compat flat accessors — keep consumers that read the old shape working.
  schoolValue: string;
  schoolLabel: string;
  majorValue: string;
  majorLabel: string;
}

export const SchoolMajorContext = createContext<SchoolMajorContextValue>({
  school: EMPTY,
  setSchool: () => {},
  major: EMPTY,
  setMajor: () => {},
  schoolValue: "",
  schoolLabel: "",
  majorValue: "",
  majorLabel: "",
});

interface SchoolMajorContextProviderProps {
  children: React.ReactNode;
}

export function SchoolMajorContextProvider({
  children,
}: SchoolMajorContextProviderProps) {
  const [school, setSchool] = useState<Selection>(EMPTY);
  const [major, setMajor] = useState<Selection>(EMPTY);

  const value: SchoolMajorContextValue = {
    school,
    setSchool,
    major,
    setMajor,
    schoolValue: school.value,
    schoolLabel: school.label,
    majorValue: major.value,
    majorLabel: major.label,
  };

  return (
    <SchoolMajorContext.Provider value={value}>
      {children}
    </SchoolMajorContext.Provider>
  );
}

export function ConfigForm() {
  const { school, setSchool, major, setMajor } = useContext(SchoolMajorContext);

  return (
    <form className="flex space-x-0 flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
      <Combobox
        optionsFetcher={getSchools}
        placeholder="Select your school"
        noOptionsMessage="No school found"
        searchString="Search for a school"
        value={school.value}
        setValue={(value) => setSchool((prev) => ({ ...prev, value }))}
        label={school.label}
        setLabel={(label) => setSchool((prev) => ({ ...prev, label }))}
      />
      <Combobox
        optionsFetcher={getMajors}
        placeholder="Select your major"
        noOptionsMessage="No major found"
        searchString="Search for a major"
        value={major.value}
        setValue={(value) => setMajor((prev) => ({ ...prev, value }))}
        label={major.label}
        setLabel={(label) => setMajor((prev) => ({ ...prev, label }))}
      />
    </form>
  );
}
