import { test as baseTest, type TestAPI } from "vite-plus/test"

const test: TestAPI<Omit<object, "$__test"> & Record<"Promise", PromiseConstructor> & {
    readonly $__worker?: object | undefined;
    readonly $__file?: object | undefined;
    readonly $__test?: (object & Record<"Promise", PromiseConstructor>) | undefined;
}> = baseTest.extend("Promise", Promise);
export { test as default }