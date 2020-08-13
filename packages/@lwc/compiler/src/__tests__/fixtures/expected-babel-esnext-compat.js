import __concat from 'proxy-compat/concat';
import __callKey1 from 'proxy-compat/callKey1';
import __inKey from 'proxy-compat/inKey';
import __setKey from 'proxy-compat/setKey';
import __callKey2 from 'proxy-compat/callKey2';
import __callKey3 from 'proxy-compat/callKey3';
import __callKey0 from 'proxy-compat/callKey0';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _regeneratorRuntime from '@babel/runtime/regenerator';
import _instanceof from '@babel/runtime/helpers/instanceof';
import { registerDecorators } from 'lwc';
var _object$foo, _obj, _obj$foo, _obj$foo$bar;
function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i] != null ? Object(arguments[i]) : {};
        var ownKeys = Object.compatKeys(source);
        if (typeof Object.getOwnPropertySymbols === 'function') {
            ownKeys = __concat(ownKeys, __callKey1(Object.getOwnPropertySymbols(source), "filter", function (sym) {
                var _Object$compatGetOwnP, _enumerable;
                return _Object$compatGetOwnP = Object.compatGetOwnPropertyDescriptor(source, sym), _enumerable = _Object$compatGetOwnP._ES5ProxyType ? _Object$compatGetOwnP.get("enumerable") : _Object$compatGetOwnP.enumerable;
            }));
        }
        __callKey1(ownKeys, "forEach", function (key) {
            _defineProperty(target, key, source._ES5ProxyType ? source.get(key) : source[key]);
        });
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
}
function _awaitAsyncGenerator(value) {
    return new _AwaitValue(value);
}
function _wrapAsyncGenerator(fn) {
    return function () {
        return new _AsyncGenerator(__callKey2(fn, "apply", this, arguments));
    };
}
function _AsyncGenerator(gen) {
var front, back;
function send(key, arg) {
    return new Promise(function (resolve, reject) {
        var request = {
            key: key,
            arg: arg,
            resolve: resolve,
            reject: reject,
            next: null
        };
        if (back) {
            back = __setKey(back, "next", request);
        } else {
            front = back = request;
            resume(key, arg);
        }
    });
}
function resume(key, arg) {
    try {
        var result = __callKey1(gen, key, arg);
        var value = result._ES5ProxyType ? result.get("value") : result.value;
        var wrappedAwait = _instanceof(value, _AwaitValue);
        __callKey2(Promise.resolve(wrappedAwait ? value._ES5ProxyType ? value.get("wrapped") : value.wrapped : value), "then", function (arg) {
            if (wrappedAwait) {
                resume(key === "return" ? "return" : "next", arg);
                return;
            }
            settle((result._ES5ProxyType ? result.get("done") : result.done) ? "return" : "normal", arg);
        }, function (err) {
            resume("throw", err);
        });
    } catch (err) {
        settle("throw", err);
    }
}
function settle(type, value) {
    switch (type) {
        case "return":
            __callKey1(front, "resolve", {
                value: value,
                done: true
            });
        break;
        case "throw":
            __callKey1(front, "reject", value);
            break;
        default:
            __callKey1(front, "resolve", {
                value: value,
                done: false
            });
            break;
    }
    front = front._ES5ProxyType ? front.get("next") : front.next;
    if (front) {
        resume(front._ES5ProxyType ? front.get("key") : front.key, front._ES5ProxyType ? front.get("arg") : front.arg);
    } else {
        back = null;
    }
}
__setKey(this, "_invoke", send);
if (typeof (gen._ES5ProxyType ? gen.get("return") : gen.return) !== "function") {
__setKey(this, "return", undefined);
}
}
if (typeof Symbol === "function" && Symbol.asyncIterator) {
__setKey(_AsyncGenerator._ES5ProxyType ? _AsyncGenerator.get("prototype") : _AsyncGenerator.prototype, Symbol.asyncIterator, function () {
return this;
});
}
__setKey(_AsyncGenerator._ES5ProxyType ? _AsyncGenerator.get("prototype") : _AsyncGenerator.prototype, "next", function (arg) {
return __callKey2(this, "_invoke", "next", arg);
});
__setKey(_AsyncGenerator._ES5ProxyType ? _AsyncGenerator.get("prototype") : _AsyncGenerator.prototype, "throw", function (arg) {
return __callKey2(this, "_invoke", "throw", arg);
});
__setKey(_AsyncGenerator._ES5ProxyType ? _AsyncGenerator.get("prototype") : _AsyncGenerator.prototype, "return", function (arg) {
return __callKey2(this, "_invoke", "return", arg);
});
function _AwaitValue(value) {
    __setKey(this, "wrapped", value);
}
function agf() {
    return __callKey2(_agf, "apply", this, arguments);
} // @babel/plugin-transform-class-properties
function _agf() {
_agf = _wrapAsyncGenerator( /*#__PURE__*/__callKey1(_regeneratorRuntime, "mark", function _callee() {
    return __callKey3(_regeneratorRuntime, "wrap", function _callee$(_context) {
        while (1) {
            switch (__setKey(_context, "prev", _context._ES5ProxyType ? _context.get("next") : _context.next)) {
                case 0:
                    __setKey(_context, "next", 2);
                    return _awaitAsyncGenerator(1);
                case 2:
                    __setKey(_context, "next", 4);
                    return 2;
                case 4:
                case "end":
                    return __callKey0(_context, "stop");
            }
        }
        }, _callee, this);
    }));
    return __callKey2(_agf, "apply", this, arguments);
}
var Bar = function Bar() {
    _classCallCheck(this, Bar);
    __setKey(this, "bar", "foo");
}; // @babel/plugin-proposal-nullish-coalescing-operator
registerDecorators(Bar, {
    fields: ["bar"]
});
var foo = (_object$foo = object._ES5ProxyType ? object.get("foo") : object.foo) !== null && _object$foo !== void 0 ? _object$foo : "default"; // @babel/plugin-proposal-numeric-separator
var budget = 1000000000000; // @babel/plugin-transform-object-rest-spread
z = _objectSpread({
    x: x
}, y);
z = {
    x: x,
    w: _objectSpread({}, y)
}; // @babel/plugin-proposal-optional-catch-binding
try {
    throw 0;
} catch (_unused) {
    doSomethingWhichDoesNotCareAboutTheValueThrown();
} // @babel/plugin-proposal-optional-chaining
var baz = (_obj = obj) === null || _obj === void 0 ? void 0 : (_obj$foo = _obj._ES5ProxyType ? _obj.get("foo") : _obj.foo) === null || _obj$foo === void 0 ? void 0 : (_obj$foo$bar = _obj$foo._ES5ProxyType ? _obj$foo.get("bar") : _obj$foo.bar) === null || _obj$foo$bar === void 0 ? void 0 : _obj$foo$bar._ES5ProxyType ? _obj$foo$bar.get("baz") : _obj$foo$bar.baz;
export { Bar, agf, baz, budget, foo };