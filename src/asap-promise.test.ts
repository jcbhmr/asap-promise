// oxlint-disable no-floating-promises
import { test, expect, vi } from "vite-plus/test";

declare global {
  interface Promise<T> {
    readonly status: "pending" | "fulfilled" | "rejected";
    readonly value?: T;
    readonly reason?: any;
  }
}

test("resolves immediately without waiting for the next microtask", async () => {
  const deferred = Promise.withResolvers<number>();
  expect(deferred.promise.status).toBe("pending");

  deferred.resolve(42);
  expect(deferred.promise.status).toBe("fulfilled");
  expect(deferred.promise.value).toBe(42);
});

test("rejects immediately without waiting for the next microtask", async () => {
  const deferred = Promise.withResolvers<number>();
  expect(deferred.promise.status).toBe("pending");

  deferred.reject(42);
  expect(deferred.promise.status).toBe("rejected");
  expect(deferred.promise.reason).toBe(42);
});

test("then(onFulfilled) callbacks are called immediately when the promise is already fulfilled", async () => {
  const onFulfilled = vi.fn();

  const promise = Promise.resolve(42);
  promise.then(onFulfilled);
  promise.then(onFulfilled);

  expect(onFulfilled).toHaveBeenCalledTimes(2);
  expect(onFulfilled).toHaveBeenNthCalledWith(1, 42);
  expect(onFulfilled).toHaveBeenNthCalledWith(2, 42);
});

test("catch(onRejected) callbacks are called immediately when the promise is already rejected", async () => {
  const onRejected = vi.fn();

  const promise = Promise.reject(42);
  promise.catch(onRejected);
  promise.catch(onRejected);

  expect(onRejected).toHaveBeenCalledTimes(2);
  expect(onRejected).toHaveBeenNthCalledWith(1, 42);
  expect(onRejected).toHaveBeenNthCalledWith(2, 42);
});
