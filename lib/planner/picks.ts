/**
 * A `Pick` is the user's chosen credit source for one slot. Either a
 * transfer course at their current school, or an AP exam.
 */

export type Pick =
  | {
      kind: "transfer";
      /** The transfer course code at the source school (e.g., "MAT 2211"). */
      sourceCode: string;
      /** Source school's title for the course (display only). */
      sourceTitle: string;
      /** GT course this picks satisfies. */
      gtCourse: string;
      /** Credit hours of the source course. */
      credits: number;
    }
  | {
      kind: "ap";
      /** AP exam id from apCredits.ts. */
      examId: string;
      /** Score the user reports (3, 4, or 5). */
      score: 3 | 4 | 5;
      /** GT course this picks satisfies. */
      gtCourse: string;
      /** Credit hours awarded by the grant. */
      credits: number;
    };

export type PicksMap = Record<string, Pick>; // slotKey → Pick
