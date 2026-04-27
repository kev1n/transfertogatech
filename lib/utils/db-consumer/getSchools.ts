import { fetchJson } from "@/lib/utils/fetchJson";

export type SchoolOptions = {
  value: string;
  label: string;
};

export default async function getSchools(): Promise<SchoolOptions[]> {
  return fetchJson<SchoolOptions[]>(`/api/mongo/getAllSchools`);
}
