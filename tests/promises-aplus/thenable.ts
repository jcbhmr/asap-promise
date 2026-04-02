// oxlint-disable no-floating-promises
// oxlint-disable no-thenable
type SimpleThenable<T> = { then(onFulfilled: (value: T) => unknown): void };

export function aSynchronouslyFulfilledCustomThenable<T>(value: T): SimpleThenable<T> {
  return {
    then(onFulfilled) {
      onFulfilled(value);
    },
  };
}
