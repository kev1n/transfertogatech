import { describe, it, expect, vi } from "vitest";
import { retryWithBackoff } from "@/lib/utils/retry";

describe("retryWithBackoff", () => {
  it("returns immediately on success", async () => {
    const task = vi.fn().mockResolvedValue("ok");
    const sleep = vi.fn();
    const result = await retryWithBackoff(task, { sleep });
    expect(result).toBe("ok");
    expect(task).toHaveBeenCalledTimes(1);
    expect(sleep).not.toHaveBeenCalled();
  });

  it("retries on failure and succeeds within maxAttempts", async () => {
    const task = vi
      .fn()
      .mockRejectedValueOnce(new Error("fail1"))
      .mockRejectedValueOnce(new Error("fail2"))
      .mockResolvedValue("ok");
    const sleep = vi.fn().mockResolvedValue(undefined);

    const result = await retryWithBackoff(task, {
      maxAttempts: 5,
      sleep,
      jitter: false,
      initialDelayMs: 100,
      factor: 2,
    });
    expect(result).toBe("ok");
    expect(task).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenCalledTimes(2);
  });

  it("uses exponential backoff (no jitter): 100, 200, 400 ms", async () => {
    const task = vi.fn().mockRejectedValue(new Error("nope"));
    const delays: number[] = [];
    const sleep = vi.fn(async (ms: number) => {
      delays.push(ms);
    });

    await expect(
      retryWithBackoff(task, {
        maxAttempts: 4,
        sleep,
        jitter: false,
        initialDelayMs: 100,
        factor: 2,
      })
    ).rejects.toThrow("nope");

    expect(delays).toEqual([100, 200, 400]);
  });

  it("caps delay at maxDelayMs", async () => {
    const task = vi.fn().mockRejectedValue(new Error("x"));
    const delays: number[] = [];
    const sleep = vi.fn(async (ms: number) => {
      delays.push(ms);
    });

    await expect(
      retryWithBackoff(task, {
        maxAttempts: 5,
        sleep,
        jitter: false,
        initialDelayMs: 1000,
        factor: 10,
        maxDelayMs: 5000,
      })
    ).rejects.toThrow();

    // 1000, 5000(capped), 5000(capped), 5000(capped)
    expect(delays).toEqual([1000, 5000, 5000, 5000]);
  });

  it("re-throws the last error after all attempts fail", async () => {
    const task = vi
      .fn()
      .mockRejectedValueOnce(new Error("first"))
      .mockRejectedValue(new Error("final"));
    const sleep = vi.fn().mockResolvedValue(undefined);

    await expect(
      retryWithBackoff(task, { maxAttempts: 3, sleep, jitter: false })
    ).rejects.toThrow("final");
  });

  it("invokes onRetry with attempt number, error, and delay", async () => {
    const task = vi
      .fn()
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValue("ok");
    const onRetry = vi.fn();
    const sleep = vi.fn().mockResolvedValue(undefined);

    await retryWithBackoff(task, {
      maxAttempts: 2,
      sleep,
      jitter: false,
      initialDelayMs: 50,
      onRetry,
    });

    expect(onRetry).toHaveBeenCalledOnce();
    expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error), 50);
  });
});
