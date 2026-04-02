export const fulfilledCases = {
  "already fulfilled"<T>(value: T, fn: (promise: Promise<T>) => void): void {
    const promise = Promise.resolve(value);
    fn(promise);
  },
  "immediately fulfilled"<T>(value: T, fn: (promise: Promise<T>) => void): void {
    const { promise, resolve } = Promise.withResolvers<T>();
    fn(promise);
    resolve(value);
  },
  "eventually fulfilled"<T>(value: T, fn: (promise: Promise<T>) => void): void {
    const promise = new Promise<T>((resolve) => {
      setTimeout(() => resolve(value), 5);
    });
    fn(promise);
  },
} as const;

export const rejectedCases = {
  "already rejected"<T>(reason: T, fn: (promise: Promise<never>) => void): void {
    const promise = Promise.reject(reason);
    fn(promise);
  },
  "immediately rejected"<T>(reason: T, fn: (promise: Promise<never>) => void): void {
    const { promise, reject } = Promise.withResolvers<never>();
    fn(promise);
    reject(reason);
  },
  "eventually rejected"<T>(reason: T, fn: (promise: Promise<never>) => void): void {
    const promise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(reason), 5);
    });
    fn(promise);
  },
} as const;
