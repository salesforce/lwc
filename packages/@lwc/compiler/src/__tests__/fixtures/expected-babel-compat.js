import __callKey0 from 'proxy-compat/callKey0';
import __callKey2 from 'proxy-compat/callKey2';
import __callKey1 from 'proxy-compat/callKey1';
import __setKey from 'proxy-compat/setKey';
import __callKey3 from 'proxy-compat/callKey3';
import __inKey from 'proxy-compat/inKey';
import __iterableKey from 'proxy-compat/iterableKey';
import _regeneratorRuntime from '@babel/runtime/regenerator';
import _asyncToGenerator from '@babel/runtime/helpers/asyncToGenerator';
import _createClass from '@babel/runtime/helpers/createClass';
import _typeof from '@babel/runtime/helpers/typeof';
import _taggedTemplateLiteral from '@babel/runtime/helpers/taggedTemplateLiteral';
import _toConsumableArray from '@babel/runtime/helpers/toConsumableArray';
import _slicedToArray from '@babel/runtime/helpers/slicedToArray';
import _defineProperty2 from '@babel/runtime/helpers/defineProperty';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _inherits from '@babel/runtime/helpers/inherits';
import _possibleConstructorReturn from '@babel/runtime/helpers/possibleConstructorReturn';
import _getPrototypeOf from '@babel/runtime/helpers/getPrototypeOf';
import { registerDecorators } from 'lwc';
var _templateObject, _templateObject2, _templateObject3;
function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || (o._ES5ProxyType ? o.get(Symbol.iterator) : o[Symbol.iterator]) == null) { if (Array.compatIsArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof (o._ES5ProxyType ? o.get("length") : o.length) === "number") { if (it) o = it; var i = 0; var F = function () {}; return { s: F, n: function () { var _i2; if (i >= (o._ES5ProxyType ? o.get("length") : o.length)) return { done: true }; return { done: false, value: (_i2 = i++, o._ES5ProxyType ? o.get(_i2) : o[_i2]) }; }, e: function (e) { throw e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function () { it = __callKey0(o, Symbol.iterator); }, n: function () { var step = __callKey0(it, "next"); normalCompletion = step._ES5ProxyType ? step.get("done") : step.done; return step; }, e: function (e) { didErr = true; err = e; }, f: function () { try { if (!normalCompletion && (it._ES5ProxyType ? it.get("return") : it.return) != null) __callKey0(it, "return"); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { var _constructor; if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = __callKey2(__callKey1(Object.prototype._ES5ProxyType ? Object.prototype.get("toString") : Object.prototype.toString, "call", o), "slice", 8, -1); if (n === "Object" && (o._ES5ProxyType ? o.get("constructor") : o.constructor)) n = (_constructor = o._ES5ProxyType ? o.get("constructor") : o.constructor, _constructor._ES5ProxyType ? _constructor.get("name") : _constructor.name); if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || __callKey1(/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/, "test", n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > (arr._ES5ProxyType ? arr.get("length") : arr.length)) len = arr._ES5ProxyType ? arr.get("length") : arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) __setKey(arr2, i, arr._ES5ProxyType ? arr.get(i) : arr[i]); return arr2; }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var _getPrototypeOf2; var NewTarget = (_getPrototypeOf2 = _getPrototypeOf(this), _getPrototypeOf2._ES5ProxyType ? _getPrototypeOf2.get("constructor") : _getPrototypeOf2.constructor); result = __callKey3(Reflect, "construct", Super, arguments, NewTarget); } else { result = __callKey2(Super, "apply", this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _isNativeReflectConstruct() { var _construct; if (typeof Reflect === "undefined" || !(Reflect._ES5ProxyType ? Reflect.get("construct") : Reflect.construct)) return false; if (_construct = Reflect._ES5ProxyType ? Reflect.get("construct") : Reflect.construct, _construct._ES5ProxyType ? _construct.get("sham") : _construct.sham) return false; if (typeof Proxy === "function") return true; try { __callKey1(Boolean.prototype._ES5ProxyType ? Boolean.prototype.get("valueOf") : Boolean.prototype.valueOf, "call", __callKey3(Reflect, "construct", Boolean, [], function () {})); return true; } catch (e) { return false; } }
function ownKeys(object, enumerableOnly) {
var keys = Object.compatKeys(object);
if (Object.getOwnPropertySymbols) {
var symbols = Object.getOwnPropertySymbols(object);
if (enumerableOnly) symbols = __callKey1(symbols, "filter", function (sym) {
var _Object$compatGetOwnP;
return _Object$compatGetOwnP = Object.compatGetOwnPropertyDescriptor(object, sym), _Object$compatGetOwnP._ES5ProxyType ? _Object$compatGetOwnP.get("enumerable") : _Object$compatGetOwnP.enumerable;
});
__callKey2(keys.push, "apply", keys, symbols);
}
return keys;
}
function _objectSpread(target) {
for (var i = 1; i < arguments.length; i++) {
var source = arguments[i] != null ? arguments[i] : {};
if (i % 2) {
__callKey1(ownKeys(Object(source), true), "forEach", function (key) {
_defineProperty(target, key, source._ES5ProxyType ? source.get(key) : source[key]);
});
} else if (Object.getOwnPropertyDescriptors) {
Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
} else {
__callKey1(ownKeys(Object(source)), "forEach", function (key) {
Object.compatDefineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
});
}
}
return target;
}
function _defineProperty(obj, key, value) {
if (__inKey(obj, key)) {
Object.compatDefineProperty(obj, key, {
value: value,
enumerable: true,
configurable: true,
writable: true
});
} else {
__setKey(obj, key, value);
}
return obj;
} // babel-plugin-check-es2015-constants
// https://github.com/babel/babel/blob/master/packages/babel-plugin-check-es2015-constants/test/fixtures/general/program/actual.js
var MULTIPLIER = 5;
for (var i in __iterableKey(arr)) {
__callKey1(console, "log", (arr._ES5ProxyType ? arr.get(i) : arr[i]) * MULTIPLIER);
} // babel-plugin-transform-es2015-arrow-functions
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-es2015-arrow-functions/test/fixtures/arrow-functions/expression/actual.js
__callKey1(arr, "map", function (x) {
return __callKey1(console, "log", x * x);
}); // babel-plugin-transform-es2015-block-scoping
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-es2015-block-scoping/test/fixtures/general/function/actual.js
function test() {
var foo = "bar";
__callKey1(console, "log", foo);
} // babel-plugin-transform-es2015-classes
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-es2015-classes/test/fixtures/loose/super-class/actual.js
var Test = /*#__PURE__*/function (_Foo) {
_inherits(Test, _Foo);
var _super = _createSuper(Test);
function Test() {
_classCallCheck(this, Test);
return __callKey2(_super, "apply", this, arguments);
}
return Test;
}(Foo); //babel-plugin-transform-es2015-computed-properties
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-es2015-computed-properties/test/fixtures/loose/single/actual.js
var obj1 = _defineProperty2({}, "x" + foo, "heh"); // babel-plugin-transform-es2015-destructuring
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-es2015-destructuring/test/fixtures/destructuring/object-basic/actual.js
var coords = [1, 2];
var x = coords._ES5ProxyType ? coords.get("x") : coords.x,
y = coords._ES5ProxyType ? coords.get("y") : coords.y;
__callKey2(console, "log", x, y); // babel-plugin-transform-es2015-for-of
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-es2015-for-of/test/fixtures/loose/let/actual.js
var _iterator = _createForOfIteratorHelper(arr),
_step;
try {
for (__callKey0(_iterator, "s"); !(_step2 = _step = __callKey0(_iterator, "n"), _done = _step2._ES5ProxyType ? _step2.get("done") : _step2.done);) {
var _step2, _done;
var _i = _step._ES5ProxyType ? _step.get("value") : _step.value;
__callKey1(console, "log", _i);
} // babel-plugin-transform-es2015-parameters
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-es2015-parameters/test/fixtures/use-loose-option/default-array-destructuring/actual.js
} catch (err) {
__callKey1(_iterator, "e", err);
} finally {
__callKey0(_iterator, "f");
}
function t() {
var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [1, 2, 3],
_ref2 = _slicedToArray(_ref, 3),
a = _ref2._ES5ProxyType ? _ref2.get(2) : _ref2[2];
return a;
} // babel-plugin-transform-es2015-shorthand-properties
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-es2015-shorthand-properties/test/fixtures/shorthand-properties/method-plain/actual.js
var obj2 = {
method: function method() {
return 5 + 5;
}
}; // babel-plugin-transform-es2015-spread
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-es2015-spread/test/fixtures/spread/single/actual.js
__callKey1(console, "log", _toConsumableArray(foo)); // babel-plugin-transform-es2015-template-literals
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-es2015-template-literals/test/fixtures/loose/tag/actual.js
function literal() {
var foo = bar(_templateObject || (_templateObject = _taggedTemplateLiteral(["wow\na", "b ", ""], ["wow\\na", "b ", ""])), 42, __callKey0(_, "foobar"));
var bar = bar(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["wow\nab", " ", ""], ["wow\\nab", " ", ""])), 42, __callKey0(_, "foobar"));
var baz = bar(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["wow\naB", " ", ""], ["wow\\naB", " ", ""])), 42, __callKey0(_, "baz"));
return [foo, bar, baz];
} // babel-plugin-transform-es2015-typeof-symbol
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-es2015-typeof-symbol/test/fixtures/symbols/typeof/actual.js
var s = Symbol("s");
__callKey1(assert, "ok", _typeof(s) === "symbol");
__callKey2(assert, "equal", _typeof(s), "symbol");
__callKey2(assert, "equal", _typeof(_typeof(s._ES5ProxyType ? s.get("foo") : s.foo)), "symbol");
var ts = typeof s === "string";
__callKey1(assert, "isNotOk", (typeof o === "undefined" ? "undefined" : _typeof(o)) === "symbol");
__callKey2(assert, "notEqual", typeof o === "undefined" ? "undefined" : _typeof(o), "symbol");
__callKey2(assert, "notEqual", _typeof(_typeof(o._ES5ProxyType ? o.get("foo") : o.foo)), "symbol"); // babel-plugin-transform-es2015-unicode-regex
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-es2015-unicode-regex/test/fixtures/unicode-regex/basic/actual.js
var string = "foo💩bar";
var match = __callKey1(string, "match", /foo((?:[\0-\t\x0B\f\x0E-\u2027\u202A-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]))bar/);
__callKey3(assert, "notEqual", string, match, ts); // babel-plugin-transform-async-to-generator
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-async-to-generator/test/fixtures/async-to-generator/async/actual.js
var Foo = /*#__PURE__*/function () {
function Foo() {
_classCallCheck(this, Foo);
}
_createClass(Foo, [{
key: "foo",
value: function () {
var _foo = _asyncToGenerator( /*#__PURE__*/__callKey1(_regeneratorRuntime, "mark", function _callee() {
return __callKey2(_regeneratorRuntime, "wrap", function _callee$(_context) {
while (1) {
switch (__setKey(_context, "prev", _context._ES5ProxyType ? _context.get("next") : _context.next)) {
case 0:
__setKey(_context, "next", 2);
return bar();
case 2:
_context._ES5ProxyType ? _context.get("sent") : _context.sent;
case 3:
case "end":
return __callKey0(_context, "stop");
}
}
}, _callee);
}));
function foo() {
return __callKey2(_foo, "apply", this, arguments);
}
return foo;
}()
}]);
return Foo;
}(); // babel-plugin-transform-exponentiation-operator
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-exponentiation-operator/test/fixtures/exponentian-operator/assignment/actual.js
var num = 1;
num = __callKey2(Math, "pow", num, 2);
__callKey1(console, "log", num); // babel-plugin-transform-object-rest-spread
// https://github.com/babel/babel/blob/6.x/packages/babel-plugin-transform-object-rest-spread/test/fixtures/object-spread/assignment/actual.js
z = _objectSpread({
x: x
}, y);
z = {
x: x,
w: _objectSpread({}, y)
}; // babel-plugin-transform-class-properties
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-class-properties/test/fixtures/loose/instance/actual.js
var Bar = function Bar() {
_classCallCheck(this, Bar);
__setKey(this, "bar", "foo");
};
registerDecorators(Bar, {
fields: ["bar"]
});
export { Bar, Test, literal, obj1, obj2, t, test };
