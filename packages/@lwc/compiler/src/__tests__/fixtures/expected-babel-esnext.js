import { registerDecorators } from 'lwc';
var _object$foo, _obj, _obj$foo, _obj$foo$bar;
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? Object(arguments[i]) : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _awaitAsyncGenerator(value) { return new _AwaitValue(value); }
function _wrapAsyncGenerator(fn) { return function () { return new _AsyncGenerator(fn.apply(this, arguments)); }; }
function _AsyncGenerator(gen) { var front, back; function send(key, arg) { return new Promise(function (resolve, reject) { var request = { key: key, arg: arg, resolve: resolve, reject: reject, next: null }; if (back) { back = back.next = request; } else { front = back = request; resume(key, arg); } }); } function resume(key, arg) { try { var result = gen[key](arg); var value = result.value; var wrappedAwait = value instanceof _AwaitValue; Promise.resolve(wrappedAwait ? value.wrapped : value).then(function (arg) { if (wrappedAwait) { resume(key === "return" ? "return" : "next", arg); return; } settle(result.done ? "return" : "normal", arg); }, function (err) { resume("throw", err); }); } catch (err) { settle("throw", err); } } function settle(type, value) { switch (type) { case "return": front.resolve({ value: value, done: true }); break; case "throw": front.reject(value); break; default: front.resolve({ value: value, done: false }); break; } front = front.next; if (front) { resume(front.key, front.arg); } else { back = null; } } this._invoke = send; if (typeof gen.return !== "function") { this.return = undefined; } }
if (typeof Symbol === "function" && Symbol.asyncIterator) { _AsyncGenerator.prototype[Symbol.asyncIterator] = function () { return this; }; }
_AsyncGenerator.prototype.next = function (arg) { return this._invoke("next", arg); };
_AsyncGenerator.prototype.throw = function (arg) { return this._invoke("throw", arg); };
_AsyncGenerator.prototype.return = function (arg) { return this._invoke("return", arg); };
function _AwaitValue(value) { this.wrapped = value; }
function agf() {
    return _agf.apply(this, arguments);
} // @babel/plugin-transform-class-properties
function _agf() {
    _agf = _wrapAsyncGenerator(function* () {
        yield _awaitAsyncGenerator(1);
        yield 2;
    });
    return _agf.apply(this, arguments);
}
class Bar {
    constructor() {
        this.bar = "foo";
    }
} // @babel/plugin-proposal-nullish-coalescing-operator
registerDecorators(Bar, {
    fields: ["bar"]
});
const foo = (_object$foo = object.foo) !== null && _object$foo !== void 0 ? _object$foo : "default"; // @babel/plugin-proposal-numeric-separator
const budget = 1000000000000; // @babel/plugin-transform-object-rest-spread
z = _objectSpread({
    x
}, y);
z = {
    x,
    w: _objectSpread({}, y)
}; // @babel/plugin-proposal-optional-catch-binding
try {
    throw 0;
} catch (_unused) {
    doSomethingWhichDoesNotCareAboutTheValueThrown();
} // @babel/plugin-proposal-optional-chaining
const baz = (_obj = obj) === null || _obj === void 0 ? void 0 : (_obj$foo = _obj.foo) === null || _obj$foo === void 0 ? void 0 : (_obj$foo$bar = _obj$foo.bar) === null || _obj$foo$bar === void 0 ? void 0 : _obj$foo$bar.baz;
export { Bar, agf, baz, budget, foo };