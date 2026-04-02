import { suite, expect, vi } from "vite-plus/test";
import test from "../test-with-promise.ts"
import { scheduler } from "node:timers/promises";
import { fulfilledCases } from "./three-cases.ts";

const dummy = { dummy: "dummy" };

suite("1. must not transition to any other state.", () => {
  for (const [name, withPromise] of Object.entries(fulfilledCases)) {
    test(name, async () => {
      const onFulfilled = vi.fn();
      const onRejected = vi.fn();

      withPromise(dummy, (promise) => {
        promise.then(onFulfilled, onRejected);
      });

      await scheduler.wait(10);
      expect(onFulfilled).toHaveBeenCalledExactlyOnceWith(dummy);
      expect(onRejected).not.toHaveBeenCalled();
    });
  }

  test("immediately fulfill & reject", async ({ Promise }) => {
    const onFulfilled = vi.fn();
    const onRejected = vi.fn();

    const deferred = Promise.withResolvers();
    deferred.promise.then(onFulfilled, onRejected);
    deferred.resolve(dummy);
    deferred.reject(dummy);

    await scheduler.wait(10);
    expect(onFulfilled).toHaveBeenCalledExactlyOnceWith(dummy);
    expect(onRejected).not.toHaveBeenCalled();
  });

  test("eventually fulfill & reject", async () => {
    const onFulfilled = vi.fn();
    const onRejected = vi.fn();

    const deferred = Promise.withResolvers();
    deferred.promise.then(onFulfilled, onRejected);
    setTimeout(() => {
      deferred.resolve(dummy);
      deferred.reject(dummy);
    }, 5);

    await scheduler.wait(10);
    expect(onFulfilled).toHaveBeenCalledExactlyOnceWith(dummy);
    expect(onRejected).not.toHaveBeenCalled();
  });

  test("immediately fulfill then eventually reject", async () => {
    const onFulfilled = vi.fn();
    const onRejected = vi.fn();

    const deferred = Promise.withResolvers();
    deferred.promise.then(onFulfilled, onRejected);
    deferred.resolve(dummy);
    setTimeout(() => {
      deferred.reject(dummy);
    }, 5);

    await scheduler.wait(10);
    expect(onFulfilled).toHaveBeenCalledExactlyOnceWith(dummy);
    expect(onRejected).not.toHaveBeenCalled();
  });
});
