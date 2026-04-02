// oxlint-disable no-floating-promises
import { test, expect, suite } from "vite-plus/test";
import { scheduler } from "node:timers/promises";

interface StatusPromise<T> extends Promise<T> {
  readonly status: "pending" | "fulfilled" | "rejected";
  readonly value?: T;
  readonly reason?: any;
}

suite("exposes fulfilled value as 'value' property", async () => {
  test("already fulfilled", async () => {
    const promise = Promise.resolve(42);

    await scheduler.wait(10);
    expect(promise.status).toBe("fulfilled");
    expect(promise.value).toBe(42);
  });

  test("immediately fulfilled", async () => {
    const deferred = Promise.withResolvers<number>();
    expect(deferred.promise.status).toBe("pending");

    deferred.resolve(42);

    await scheduler.wait(10);
    expect(deferred.promise.status).toBe("fulfilled");
    expect(deferred.promise.value).toBe(42);
  });

  test("eventually fulfilled", async () => {
    const deferred = Promise.withResolvers<number>();
    expect(deferred.promise.status).toBe("pending");

    setTimeout(() => deferred.resolve(42), 5);
    expect(deferred.promise.status).toBe("pending");

    await scheduler.wait(10);
    expect(deferred.promise.status).toBe("fulfilled");
    expect(deferred.promise.value).toBe(42);
  });
});

suite("exposes rejection reason as 'reason' property", async () => {
  test("already rejected", async () => {
    const promise = Promise.reject(42);

    await scheduler.wait(10);
    expect(promise.status).toBe("rejected");
    expect(promise.reason).toBe(42);
  });

  test("immediately rejected", async () => {
    const deferred = Promise.withResolvers<number>();
    expect(deferred.promise.status).toBe("pending");

    deferred.reject(42);

    await scheduler.wait(10);
    expect(deferred.promise.status).toBe("rejected");
    expect(deferred.promise.reason).toBe(42);
  });

  test("eventually rejected", async () => {
    const deferred = Promise.withResolvers<number>();
    expect(deferred.promise.status).toBe("pending");

    setTimeout(() => deferred.reject(42), 5);
    expect(deferred.promise.status).toBe("pending");

    await scheduler.wait(10);
    expect(deferred.promise.status).toBe("rejected");
    expect(deferred.promise.reason).toBe(42);
  });
});
