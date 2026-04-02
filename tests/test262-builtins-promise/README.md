https://github.com/tc39/test262/tree/main/test/built-ins/Promise

Try to use Vitest idioms instead of Test262 idioms.

Example: Use `expect(...).toThrow(...)` instead of `assert.throws(...)`.

Example: Use `new Promise(done => { ...; done(); })` instead of `.then($DONE)`.