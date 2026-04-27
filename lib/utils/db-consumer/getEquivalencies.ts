import { SchoolEquivalency } from "@/types/mongo/mongotypes";
import { fetchJson } from "@/lib/utils/fetchJson";

export default async function getEquivalencies(
  schoolId: string
): Promise<SchoolEquivalency> {
  return fetchJson<SchoolEquivalency>(
    `/api/mongo/getAllEquivalentsForSchool?schoolId=${encodeURIComponent(schoolId)}`
  );
}
