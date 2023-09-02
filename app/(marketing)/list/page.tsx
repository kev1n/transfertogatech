"use client";

import ClassPickerForm from "@/components/class-picker-form";
import {
  ConfigForm,
  SchoolMajorContext,
  SchoolMajorContextProvider,
} from "@/components/config-form";
import { useContext } from "react";

export default function List() {
  return (
    <section
      id="features"
      className="container space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24"
    >
      <SchoolMajorContextProvider>
        <ConfigForm />
        <ClassPickerForm />
      </SchoolMajorContextProvider>
    </section>
  );
}
