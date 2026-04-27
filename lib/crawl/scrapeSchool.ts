import { Class, School } from "@/types/mongo/mongotypes";
import {
  fetchSubjectsInSchool,
  fetchEquivalencies,
} from "@/lib/gatech/oscar";
import { retryWithBackoff, RetryOptions } from "@/lib/utils/retry";

export interface SchoolEquivalencyScrape {
  school: School;
  equivalents: Class[];
  term: string;
}

const DEFAULT_RETRY: RetryOptions = {
  maxAttempts: 5,
  initialDelayMs: 1_000,
  maxDelayMs: 5 * 60_000,
  factor: 2,
  jitter: true,
};

/**
 * Scrapes one school's full equivalency list with exponential backoff
 * on transient failures (network, Oscar 5xx, parse hiccups). Throws if
 * all attempts are exhausted.
 *
 * Time-budget agnostic: caller is expected to be off Vercel's 10s/60s
 * function limits, so backoff caps generously by default.
 */
export async function scrapeSchoolEquivalencies(
  school: School,
  retryOptions: RetryOptions = DEFAULT_RETRY
): Promise<SchoolEquivalencyScrape> {
  return retryWithBackoff(async () => {
    const { subjects, terms } = await fetchSubjectsInSchool(
      school.state,
      school.id
    );
    const term = terms[0]?.id;
    if (!term) {
      throw new Error(`No terms returned for ${school.name} (${school.id})`);
    }
    const equivalents = await fetchEquivalencies(
      school.state,
      school.id,
      subjects,
      term
    );
    return { school, equivalents, term };
  }, {
    ...retryOptions,
    onRetry: (attempt, error, nextDelay) => {
      console.log(
        `[${school.name}] attempt ${attempt} failed: ${
          (error as Error)?.message ?? error
        }; retrying in ${nextDelay}ms`
      );
      retryOptions.onRetry?.(attempt, error, nextDelay);
    },
  });
}
