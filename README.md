# `QuickPromise`

⏱️ `Promise` with `.status` & `.value` that can resolve synchronously

<table align=center><td>

```js
function greet(name) {
    return new QuickPromise((resolve) => {
        resolve(`Hello, ${name}!`);
    });
}

const greeting = greet("Alan Turing");
console.log("status: %o", greeting.status);
console.log("value: %o", greeting.value);
// Output:
// status: 'fulfilled'
// value: 'Hello, Alan Turing!'

const uppercaseGreeting = greeting.then(g => g.toUpperCase());
console.log("status: %o", uppercaseGreeting.status);
console.log("value: %o", uppercaseGreeting.value);
// Output:
// status: 'fulfilled'
// value: 'HELLO, ALAN TURING!'

// 🚀 All synchronous!
```

</table>

## Installation

```sh
npm install @jcbhmr/quick-promise
```

## Usage

This package `export default`-s a `Promise`-ish class (includes `QuickPromise.all`, `QuickPromise.withResolvers`, etc.) that has some subtle differences in an attempt to make it quicker (hence the name) and more inspectable ("cut to the quick" hence the name).

- **`QuickPromise` has the additional `.status`, `.value`, and `.reason` properties.** \
    They are all readonly. The native `Promise` implementation does not have these properties; you can only observe a native `Promise`'s state through tracking when `.then(onfulfill, onreject)` handlers are called. This cannot be done synchronously using the native `Promise` implementation.

- **`QuickPromise` will trigger `.then(onfulfill, onreject)` handlers synchronously if the promise is already fulfilled or rejected.** \
    This means that `.then()`-derived `QuickPromise`s can possibly run synchronously and resolve in the same task that the parent `QuickPromise` does. The native `Promise` implementation waits until the next promise microtask to run any async handlers. Every `Promise.resolve()` or `.then()` incurs a microtask delay.

- **`QuickPromise` will set `.status`, `.value`, and `.reason` synchronously when the promise is fulfilled or rejected.** \
    This means `QuickPromise.resolve(1)` will have `.status === "fulfilled"` and `.value === 1` immediately after it's called. This means you can unbox a promise within the same synchronous tick that it was created in provided `resolve()` has been called sometime previously. The native `Promise` implementation waits until the next promise microtask to trigger any handlers that observe the promise's state, so you can't synchronously observe a promise's state change within the same task that it was created in; the quickest you can observe a state change is the next microtask.

What are you supposed to do with this? The best use case is creating a fast path for code that deals with promises where you want to collapse all those promise `.then()` microtask queued callbacks into the same task if possible.

⚠️ You may be unknowingly converting `QuickPromise`s to native `Promise`s if you use `async`/`await`.

Example: Async generators that _could_ be synchronous.

```js
import QuickPromise from "@jcbhmr/quick-promise";
import { asyncGenerator, asyncGeneratorAwait } from "@jcbhmr/quick-promise/helpers";

const coolNumbers = asyncGenerator(function* () {
    // Resolves after 10 ms. Not synchronous.
    const promise = scheduler.wait(10).then(() => 42);
    // Special well-known wrapper that tells asyncGenerator() to await the
    // yielded value and give it back instead of yielding the promise itself.
    const result = yield asyncGeneratorAwait(promise);
    // Yield the result of the promise after awaiting it. This is 42.
    yield result;

    yield 50;
    return 4;
})

const it = coolNumbers();

// The first .next() will internally feed asyncGeneratorAwait(promise) back
// into the generator until eventually 'yield result' happens.
const firstPromise = it.next();
console.assert(firstPromise instanceof QuickPromise);
console.assert(firstPromise.status === "pending");
// Note: this mixes Promise and QuickPromise a bit. That's OK here since
// we don't have a need for QuickPromise's instant .then() or other behaviour.
const first = await firstPromise;
console.log("first: %o", first);
// Output: first: { value: 42, done: false }

// We know ('cause we wrote it!) that the second .next() will 'yield 50'
// without any async work. This will internally QuickPromise.resolve(50)
// which we can synchronously unwrap here without waiting for a microtask
// promise callback.
const secondPromise = it.next();
console.assert(secondPromise instanceof QuickPromise);
console.assert(secondPromise.status === "fulfilled");
const second = secondPromise.value;
console.log("second: %o", second);
// Output: second: { value: 50, done: false }

const thirdPromise = it.next();
console.assert(thirdPromise instanceof QuickPromise);
console.assert(thirdPromise.status === "fulfilled");
const third = thirdPromise.value;
console.log("third: %o", third);
// Output: third: { value: 4, done: true }

// We can keep .next()-ing and keep getting new 'done: true' objects
// with 'value: undefined'.
const fourthPromise = it.next();
console.assert(fourthPromise instanceof QuickPromise);
console.assert(fourthPromise.status === "fulfilled");
const fourth = fourthPromise.value;
console.log("fourth: %o", fourth);
// Output: fourth: { value: undefined, done: true }
```
