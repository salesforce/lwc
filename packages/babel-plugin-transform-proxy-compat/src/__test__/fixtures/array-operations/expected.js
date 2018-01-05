import __ProxyCompat from "proxy-compat";
var __callKey = __ProxyCompat.callKey;
var __getKey = __ProxyCompat.getKey;
var __setKey = __ProxyCompat.setKey;
// [].push(1);
[].push(1);

// [].push(2, 3);
[].push(2, 3);

// [].push(4).toString();
__callKey([].push(4), "toString");

// [].push(5) + 1;
[].push(5) + 1;

// [0].unshift(1);
[0].unshift(1);

// [1].concat([2]);
[1].concat([2]);

// var foo = { bar: { baz: [] } };
var foo = { bar: { baz: [] } };

// foo.bar.baz.push(1);
__getKey(__getKey(foo, "bar"), "baz").push(1);

// var push = Array.prototype.push;
var push = __getKey(Array.prototype, "compatPush");

// var concat = Array.prototype.concat;
var concat = __getKey(Array.prototype, "compatConcat");

// var unshift = Array.prototype.unshift;
var unshift = __getKey(Array.prototype, "compatUnshift");

// var slice = Array.prototype.slice;
var slice = __getKey(Array.prototype, "slice");

// var bar = [];
var bar = [];

// push.call(bar, 1);
__callKey(push, "call", bar, 1);

// push.apply(bar, [1]);
__callKey(push, "apply", bar, [1]);

/*
class MyArray {
    constructor(arr = []) {
        this.arr = arr;
    }
    push(...args) {
        this.arr.push(...args);
    }
    get(index) {
        return this.arr[index]
    }
}
*/
class MyArray {
    constructor(arr = []) {
        __setKey(this, "arr", arr);
    }
    push(...args) {
        __getKey(this, "arr").push(...args);
    }
    get(index) {
        return __getKey(__getKey(this, "arr"), index);
    }
}

// var arr = new MyArray();
var arr = new MyArray();

// arr.push(1);
arr.push(1);
