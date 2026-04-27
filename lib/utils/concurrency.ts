/**
 * Runs `mapper` across `items` with at most `concurrency` in flight at once.
 * Preserves input order in the returned array. Errors propagate (one failure
 * rejects the whole call) — wrap individual mappers in retry/try-catch if
 * partial-failure semantics are needed.
 */
export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  if (concurrency <= 0) {
    throw new Error(`concurrency must be positive, got ${concurrency}`);
  }
  const results: R[] = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      results[index] = await mapper(items[index], index);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}
