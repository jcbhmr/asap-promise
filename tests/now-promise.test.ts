import { expect, vi } from "vite-plus/test";
import test from "./test-with-promise.ts";

test("resolves immediately without waiting for the next microtask", async ({ Promise }) => {
  const onfulfilled = vi.fn();
  const onrejected = vi.fn();
  const { promise, resolve } = Promise.withResolvers<number>();
  void promise.then(onfulfilled, onrejected);

  expect(onfulfilled).not.toHaveBeenCalled();
  expect(onrejected).not.toHaveBeenCalled();

  resolve(42);

  expect(onfulfilled).toHaveBeenCalledExactlyOnceWith(42);
  expect(onrejected).not.toHaveBeenCalled();
});

test("rejects immediately without waiting for the next microtask", async () => {
  const onfulfilled = vi.fn();
  const onrejected = vi.fn();
  const { promise, reject } = Promise.withResolvers<number>();
  void promise.then(onfulfilled, onrejected);

  expect(onfulfilled).not.toHaveBeenCalled();
  expect(onrejected).not.toHaveBeenCalled();

  reject(42);

  expect(onfulfilled).not.toHaveBeenCalled();
  expect(onrejected).toHaveBeenCalledExactlyOnceWith(42);
});

test("then(onfulfilled) callback is called immediately when the promise is already fulfilled", async () => {
  const promise = Promise.resolve(42);

  const onfulfilled = vi.fn();
  void promise.then(onfulfilled);

  expect(onfulfilled).toHaveBeenCalledExactlyOnceWith(42);
});

test("catch(onrejected) callback is called immediately when the promise is already rejected", async () => {
  const promise = Promise.reject(42);

  const onrejected = vi.fn();
  void promise.catch(onrejected);

  expect(onrejected).toHaveBeenCalledExactlyOnceWith(42);
});
