import { SchoolEquivalency } from "@/types/mongo/mongotypes";

const MONTH_IN_SECONDS = 30 * 24 * 60 * 60;

export default async function getEquivalencies(schoolId: string) {
  const base_url = checkEnvironment();
  const res = await fetch(
    `${base_url}/api/mongo/getAllEquivalentsForSchool?schoolId=${schoolId}`,
    {
      next: { revalidate: MONTH_IN_SECONDS },
    }
  );
  const equivalencies: SchoolEquivalency = await res.json();
  return equivalencies;
}

export const checkEnvironment = () => {
  let base_url =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://transfertogatech.vercel.app";

  return base_url;
};
