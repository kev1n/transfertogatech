import { SchoolEquivalency } from "@/types/mongo/mongotypes";

const MONTH_IN_SECONDS = 30 * 24 * 60 * 60;

export default async function getEquivalencies(schoolId: string) {
  const res = await fetch(
    `/api/mongo/getAllEquivalentsForSchool?schoolId=${schoolId}`,
    {
      next: { revalidate: MONTH_IN_SECONDS },
    }
  );
  const equivalencies: SchoolEquivalency = await res.json();
  return equivalencies;
}
