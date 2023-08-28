"use client";

import { Button } from "@/components/ui/button";
import { Combobox } from "./combobox";
import { useState } from "react";

export function ProfileForm() {
  const [school, setSchool] = useState("");

  function onSubmit() {}

  return (
    <form onSubmit={onSubmit} className="space-y-8 lg:mx-10 md:mx-8">
      <Combobox
        options={[{ value: "hi", label: "hi" }]}
        placeholder="hi"
        noOptionsMessage="No schools found"
        searchString="Search for a school"
        value={school}
        setValue={setSchool}
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}
