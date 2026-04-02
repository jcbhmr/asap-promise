import { test as baseTest, expect } from "vite-plus/test"
import { isConstructor } from "./utils.ts";

const test = baseTest.extend("reject", () => {
    let reject: (reason?: any) => void;
    new Promise((_, innerReject) => {
        reject = innerReject;
    })
    return reject!;
})

// https://github.com/tc39/test262/blob/c84c53e7dc46f9b0a4cf89deb139fcebde9e4c75/test/built-ins/Promise/reject-function-extensible.js
test("The [[Extensible]] slot of Promise Reject functions", ({ reject }) => {
    expect(reject).toSatisfy(Object.isExtensible);
})

// https://github.com/tc39/test262/blob/c84c53e7dc46f9b0a4cf89deb139fcebde9e4c75/test/built-ins/Promise/reject-function-length.js
test("The length property of Promise Reject functions", ({ reject }) => {
    expect(reject).ownPropertyDescriptor("length", {
        value: 1,
        writable: false,
        enumerable: false,
        configurable: true
    })
})

// https://github.com/tc39/test262/blob/c84c53e7dc46f9b0a4cf89deb139fcebde9e4c75/test/built-ins/Promise/reject-function-name.js
test("The name property of Promise Reject functions", ({ reject }) => {
    expect(reject).ownPropertyDescriptor("name", {
        value: "",
        writable: false,
        enumerable: false,
        configurable: true
    })
})

// https://github.com/tc39/test262/blob/c84c53e7dc46f9b0a4cf89deb139fcebde9e4c75/test/built-ins/Promise/reject-function-nonconstructor.js
test("Promise Rejection functions are not constructors", ({ reject }) => {
    expect(reject).not.haveOwnProperty("prototype");
    expect(reject).not.toSatisfy(isConstructor);
})

// https://github.com/tc39/test262/blob/c84c53e7dc46f9b0a4cf89deb139fcebde9e4c75/test/built-ins/Promise/reject-function-property-order.js
test("Promise rejection function property order", ({ reject }) => {
    const names = Object.getOwnPropertyNames(reject);
    const lengthIndex = names.indexOf("length");
    const nameIndex = names.indexOf("name");

    expect(lengthIndex).greaterThanOrEqual(0);
    expect(nameIndex).toBe(lengthIndex + 1);
})


// https://github.com/tc39/test262/blob/c84c53e7dc46f9b0a4cf89deb139fcebde9e4c75/test/built-ins/Promise/reject-function-prototype.js
test("The [[Prototype]] of Promise Reject functions", ({ reject }) => {
    expect(Object.getPrototypeOf(reject)).toBe(Function.prototype);
})
