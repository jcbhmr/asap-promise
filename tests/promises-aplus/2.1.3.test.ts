// oxlint-disable no-floating-promises
import { suite, test, expect, vi } from "vite-plus/test";
import { scheduler } from "node:timers/promises";
import { rejectedCases } from "./three-cases.ts";

const dummy = { dummy: "dummy" };

suite("1. must not transition to any other state.", () => {
  for (const [name, withPromise] of Object.entries(rejectedCases)) {
    test(name, async () => {
      const onFulfilled = vi.fn();
      const onRejected = vi.fn();

      withPromise(dummy, (promise) => {
        promise.then(onFulfilled, onRejected);
      });

      await scheduler.wait(10);
      expect(onFulfilled).not.toHaveBeenCalled();
      expect(onRejected).toHaveBeenCalledExactlyOnceWith(dummy);
    });
  }

  test("immediately reject & fulfill", async () => {
    const onFulfilled = vi.fn();
    const onRejected = vi.fn();

    const deferred = Promise.withResolvers();
    deferred.promise.then(onFulfilled, onRejected);
    deferred.reject(dummy);
    deferred.resolve(dummy);

    await scheduler.wait(10);
    expect(onFulfilled).not.toHaveBeenCalled();
    expect(onRejected).toHaveBeenCalledExactlyOnceWith(dummy);
  });

  test("eventually reject & fulfill", async () => {
    const onFulfilled = vi.fn();
    const onRejected = vi.fn();

    const deferred = Promise.withResolvers();
    deferred.promise.then(onFulfilled, onRejected);
    setTimeout(() => {
      deferred.reject(dummy);
      deferred.resolve(dummy);
    }, 5);

    await scheduler.wait(10);
    expect(onFulfilled).not.toHaveBeenCalled();
    expect(onRejected).toHaveBeenCalledExactlyOnceWith(dummy);
  });

  test("immediately reject then eventually fulfill", async () => {
    const onFulfilled = vi.fn();
    const onRejected = vi.fn();

    const deferred = Promise.withResolvers();
    deferred.promise.then(onFulfilled, onRejected);
    deferred.reject(dummy);
    setTimeout(() => {
      deferred.resolve(dummy);
    }, 5);

    await scheduler.wait(10);
    expect(onFulfilled).not.toHaveBeenCalled();
    expect(onRejected).toHaveBeenCalledExactlyOnceWith(dummy);
  });
});
