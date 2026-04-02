import { scheduler } from "node:timers/promises";
import QuickPromise, { type QuickPromiseWithResolvers } from "./index.ts"

function asyncStep<T>(generator: Generator<unknown, T, unknown>, resolve: (value: T) => void, reject: (reason: any) => void, next: (value: unknown) => void, throw_: (reason: any) => void, isThrow: boolean, nextValue: unknown) {
    let result: IteratorResult<unknown, T>;
    let resultValue: unknown;
    try {
        const fn = isThrow ? generator.throw! : generator.next;
        result = Reflect.apply(fn, generator, [nextValue])
        resultValue = result.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (result.done) {
        resolve(resultValue as T);
    } else {
        QuickPromise.resolve(resultValue).then(next, throw_);
    }
}

function async_<Args extends any[], Return, This = unknown>(body: (this: This, ...args: Args) => Generator<unknown, Return, unknown>): (this: This, ...args: Args) => QuickPromise<Return> {
    return function (...args) {
        return new QuickPromise<Return>((resolve, reject) => {
            const generator = Reflect.apply(body, this, args);
            const next = (value: unknown) => {
                asyncStep(generator, resolve, reject, next, throw_, false, value);
            }
            const throw_ = (reason: any) => {
                asyncStep(generator, resolve, reject, next, throw_, true, reason);
            }
            next(undefined);
        });
    }
}
export { async_ as "async" }

interface AsyncIterator<T, TReturn = any, TNext = any> {
    next(...[value]: [] | [TNext]): PromiseLike<IteratorResult<T, TReturn>>;
    return?(value?: TReturn | PromiseLike<TReturn>): PromiseLike<IteratorResult<T, TReturn>>;
    throw?(e?: any): PromiseLike<IteratorResult<T, TReturn>>;
}

interface AsyncIterable<T, TReturn = any, TNext = any> {
    [Symbol.asyncIterator](): AsyncIterator<T, TReturn, TNext>;
}

interface AsyncIterableIterator<T, TReturn = any, TNext = any> extends AsyncIterator<T, TReturn, TNext> {
    [Symbol.asyncIterator](): AsyncIterableIterator<T, TReturn, TNext>;
}

export const forAwait: <T>(iterable: AsyncIterable<T>, body: (item: T) => void | boolean) => QuickPromise<void> = async_(function* <T>(iterable: AsyncIterable<T>, body: (item: T) => void | boolean): Generator<unknown, void, unknown> {
    const iterator = iterable[Symbol.asyncIterator]();
    while (true) {
        const { value, done } = (yield iterator.next()) as Awaited<ReturnType<typeof iterator["next"]>>;
        if (done) {
            break;
        }
        const wantBreak = body(value);
        if (wantBreak) {
            break;
        }
    }
})

if (import.meta.vitest) {
    const { test, expect, vi } = await import('vite-plus/test');

    test("forAwait 10 ms 10x numbers", async () => {
        async function* createGenerator() {
            for (let i = 0; i < 10; i++) {
                await scheduler.wait(10);
                yield i;
            }
        }
        const cb = vi.fn()
        await forAwait(createGenerator(), cb)
        expect(cb).toHaveBeenCalledTimes(10);
        for (let i = 0; i < 10; i++) {
            expect(cb).toHaveBeenNthCalledWith(i + 1, i);
        }
    })
}

interface AsyncIteratorObject<T, TReturn = unknown, TNext = unknown> extends AsyncIterator<T, TReturn, TNext> {
    [Symbol.asyncIterator](): AsyncIteratorObject<T, TReturn, TNext>;
}

export function asyncGenerator<Args extends any[], Yield, Return = unknown, Next = unknown, This = unknown>(body: (this: This, ...args: Args) => Generator<Yield | OverloadYield<unknown>, Return, unknown>): (this: This, ...args: Args) => AsyncGenerator<Yield, Return, Next> {
    return function (...args) {
        const generator = Reflect.apply(body, this, args);
        return new AsyncGenerator(generator)
    }
}

let getValue: <T>(that: OverloadYield<T>) => T;
class OverloadYield<T> {
    static {
        getValue = (that) => that.#value;
    }
    #value: T;
    constructor(value: T, depth = 0) {
        this.#value = value;
    }
}

export function asyncGeneratorAwait<T>(value: T): OverloadYield<T> {
    return new OverloadYield(value);
}

class AsyncGenerator<Yield, Return = unknown, Next = unknown> implements AsyncIteratorObject<Yield, Return, Next> {
    #state: {
        method: "next" | "return" | "throw";
        arg: any;
        resolve: (value: IteratorResult<Yield, Return>) => void;
        reject: (reason: any) => void;
        next: any;
    } | undefined
    #state2: {
        method: "next" | "return" | "throw";
        arg: any;
        resolve: (value: IteratorResult<Yield, Return>) => void;
        reject: (reason: any) => void;
        next: any;
    } | undefined;
    #generator: Generator<unknown, Return, unknown>;
    constructor(generator: Generator<unknown, Return, unknown>) {
        this.#generator = generator;
    }

    #resume(method: "next" | "return" | "throw", arg?: any): void {
        let result: IteratorResult<any, any>;
        let resultValue: any;
        let isOverloadYield = false;
        try {
            result = this.#generator[method](arg);
            resultValue = result.value;
            isOverloadYield = resultValue instanceof OverloadYield;
            QuickPromise.resolve(isOverloadYield ? getValue(resultValue as OverloadYield<unknown>) : resultValue)
                .then((resolvedValue) => {
                    if (isOverloadYield) {
                        if (resolvedValue.done) {
                            return this.#resume("next", resolvedValue)
                        }
                        resolvedValue = this.#generator.next(resolvedValue).value;
                    }
                    this.#settle(!!result.done, resolvedValue);
                },
                    (reason) => {
                        this.#resume("throw", reason);
                    })
        } catch (error) {
            this.#settle(2, error);
        }
    }

    #settle(status: boolean | 2, value: any): void {
        if (status === 2) {
            this.#state2!.reject(value);
        } else {
            this.#state2!.resolve({ value, done: status });
        }
        this.#state2 = this.#state2!.next;
        if (this.#state2) {
            this.#resume(this.#state2.method, this.#state2.arg);
        } else {
            this.#state = undefined;
        }
    }

    #invoke(method: "next" | "return" | "throw", arg?: any): QuickPromise<IteratorResult<Yield, Return>> {
        return new QuickPromise<IteratorResult<Yield, Return>>((resolve, reject) => {
            const state = { method, arg, resolve, reject, next: null };
            if (this.#state) {
                this.#state.next = state;
                this.#state = state;
            } else {
                this.#state = state;
                this.#state2 = state;
                this.#resume(method, arg);
            }
        });
    }

    next(value?: Next): QuickPromise<IteratorResult<Yield, Return>> {
        return this.#invoke("next", value);
    }

    return(value: Return | PromiseLike<Return>): QuickPromise<IteratorResult<Yield, Return>> {
        return this.#invoke("return", value);
    }

    throw(e: any): QuickPromise<IteratorResult<Yield, Return>> {
        return this.#invoke("throw", e);
    }

    [Symbol.asyncIterator](): this {
        return this;
    }
}

if (import.meta.vitest) {
    const { test, expect } = await import('vite-plus/test');

    test("asyncGenerator & asyncGeneratorAwait all sync", async () => {
        // @ts-ignore
        const createGenerator = asyncGenerator<[], number, number>(function* () {
            yield 1;
            const two = yield asyncGeneratorAwait(2);
            yield two;
            return 3;
        });

        const generator = createGenerator();
        let resultPromise: QuickPromise<IteratorResult<number, number>>;
        let result: IteratorResult<number, number>;

        resultPromise = generator.next();
        expect(resultPromise).toBeInstanceOf(QuickPromise);
        expect(resultPromise.status).toBe("fulfilled");
        expect(resultPromise.value).toEqual({ value: 1, done: false });
        result = await resultPromise;
        expect(result).toEqual({ value: 1, done: false });

        resultPromise = generator.next();
        expect(resultPromise).toBeInstanceOf(QuickPromise);
        expect(resultPromise.status).toBe("fulfilled");
        expect(resultPromise.value).toEqual({ value: 2, done: false });
        result = await resultPromise;
        expect(result).toEqual({ value: 2, done: false });

        resultPromise = generator.next();
        expect(resultPromise).toBeInstanceOf(QuickPromise);
        expect(resultPromise.status).toBe("fulfilled");
        expect(resultPromise.value).toEqual({ value: 3, done: true });
        result = await resultPromise;
        expect(result).toEqual({ value: 3, done: true });

        resultPromise = generator.next();
        expect(resultPromise).toBeInstanceOf(QuickPromise);
        expect(resultPromise.status).toBe("fulfilled");
        expect(resultPromise.value).toEqual({ value: undefined, done: true });
        result = await resultPromise;
        expect(result).toEqual({ value: undefined, done: true });
    })

    test("asyncGenerator & asyncGeneratorAwait async", async () => {
        // @ts-ignore
        const createGenerator = asyncGenerator<[], number, number>(function* () {
            yield asyncGeneratorAwait(scheduler.wait(10));

            yield 1;
            yield yield asyncGeneratorAwait(scheduler.wait(10).then(() => 2));
            return 3;
        });

        const generator = createGenerator();
        let resultPromise: QuickPromise<IteratorResult<number, number>>;
        let result: IteratorResult<number, number>;

        resultPromise = generator.next();
        expect(resultPromise).toBeInstanceOf(QuickPromise);
        expect(resultPromise.status).toBe("pending");
        result = await resultPromise;
        expect(result).toEqual({ value: 1, done: false });

        resultPromise = generator.next();
        expect(resultPromise).toBeInstanceOf(QuickPromise);
        expect(resultPromise.status).toBe("pending");
        result = await resultPromise;
        expect(result).toEqual({ value: 2, done: false });

        resultPromise = generator.next();
        expect(resultPromise).toBeInstanceOf(QuickPromise);
        expect(resultPromise.status).toBe("fulfilled");
        expect(resultPromise.value).toEqual({ value: 3, done: true });
        result = await resultPromise;
        expect(result).toEqual({ value: 3, done: true });
    })
}
