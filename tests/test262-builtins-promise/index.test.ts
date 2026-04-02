import { test, expect } from "vite-plus/test"
import { isConstructor } from "./utils.ts";

// https://github.com/tc39/test262/blob/c84c53e7dc46f9b0a4cf89deb139fcebde9e4c75/test/built-ins/Promise/exception-after-resolve-in-executor.js
test("already resolved promise is not rejected when executor throws an exception", async () => {
    const done = Promise.withResolvers<void>();

    const thenable = {
        // oxlint-ignore unicorn/no-thenable
        then(resolve: () => void) {
            resolve();
        }
    } as PromiseLike<void>;

    void new Promise<void>((resolve, reject) => {
        resolve(thenable);
        throw new Error("ignored");
    }).then(done.resolve, done.resolve);

    await done.promise;
})

// https://github.com/tc39/test262/blob/c84c53e7dc46f9b0a4cf89deb139fcebde9e4c75/test/built-ins/Promise/exception-after-resolve-in-thenable-job.js
test("already resolved promise is not rejected when then() function throws an exception", async () => {
    const done = Promise.withResolvers<void>();

    const thenable = {
        // oxlint-ignore unicorn/no-thenable
        then(resolve: () => void) {
            resolve();
            throw new Error("ignored");
        }
    } as PromiseLike<void>;

    void new Promise<void>((resolve, reject) => {
        resolve(thenable);
    }).then(done.resolve, done.resolve);

    await done.promise;
})

// https://github.com/tc39/test262/blob/c84c53e7dc46f9b0a4cf89deb139fcebde9e4c75/test/built-ins/Promise/exec-args.js
test("Promise executor is invoked synchronously", () => {
    let resolve: () => void;
    let reject: () => void;
    let argsLength: number;
    void new Promise<void>(function (innerResolve, innerReject) {
        resolve = innerResolve;
        reject = innerReject;
        argsLength = arguments.length;
    });

    expect(resolve!).toBeTypeOf("function");
    expect(resolve!.length).toBe(1);
    expect(reject!).toBeTypeOf("function");
    expect(reject!.length).toBe(1);
    expect(argsLength!).toBe(2);
})

// https://github.com/tc39/test262/blob/c84c53e7dc46f9b0a4cf89deb139fcebde9e4c75/test/built-ins/Promise/executor-call-context-strict.js
test("Promise executor is called in undefined context in strict mode", () => {
    let thisValue: unknown;
    void new Promise<void>(function (this: unknown) {
        thisValue = this;
    })

    expect(thisValue).toBeUndefined();
})

// https://github.com/tc39/test262/blob/c84c53e7dc46f9b0a4cf89deb139fcebde9e4c75/test/built-ins/Promise/executor-not-callable.js
test("Promise constructor throws TypeError if executor is not callable", () => {
    expect(() => new Promise("not callable" as any)).toThrow(TypeError);
    expect(() => new Promise(1 as any)).toThrow(TypeError);
    expect(() => new Promise(null as any)).toThrow(TypeError);
    expect(() => new Promise({} as any)).toThrow(TypeError);
})

// https://github.com/tc39/test262/blob/c84c53e7dc46f9b0a4cf89deb139fcebde9e4c75/test/built-ins/Promise/get-prototype-abrupt-executor-not-callable.js
test("Promise constructor gets prototype after checking that executor is callable", () => {
    // @ts-ignore This is how it is in Test262.
    const bound = function () { }.bind();
    Object.defineProperty(bound, "prototype", {
        get() {
            throw new Error()
        }
    })

    expect(() => Reflect.construct(Promise, [], bound)).toThrow(TypeError);
})

// https://github.com/tc39/test262/blob/c84c53e7dc46f9b0a4cf89deb139fcebde9e4c75/test/built-ins/Promise/get-prototype-abrupt.js
test("Abrupt completion from prototype property access", () => {
    const expectedError = new Error("expected");
    // @ts-ignore This is how it is in Test262.
    const bound = function () { }.bind();
    Object.defineProperty(bound, "prototype", {
        get() {
            throw expectedError
        }
    })

    expect(() => Reflect.construct(Promise, [() => { }], bound)).toThrow(expectedError);
})

// https://github.com/tc39/test262/blob/c84c53e7dc46f9b0a4cf89deb139fcebde9e4c75/test/built-ins/Promise/is-a-constructor.js
test("The Promise constructor implements [[Construct]]", () => {
    expect(Promise).toSatisfy(isConstructor);
    void new Promise(() => { })
})

// https://github.com/tc39/test262/blob/c84c53e7dc46f9b0a4cf89deb139fcebde9e4c75/test/built-ins/Promise/length.js
test("Promise length property", () => {
    expect(Promise).haveOwnPropertyDescriptor("length", {
        value: 1,
        writable: false,
        enumerable: false,
        configurable: true
    })
})

// https://github.com/tc39/test262/blob/c84c53e7dc46f9b0a4cf89deb139fcebde9e4c75/test/built-ins/Promise/name.js
test("Promise name property", () => {
    expect(Promise).haveOwnPropertyDescriptor("name", {
        value: "Promise",
        writable: false,
        enumerable: false,
        configurable: true
    })
})

// https://github.com/tc39/test262/blob/c84c53e7dc46f9b0a4cf89deb139fcebde9e4c75/test/built-ins/Promise/property-order.js
test("Promise constructor property order", () => {
    const names = Object.getOwnPropertyNames(Promise);
    const lengthIndex = names.indexOf("length");
    const nameIndex = names.indexOf("name");

    expect(lengthIndex).greaterThanOrEqual(0);
    expect(nameIndex).toBe(lengthIndex + 1);
})

