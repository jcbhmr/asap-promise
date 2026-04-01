// oxlint-disable no-floating-promises
// oxlint-disable no-thenable
const dummy = { dummy: "dummy" };

export default {
  undefined() {
    return undefined;
  },
  null() {
    return null;
  },
  false() {
    return false;
  },
  "0"() {
    return 0;
  },
  error(): Error {
    return new Error();
  },
  "error without stack"(): Error {
    const error = new Error();
    delete error.stack;
    return error;
  },
  date(): Date {
    return new Date();
  },
  object() {
    return {};
  },
  "never thenable"(): { then(): void } {
    return {
      then() {},
    };
  },
  "fulfilled promise"(): Promise<typeof dummy> {
    return Promise.resolve(dummy);
  },
  "rejected promise"(): Promise<never> {
    return Promise.reject(dummy);
  },
};
