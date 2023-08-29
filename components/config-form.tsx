"use client";

import { Button } from "@/components/ui/button";
import { Combobox } from "./combobox";
import getSchools from "@/lib/utils/db-consumer/getSchools";
import { useState } from "react";

export function ProfileForm() {
  const [schoolLabel, setSchoolLabel] = useState<string>("");
  const [schoolValue, setSchoolValue] = useState<string>("");

  console.log(schoolLabel, schoolValue)
  return (
    <form className="space-y-8 lg:mx-10 md:mx-8">
      <Combobox
        optionsFetcher={getSchools}
        placeholder="Select your school"
        noOptionsMessage="No schools found"
        searchString="Search for a school"
        value={schoolValue}
        setValue={setSchoolValue}
        label={schoolLabel}
        setLabel={setSchoolLabel}
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}
