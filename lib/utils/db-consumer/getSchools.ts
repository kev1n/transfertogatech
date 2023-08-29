import axios from "axios";

export type SchoolOptions = {
  value: string;
  label: string;
};

export default async function getSchools() {
  const base_url = checkEnvironment();
  const res = await axios.get(`${base_url}/api/mongo/getAllSchools`);
  const schools: SchoolOptions[] = res.data;

  return schools;
}

export const checkEnvironment = () => {
  let base_url =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://example.com";

  return base_url;
};
