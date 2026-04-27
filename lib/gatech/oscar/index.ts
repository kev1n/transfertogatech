import { School } from "@/types/mongo/mongotypes";
import { OscarEndpoints, postForm } from "./client";
import { parseStates } from "./parseStates";
import { parseSchools } from "./parseSchools";
import { parseSubjects, SchoolSubjects } from "./parseSubjects";
import { parseEquivalencies } from "./parseEquivalencies";
import { Class } from "@/types/mongo/mongotypes";

export async function fetchStates(): Promise<string[]> {
  const html = await postForm(OscarEndpoints.findState, {});
  return parseStates(html);
}

export async function fetchSchoolsInState(state: string): Promise<School[]> {
  const html = await postForm(OscarEndpoints.findSchool, { state_in: state });
  return parseSchools(html, state);
}

export async function fetchSubjectsInSchool(
  state: string,
  schoolId: string
): Promise<SchoolSubjects> {
  const html = await postForm(OscarEndpoints.findSubjLevl, {
    state_in: state,
    sbgi_in: schoolId,
  });
  return parseSubjects(html);
}

export async function fetchEquivalencies(
  state: string,
  schoolId: string,
  subjects: string[],
  term: string
): Promise<Class[]> {
  const params = new URLSearchParams();
  params.append("state_in", state);
  params.append("nation_in", "");
  params.append("levl_in", "US");
  params.append("term_in", term);
  params.append("sbgi_in", schoolId);
  params.append("school_in", "");
  for (const subject of subjects) params.append("sel_subj", subject);

  const html = await postForm(OscarEndpoints.findSubjLevlClasses, params);
  return parseEquivalencies(html);
}

export { OscarEndpoints };
