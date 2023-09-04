export type SchoolOptions = {
  value: string;
  label: string;
};

const MONTH_IN_SECONDS = 30 * 24 * 60 * 60;

export default async function getSchools() {
  const res = await fetch(`/api/mongo/getAllSchools`, {
    next: { revalidate: MONTH_IN_SECONDS },
  });
  const schools: SchoolOptions[] = await res.json();
  return schools;
}
