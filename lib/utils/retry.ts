export interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  factor?: number;
  jitter?: boolean;
  onRetry?: (attempt: number, error: unknown, nextDelayMs: number) => void;
  /** Injectable sleep — defaults to setTimeout. Tests pass a fake. */
  sleep?: (ms: number) => Promise<void>;
}

const DEFAULTS: Required<
  Omit<RetryOptions, "onRetry" | "sleep">
> = {
  maxAttempts: 5,
  initialDelayMs: 1_000,
  maxDelayMs: 5 * 60_000,
  factor: 2,
  jitter: true,
};

const realSleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

function computeDelay(
  attempt: number,
  initial: number,
  factor: number,
  max: number,
  jitter: boolean
): number {
  const exponential = Math.min(initial * Math.pow(factor, attempt - 1), max);
  if (!jitter) return exponential;
  return Math.floor(Math.random() * exponential);
}

/**
 * Runs `task` with exponential backoff and full jitter.
 *
 * On the final failure, the error is re-thrown so callers can observe it
 * (and decide whether to swallow). `onRetry` fires before each sleep.
 */
export async function retryWithBackoff<T>(
  task: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxAttempts, initialDelayMs, maxDelayMs, factor, jitter } = {
    ...DEFAULTS,
    ...options,
  };
  const sleep = options.sleep ?? realSleep;

  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts) break;
      const delay = computeDelay(
        attempt,
        initialDelayMs,
        factor,
        maxDelayMs,
        jitter
      );
      options.onRetry?.(attempt, error, delay);
      await sleep(delay);
    }
  }
  throw lastError;
}
