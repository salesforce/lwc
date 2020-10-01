import { registerDecorators } from 'lwc';
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? Object(arguments[i]) : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
// https://github.com/babel/babel/blob/master/packages/babel-plugin-check-es2015-constants/test/fixtures/general/program/actual.js
const MULTIPLIER = 5;

for (var i in arr) {
    console.log(arr[i] * MULTIPLIER);
} // babel-plugin-transform-es2015-arrow-functions
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-es2015-arrow-functions/test/fixtures/arrow-functions/expression/actual.js


arr.map(x => console.log(x * x)); // babel-plugin-transform-es2015-block-scoping
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-es2015-block-scoping/test/fixtures/general/function/actual.js

function test() {
    let foo = "bar";
    console.log(foo);
} // babel-plugin-transform-es2015-classes
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-es2015-classes/test/fixtures/loose/super-class/actual.js

class Test extends Foo {} //babel-plugin-transform-es2015-computed-properties
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-es2015-computed-properties/test/fixtures/loose/single/actual.js

const obj1 = {
    ["x" + foo]: "heh"
}; // babel-plugin-transform-es2015-destructuring
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-es2015-destructuring/test/fixtures/destructuring/object-basic/actual.js

var coords = [1, 2];
var {
    x,
    y
} = coords;
console.log(x, y); // babel-plugin-transform-es2015-for-of
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-es2015-for-of/test/fixtures/loose/let/actual.js

for (let i of arr) {
    console.log(i);
} // babel-plugin-transform-es2015-parameters
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-es2015-parameters/test/fixtures/use-loose-option/default-array-destructuring/actual.js


function t([,, a] = [1, 2, 3]) {
    return a;
} // babel-plugin-transform-es2015-shorthand-properties
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-es2015-shorthand-properties/test/fixtures/shorthand-properties/method-plain/actual.js

const obj2 = {
    method() {
    return 5 + 5;
    }

}; // babel-plugin-transform-es2015-spread
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-es2015-spread/test/fixtures/spread/single/actual.js

console.log([...foo]); // babel-plugin-transform-es2015-template-literals
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-es2015-template-literals/test/fixtures/loose/tag/actual.js

function literal() {
    var foo = bar`wow\na${42}b ${_.foobar()}`;
    var bar = bar`wow\nab${42} ${_.foobar()}`;
    var baz = bar`wow\naB${42} ${_.baz()}`;
    return [foo, bar, baz];
} // babel-plugin-transform-es2015-typeof-symbol
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-es2015-typeof-symbol/test/fixtures/symbols/typeof/actual.js

var s = Symbol("s");
assert.ok(typeof s === "symbol");
assert.equal(typeof s, "symbol");
assert.equal(typeof typeof s.foo, "symbol");
var ts = typeof s === "string";
assert.isNotOk(typeof o === "symbol");
assert.notEqual(typeof o, "symbol");
assert.notEqual(typeof typeof o.foo, "symbol"); // babel-plugin-transform-es2015-unicode-regex
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-es2015-unicode-regex/test/fixtures/unicode-regex/basic/actual.js

var string = "foo💩bar";
var match = string.match(/foo(.)bar/u);
assert.notEqual(string, match, ts); // babel-plugin-transform-async-to-generator
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-async-to-generator/test/fixtures/async-to-generator/async/actual.js

class Foo {
    async foo() {
    var wat = await bar();
    }

} // babel-plugin-transform-exponentiation-operator
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-exponentiation-operator/test/fixtures/exponentian-operator/assignment/actual.js


var num = 1;
num **= 2;
console.log(num); // babel-plugin-transform-object-rest-spread
// https://github.com/babel/babel/blob/6.x/packages/babel-plugin-transform-object-rest-spread/test/fixtures/object-spread/assignment/actual.js

z = _objectSpread({
    x
}, y);
z = {
    x,
    w: _objectSpread({}, y)
}; // babel-plugin-transform-class-properties
// https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-class-properties/test/fixtures/loose/instance/actual.js

class Bar {
    constructor() {
    this.bar = "foo";
    }

}
registerDecorators(Bar, {
    fields: ["bar"]
});
export { Bar, Test, literal, obj1, obj2, t, test };

