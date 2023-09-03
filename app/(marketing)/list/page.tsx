"use client";

import ClassPickerForm from "@/components/class-picker-form";
import {
  ConfigForm,
  SchoolMajorContext,
  SchoolMajorContextProvider,
} from "@/components/config-form";
import { useTheme } from "next-themes";
import { useContext } from "react";

export default function List() {
  const { setTheme, theme } = useTheme();
  return (
    <>
      <section
        id="features"
        className="container space-y-6 bg-slate-50 dark:bg-transparent py-5 md:py-7 lg:py-15"
      >
        <h1 className="text-center text-6xl text-yellow-600 dark:text-yellow-500">
          Plan Your Transfer
        </h1>
        <SchoolMajorContextProvider>
          <ConfigForm />
          <ClassPickerForm />
        </SchoolMajorContextProvider>
      </section>
    </>
  );
}
