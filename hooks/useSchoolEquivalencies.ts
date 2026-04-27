"use client";

import { useEffect, useState } from "react";
import { SchoolEquivalency } from "@/types/mongo/mongotypes";
import getEquivalencies from "@/lib/utils/db-consumer/getEquivalencies";

export function useSchoolEquivalencies(schoolId: string | undefined) {
  const [equivalencies, setEquivalencies] = useState<SchoolEquivalency>();

  useEffect(() => {
    if (!schoolId) {
      setEquivalencies(undefined);
      return;
    }
    let cancelled = false;
    getEquivalencies(schoolId).then((data) => {
      if (!cancelled) setEquivalencies(data);
    });
    return () => {
      cancelled = true;
    };
  }, [schoolId]);

  return equivalencies;
}
