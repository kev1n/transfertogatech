"use client";

import { Combobox } from "./combobox";
import getSchools from "@/lib/utils/db-consumer/getSchools";
import { getMajors } from "@/assets/gatech/majors";
import { createContext, useContext, useState } from "react";

// Create a context for the school and major states
export const SchoolMajorContext = createContext<{
  schoolLabel: string;
  setSchoolLabel: (label: string) => void;
  schoolValue: string;
  setSchoolValue: (value: string) => void;
  majorLabel: string;
  setMajorLabel: (label: string) => void;
  majorValue: string;
  setMajorValue: (value: string) => void;
}>({
  schoolLabel: "",
  schoolValue: "",
  majorLabel: "",
  majorValue: "",
  setSchoolLabel: () => {},
  setSchoolValue: () => {},
  setMajorLabel: () => {},
  setMajorValue: () => {},
});

interface SchoolMajorContextProviderProps {
  children: React.ReactNode;
}

export function SchoolMajorContextProvider({
  children,
}: SchoolMajorContextProviderProps) {
  const [schoolLabel, setSchoolLabel] = useState("");
  const [schoolValue, setSchoolValue] = useState("");
  const [majorLabel, setMajorLabel] = useState("");
  const [majorValue, setMajorValue] = useState("");

  return (
    <SchoolMajorContext.Provider
      value={{
        schoolLabel,
        setSchoolLabel,
        schoolValue,
        setSchoolValue,
        majorLabel,
        setMajorLabel,
        majorValue,
        setMajorValue,
      }}
    >
      {children}
    </SchoolMajorContext.Provider>
  );
}

export function ConfigForm() {
  const {
    schoolLabel,
    setSchoolLabel,
    schoolValue,
    setSchoolValue,
    majorLabel,
    setMajorLabel,
    majorValue,
    setMajorValue,
  } = useContext(SchoolMajorContext);

  return (
    <form className="flex">
      <Combobox
        optionsFetcher={getSchools}
        placeholder="Select your school"
        noOptionsMessage="No school found"
        searchString="Search for a school"
        value={schoolValue}
        setValue={setSchoolValue}
        label={schoolLabel}
        setLabel={setSchoolLabel}
      />
      <Combobox
        optionsFetcher={getMajors}
        placeholder="Select your major"
        noOptionsMessage="No major found"
        searchString="Search for a major"
        value={majorValue}
        setValue={setMajorValue}
        label={majorLabel}
        setLabel={setMajorLabel}
      />
    </form>
  );
}
