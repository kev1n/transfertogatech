import LZ from "lz-string";
import type { PicksMap, Pick } from "@/lib/planner/picks";

/**
 * URL share format. Opaque (`?s=…`), short, and version-tagged so we can
 * change the schema later without breaking existing links.
 *
 * Format v1: `1.<lz-base64>` where the inner JSON is:
 *   { v: 1, sv: "<schoolValue>", sl: "<schoolLabel>",
 *     mv: "<majorValue>", ml: "<majorLabel>",
 *     p: { [slotKey]: ["t", code, title, gt, cr] | ["a", examId, score, gt, cr] } }
 *
 * The picks array form is dense to keep URLs short; tagged unions decode
 * back into the typed Pick.
 */

export interface SharePayload {
  school: { value: string; label: string };
  major: { value: string; label: string };
  picks: PicksMap;
}

type EncodedPick =
  | ["t", string, string, string, number]
  | ["a", string, 3 | 4 | 5, string, number];

interface EncodedV1 {
  v: 1;
  sv: string;
  sl: string;
  mv: string;
  ml: string;
  p: Record<string, EncodedPick>;
}

function encodePick(pick: Pick): EncodedPick {
  if (pick.kind === "transfer") {
    return ["t", pick.sourceCode, pick.sourceTitle, pick.gtCourse, pick.credits];
  }
  return ["a", pick.examId, pick.score, pick.gtCourse, pick.credits];
}

function decodePick(encoded: EncodedPick): Pick | null {
  if (encoded[0] === "t") {
    return {
      kind: "transfer",
      sourceCode: encoded[1],
      sourceTitle: encoded[2],
      gtCourse: encoded[3],
      credits: encoded[4],
    };
  }
  if (encoded[0] === "a") {
    return {
      kind: "ap",
      examId: encoded[1],
      score: encoded[2],
      gtCourse: encoded[3],
      credits: encoded[4],
    };
  }
  return null;
}

export function encodeShare(payload: SharePayload): string {
  const compact: EncodedV1 = {
    v: 1,
    sv: payload.school.value,
    sl: payload.school.label,
    mv: payload.major.value,
    ml: payload.major.label,
    p: Object.fromEntries(
      Object.entries(payload.picks).map(([key, pick]) => [key, encodePick(pick)])
    ),
  };
  const compressed = LZ.compressToEncodedURIComponent(JSON.stringify(compact));
  return `1.${compressed}`;
}

export function decodeShare(value: string): SharePayload | null {
  if (!value) return null;
  const [version, body] = value.split(".", 2);
  if (version !== "1" || !body) return null;
  try {
    const json = LZ.decompressFromEncodedURIComponent(body);
    if (!json) return null;
    const parsed = JSON.parse(json) as EncodedV1;
    if (parsed.v !== 1) return null;

    const picks: PicksMap = {};
    for (const [key, encoded] of Object.entries(parsed.p ?? {})) {
      const pick = decodePick(encoded);
      if (pick) picks[key] = pick;
    }

    return {
      school: { value: parsed.sv, label: parsed.sl },
      major: { value: parsed.mv, label: parsed.ml },
      picks,
    };
  } catch {
    return null;
  }
}
