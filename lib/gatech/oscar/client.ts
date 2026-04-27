import axios from "axios";

const OSCAR_BASE = "https://oscar.gatech.edu/pls/bprod";

export const OscarEndpoints = {
  findState: `${OSCAR_BASE}/wwsktrna.P_find_state`,
  findSchool: `${OSCAR_BASE}/wwsktrna.P_find_school`,
  findSubjLevl: `${OSCAR_BASE}/wwsktrna.P_find_subj_levl`,
  findSubjLevlClasses: `${OSCAR_BASE}/wwsktrna.P_find_subj_levl_classes`,
} as const;

const FORM_HEADERS = {
  "Content-Type": "application/x-www-form-urlencoded",
};

/**
 * POSTs form-encoded data to an Oscar endpoint and returns the raw HTML body.
 * Kept pure-transport so parsers can be unit-tested without hitting the network.
 */
export async function postForm(
  url: string,
  params: URLSearchParams | Record<string, string>
): Promise<string> {
  const body =
    params instanceof URLSearchParams ? params : new URLSearchParams(params);
  const response = await axios.post(url, body, { headers: FORM_HEADERS });
  return response.data as string;
}
