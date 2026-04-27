export const ONE_MONTH_SECONDS = 30 * 24 * 60 * 60;

export async function fetchJson<T>(
  url: string,
  options: { revalidate?: number } = {}
): Promise<T> {
  const res = await fetch(url, {
    next: { revalidate: options.revalidate ?? ONE_MONTH_SECONDS },
  });
  return res.json() as Promise<T>;
}
