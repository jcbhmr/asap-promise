// oxlint-disable no-floating-promises
// oxlint-disable no-thenable
export type State<T> = Pending | PromiseSettledResult<T>;
export interface Pending {
  status: "pending";
  fulfillReactions: ((value: any) => void)[];
  rejectReactions: ((reason: any) => void)[];
}

function isPromiseLike<T>(value: any): value is PromiseLike<T> {
  return value != null && typeof value.then === "function";
}

export interface ASAPPromiseWithResolvers<T> {
  promise: ASAPPromise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

export default class ASAPPromise<T> {
  static resolve<T>(value: T | PromiseLike<T>): ASAPPromise<T> {
    return new ASAPPromise((resolve, _reject) => resolve(value));
  }

  static reject<T = never>(reason?: any): ASAPPromise<T> {
    return new ASAPPromise((_resolve, reject) => reject(reason));
  }

  static withResolvers<T>(): ASAPPromiseWithResolvers<T> {
    let resolve: (value: T | PromiseLike<T>) => void;
    let reject: (reason?: any) => void;
    const promise = new ASAPPromise<T>((innerResolve, innerReject) => {
      resolve = innerResolve;
      reject = innerReject;
    });
    return { promise, resolve: resolve!, reject: reject! };
  }

  #state: State<T> = {
    status: "pending",
    fulfillReactions: [],
    rejectReactions: [],
  };
  constructor(
    executor: (
      resolve: (value: T | PromiseLike<T>) => void,
      reject: (reason?: any) => void,
    ) => void,
  ) {
    const resolve = (value: T | PromiseLike<T>) => {
      this.#resolve(value);
    };
    const reject = (reason?: any) => {
      this.#reject(reason);
    };
    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }

  #resolve(value: T | PromiseLike<T>): void {
    if (this.#state.status !== "pending") {
      return;
    }
    if (isPromiseLike(value)) {
      value.then(
        (value) => this.#resolve(value),
        (reason) => this.#reject(reason),
      );
    } else {
      this.#fulfill(value);
    }
  }

  #fulfill(value: T): void {
    if (this.#state.status !== "pending") {
      return;
    }
    const fulfillReactions = this.#state.fulfillReactions;
    this.#state = {
      status: "fulfilled",
      value,
    };
    for (const reaction of fulfillReactions) {
      reaction(value);
    }
  }

  #reject(reason?: any): void {
    if (this.#state.status !== "pending") {
      return;
    }
    const rejectReactions = this.#state.rejectReactions;
    this.#state = {
      status: "rejected",
      reason,
    };
    for (const reaction of rejectReactions) {
      reaction(reason);
    }
  }

  get status(): "pending" | "fulfilled" | "rejected" {
    return this.#state.status;
  }

  get value(): T | undefined {
    if (this.#state.status === "fulfilled") {
      return this.#state.value;
    }
    return undefined;
  }

  get reason(): any {
    if (this.#state.status === "rejected") {
      return this.#state.reason;
    }
    return undefined;
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): ASAPPromise<TResult1 | TResult2> {
    if (this.#state.status === "fulfilled") {
      const value = onfulfilled
        ? onfulfilled(this.#state.value)
        : (this.#state.value as unknown as TResult1);
      return ASAPPromise.resolve(value);
    }
    if (this.#state.status === "rejected") {
      const reason = onrejected ? onrejected(this.#state.reason) : this.#state.reason;
      return ASAPPromise.reject(reason);
    }
    const state = this.#state as Pending;
    return new ASAPPromise<TResult1 | TResult2>((resolve, reject) => {
      state.fulfillReactions.push((value) => {
        let result: TResult1 | PromiseLike<TResult1>;
        if (onfulfilled) {
          try {
            result = onfulfilled(value);
          } catch (e) {
            reject(e);
            return;
          }
        } else {
          result = value;
        }
        resolve(result);
      });
      state.rejectReactions.push((reason) => {
        let result: TResult2 | PromiseLike<TResult2>;
        if (onrejected) {
          try {
            result = onrejected(reason);
          } catch (e) {
            reject(e);
            return;
          }
        } else {
          result = reason;
        }
        resolve(result);
      });
    });
  }

  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null,
  ): ASAPPromise<T | TResult> {
    return this.then(undefined, onrejected);
  }

  finally(onfinally?: (() => void) | null): ASAPPromise<T> {
    const onfulfilled = onfinally
      ? (value: T) => {
          onfinally();
          return value;
        }
      : undefined;
    const onrejected = onfinally
      ? (reason: any) => {
          onfinally();
          throw reason;
        }
      : undefined;
    return this.then(onfulfilled, onrejected);
  }
}
