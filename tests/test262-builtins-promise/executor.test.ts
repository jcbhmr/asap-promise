import { test as baseTest, expect } from "vite-plus/test"
import { isConstructor } from "./utils.ts";

const test = baseTest.extend("executor", () => {
    let executor: (resolve: () => void, reject: () => void) => void;
    class NotPromise {
        constructor(innerExecutor: (resolve: () => void, reject: () => void) => void) {
            executor = innerExecutor;
            innerExecutor(() => { }, () => { });
        }
    }
    void Reflect.apply(Promise.resolve, NotPromise, []);
    return executor!;
})

// https://github.com/tc39/test262/blob/c84c53e7dc46f9b0a4cf89deb139fcebde9e4c75/test/built-ins/Promise/executor-function-extensible.js
test("the [[Extensible]] slot of GetCapabilitiesExecutor functions", ({ executor }) => {
    expect(executor).toSatisfy(Object.isExtensible);
})

// https://github.com/tc39/test262/blob/c84c53e7dc46f9b0a4cf89deb139fcebde9e4c75/test/built-ins/Promise/executor-function-length.js
test("the length property of GetCapabilitiesExecutor functions", ({ executor }) => {
    expect(executor).ownPropertyDescriptor("length", {
        value: 2,
        writable: false,
        enumerable: false,
        configurable: true
    })
})

// https://github.com/tc39/test262/blob/c84c53e7dc46f9b0a4cf89deb139fcebde9e4c75/test/built-ins/Promise/executor-function-name.js
test("the name property of GetCapabilitiesExecutor functions", ({ executor }) => {
    expect(executor).ownPropertyDescriptor("name", {
        value: "",
        writable: false,
        enumerable: false,
        configurable: true
    })
})

// https://github.com/tc39/test262/blob/c84c53e7dc46f9b0a4cf89deb139fcebde9e4c75/test/built-ins/Promise/executor-function-not-a-constructor.js
test("GetCapabilitiesExecutor function is not constructor", ({ executor }) => {
    expect(executor).not.haveOwnProperty("prototype");
    expect(executor).not.toSatisfy(isConstructor);
    expect(() => new (executor as any)()).toThrow(TypeError);
});

// https://github.com/tc39/test262/blob/c84c53e7dc46f9b0a4cf89deb139fcebde9e4c75/test/built-ins/Promise/executor-function-property-order.js
test("Promise executor function property order", ({ executor }) => {
    const names = Object.getOwnPropertyNames(executor);
    const lengthIndex = names.indexOf("length");
    const nameIndex = names.indexOf("name");

    expect(lengthIndex).greaterThanOrEqual(0);
    expect(nameIndex).toBe(lengthIndex + 1);
})

// https://github.com/tc39/test262/blob/c84c53e7dc46f9b0a4cf89deb139fcebde9e4c75/test/built-ins/Promise/executor-function-prototype.js
test("The [[Prototype]] of GetCapabilitiesExecutor functions", ({ executor }) => {
    expect(Object.getPrototypeOf(executor)).toBe(Function.prototype);
})
