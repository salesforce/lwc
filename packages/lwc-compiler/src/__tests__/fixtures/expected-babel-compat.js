import __iterableKey from 'proxy-compat/iterableKey';
import __callKey from 'proxy-compat/callKey';
import __getKey from 'proxy-compat/getKey';
import __setKey from 'proxy-compat/setKey';
import _regeneratorRuntime from 'babel-compat/regenerator';
import _asyncToGenerator from 'babel-compat/helpers/asyncToGenerator';
import _createClass from 'babel-compat/helpers/createClass';
import _typeof from 'babel-compat/helpers/typeof';
import _taggedTemplateLiteral from 'babel-compat/helpers/taggedTemplateLiteral';
import _toConsumableArray from 'babel-compat/helpers/toConsumableArray';
import _slicedToArray from 'babel-compat/helpers/slicedToArray';
import _defineProperty from 'babel-compat/helpers/defineProperty';
import _classCallCheck from 'babel-compat/helpers/classCallCheck';
import _possibleConstructorReturn from 'babel-compat/helpers/possibleConstructorReturn';
import _inherits from 'babel-compat/helpers/inherits';

var _templateObject = /*#__PURE__*/ _taggedTemplateLiteral(["wow\na", "b ", ""], ["wow\\na", "b ", ""]),
_templateObject2 = /*#__PURE__*/ _taggedTemplateLiteral(["wow\nab", " ", ""], ["wow\\nab", " ", ""]),
_templateObject3 = /*#__PURE__*/ _taggedTemplateLiteral(["wow\naB", " ", ""], ["wow\\naB", " ", ""]);

// babel-plugin-check-es2015-constants
// https://github.com/babel/babel/blob/master/packages/babel-plugin-check-es2015-constants/test/fixtures/general/program/actual.js
var MULTIPLIER = 5;

for (var i in __iterableKey(arr)) {
    __callKey(console, "log", __getKey(arr, i) * MULTIPLIER);
} // babel-plugin-transform-es2015-arrow-functions
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-es2015-arrow-functions/test/fixtures/arrow-functions/expression/actual.js


__callKey(arr, "map", function (x) {
    return __callKey(console, "log", x * x);
}); // babel-plugin-transform-es2015-block-scoping
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-es2015-block-scoping/test/fixtures/general/function/actual.js


function test() {
    var foo = "bar";

    __callKey(console, "log", foo);
} // babel-plugin-transform-es2015-classes
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-es2015-classes/test/fixtures/loose/super-class/actual.js

var Test =
/*#__PURE__*/
function (_Foo) {
    _inherits(Test, _Foo);

    function Test() {
    _classCallCheck(this, Test);

    return _possibleConstructorReturn(this, __callKey(__getKey(Test, "__proto__") || Object.getPrototypeOf(Test), "apply", this, arguments));
    }

    return Test;
}(Foo); //babel-plugin-transform-es2015-computed-properties
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-es2015-computed-properties/test/fixtures/loose/single/actual.js

var obj1 = _defineProperty({}, "x" + foo, "heh"); // babel-plugin-transform-es2015-destructuring
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-es2015-destructuring/test/fixtures/destructuring/object-basic/actual.js

var coords = [1, 2];

var x = __getKey(coords, "x"),
y = __getKey(coords, "y");

__callKey(console, "log", x, y); // babel-plugin-transform-es2015-for-of
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-es2015-for-of/test/fixtures/loose/let/actual.js


var _iteratorNormalCompletion = true;
var _didIteratorError = false;
var _iteratorError = undefined;

try {
    for (var _iterator = __callKey(arr, Symbol.iterator), _step; !(_iteratorNormalCompletion = __getKey(_step = __callKey(_iterator, "next"), "done")); _iteratorNormalCompletion = true) {
    var _i = __getKey(_step, "value");

    __callKey(console, "log", _i);
    } // babel-plugin-transform-es2015-parameters
    // https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-es2015-parameters/test/fixtures/use-loose-option/default-array-destructuring/actual.js

} catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
} finally {
    try {
    if (!_iteratorNormalCompletion && __getKey(_iterator, "return") != null) {
        __callKey(_iterator, "return");
    }
    } finally {
    if (_didIteratorError) {
        throw _iteratorError;
    }
    }
}

function t() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [1, 2, 3],
        _ref2 = _slicedToArray(_ref, 3),
        a = __getKey(_ref2, 2);

    return a;
} // babel-plugin-transform-es2015-shorthand-properties
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-es2015-shorthand-properties/test/fixtures/shorthand-properties/method-plain/actual.js

var obj2 = {
    method: function method() {
    return 5 + 5;
    }
}; // babel-plugin-transform-es2015-spread
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-es2015-spread/test/fixtures/spread/single/actual.js

__callKey(console, "log", _toConsumableArray(foo)); // babel-plugin-transform-es2015-template-literals
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-es2015-template-literals/test/fixtures/loose/tag/actual.js


function literal() {
    var foo = bar(_templateObject, 42, __callKey(_, "foobar"));
    var bar = bar(_templateObject2, 42, __callKey(_, "foobar"));
    var baz = bar(_templateObject3, 42, __callKey(_, "baz"));
    return [foo, bar, baz];
} // babel-plugin-transform-es2015-typeof-symbol
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-es2015-typeof-symbol/test/fixtures/symbols/typeof/actual.js

var s = Symbol("s");

__callKey(assert, "ok", _typeof(s) === "symbol");

__callKey(assert, "equal", _typeof(s), "symbol");

__callKey(assert, "equal", _typeof(_typeof(__getKey(s, "foo"))), "symbol");

var ts = typeof s === "string";

__callKey(assert, "isNotOk", (typeof o === "undefined" ? "undefined" : _typeof(o)) === "symbol");

__callKey(assert, "notEqual", typeof o === "undefined" ? "undefined" : _typeof(o), "symbol");

__callKey(assert, "notEqual", _typeof(_typeof(__getKey(o, "foo"))), "symbol"); // babel-plugin-transform-es2015-unicode-regex
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-es2015-unicode-regex/test/fixtures/unicode-regex/basic/actual.js

var string = "foo💩bar";

var match = __callKey(string, "match", /foo((?:[\0-\t\x0B\f\x0E-\u2027\u202A-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]))bar/);
__callKey(assert, "notEqual", string, match, ts); // babel-plugin-transform-async-to-generator
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-async-to-generator/test/fixtures/async-to-generator/async/actual.js


var Foo =
/*#__PURE__*/
function () {
    function Foo() {
    _classCallCheck(this, Foo);
    }

    _createClass(Foo, [{
    key: "foo",
    value: function () {
        var _foo = _asyncToGenerator(
        /*#__PURE__*/
        __callKey(_regeneratorRuntime, "mark", function _callee() {
        var wat;
        return __callKey(_regeneratorRuntime, "wrap", function _callee$(_context) {
            while (1) {
            switch (__setKey(_context, "prev", __getKey(_context, "next"))) {
                case 0:
                __setKey(_context, "next", 2);

                return bar();

                case 2:
                wat = __getKey(_context, "sent");

                case 3:
                case "end":
                return __callKey(_context, "stop");
            }
            }
        }, _callee, this);
        }));

        return function foo() {
        return __callKey(_foo, "apply", this, arguments);
        };
    }()
    }]);

    return Foo;
}(); // babel-plugin-transform-exponentiation-operator
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-exponentiation-operator/test/fixtures/exponentian-operator/assignment/actual.js


var num = 1;
num = __callKey(Math, "pow", num, 2);

__callKey(console, "log", num); // babel-plugin-transform-object-rest-spread
// https://github.com/babel/babel/blob/6.x/packages/babel-plugin-transform-object-rest-spread/test/fixtures/object-spread/assignment/actual.js


z = Object.assign({
    x: x
}, y);
z = {
    x: x,
    w: Object.assign({}, y)
}; // babel-plugin-transform-class-properties
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-class-properties/test/fixtures/loose/instance/actual.js

var Bar = function Bar() {
    _classCallCheck(this, Bar);

    __setKey(this, "bar", "foo");
};

export { test, Test, obj1, t, obj2, literal, Bar };
