function asyncGeneratorStep(generator, resolve, reject, next, throw_, nextOrThrow, value) {
  try {
    var i = generator[nextOrThrow](value),
      u = i.value;
  } catch (n) {
    return void reject(n);
  }
  i.done ? resolve(u) : Promise.resolve(u).then(next, throw_);
}
function _asyncToGenerator(generatorfn) {
  return function () {
    var that = this,
      thatArguments = arguments;
    return new Promise(function (resolve, reject) {
      var generator = generatorfn.apply(that, thatArguments);
      function _next(value) {
        asyncGeneratorStep(generator, resolve, reject, _next, _throw, "next", value);
      }
      function _throw(value) {
        asyncGeneratorStep(generator, resolve, reject, _next, _throw, "throw", value);
      }
      _next(void 0);
    });
  };
}
function _awaitAsyncGenerator(e) {
  return new _OverloadYield(e, 0);
}
function _wrapAsyncGenerator(e) {
  return function () {
    return new AsyncGenerator(e.apply(this, arguments));
  };
}
function AsyncGenerator(generator) {
  var t, n;
  function resume(nextOrThrowOrReturn, nextValue) {
    try {
      var result = generator[nextOrThrowOrReturn](nextValue),
        resultValue = result.value,
        isOverloadYield = resultValue instanceof _OverloadYield;
      Promise.resolve(isOverloadYield ? resultValue.v : resultValue).then(
        function (resolvedValue) {
          if (isOverloadYield) {
            var method2 = "return" === nextOrThrowOrReturn && resultValue.k ? nextOrThrowOrReturn : "next";
            if (!resultValue.k || resolvedValue.done) return resume(method2, resolvedValue);
            resolvedValue = generator[method2](resolvedValue).value;
          }
          settle(!!result.done, resolvedValue);
        },
        function (e) {
          resume("throw", e);
        },
      );
    } catch (e) {
      settle(2, e);
    }
  }
  function settle(e, r) {
    (2 === e ? t.reject(r) : t.resolve({ value: r, done: e }),
      (t = t.next) ? resume(t.key, t.arg) : (n = null));
  }
  ((this._invoke = function (method, nextValue) {
    return new Promise(function (resolve, reject) {
      var bundle = { key: method, arg: nextValue, resolve: resolve, reject: reject, next: null };
      n ? (n = n.next = bundle) : ((t = n = bundle), resume(method, nextValue));
    });
  }),
    "function" != typeof generator.return && (this.return = void 0));
}
((AsyncGenerator.prototype[
  ("function" == typeof Symbol && Symbol.asyncIterator) || "@@asyncIterator"
] = function () {
  return this;
}),
  (AsyncGenerator.prototype.next = function (e) {
    return this._invoke("next", e);
  }),
  (AsyncGenerator.prototype.throw = function (e) {
    return this._invoke("throw", e);
  }),
  (AsyncGenerator.prototype.return = function (e) {
    return this._invoke("return", e);
  }));
function _OverloadYield(e, d) {
  ((this.v = e), (this.k = d));
}
function doThing() {
  return _doThing.apply(this, arguments);
}
function _doThing() {
  _doThing = _wrapAsyncGenerator(function* () {
    yield _awaitAsyncGenerator(Promise.resolve(1));
    yield 2;
    return 3;
  });
  return _doThing.apply(this, arguments);
}
function otherThing() {
  return _otherThing.apply(this, arguments);
}
function _otherThing() {
  _otherThing = _asyncToGenerator(function* () {
    yield Promise.resolve(1);
    return 2;
  });
  return _otherThing.apply(this, arguments);
}
