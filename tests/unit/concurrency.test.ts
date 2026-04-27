import { describe, it, expect, vi } from "vitest";
import { mapWithConcurrency } from "@/lib/utils/concurrency";

describe("mapWithConcurrency", () => {
  it("preserves input order", async () => {
    const result = await mapWithConcurrency([1, 2, 3, 4, 5], 2, async (x) => x * 2);
    expect(result).toEqual([2, 4, 6, 8, 10]);
  });

  it("never exceeds the concurrency cap", async () => {
    let inFlight = 0;
    let peak = 0;
    const items = Array.from({ length: 50 }, (_, i) => i);

    await mapWithConcurrency(items, 5, async (x) => {
      inFlight++;
      peak = Math.max(peak, inFlight);
      await new Promise((r) => setTimeout(r, 5));
      inFlight--;
      return x;
    });

    expect(peak).toBeLessThanOrEqual(5);
    expect(peak).toBeGreaterThan(1);
  });

  it("works for items.length < concurrency", async () => {
    const result = await mapWithConcurrency([1, 2], 10, async (x) => x);
    expect(result).toEqual([1, 2]);
  });

  it("rejects if any mapper throws", async () => {
    await expect(
      mapWithConcurrency([1, 2, 3], 2, async (x) => {
        if (x === 2) throw new Error("boom");
        return x;
      })
    ).rejects.toThrow("boom");
  });

  it("throws on non-positive concurrency", async () => {
    await expect(mapWithConcurrency([1], 0, async (x) => x)).rejects.toThrow();
  });
});
