export type SchoolOptions = {
  value: string;
  label: string;
};

const MONTH_IN_SECONDS = 30 * 24 * 60 * 60;

export default async function getSchools() {
  const base_url = checkEnvironment();
  const res = await fetch(`${base_url}/api/mongo/getAllSchools`, {
    next: { revalidate: MONTH_IN_SECONDS },
  });
  const schools: SchoolOptions[] = await res.json();
  return schools;
}

export const checkEnvironment = () => {
  let base_url =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://transfertogatech.vercel.app";

  return base_url;
};
