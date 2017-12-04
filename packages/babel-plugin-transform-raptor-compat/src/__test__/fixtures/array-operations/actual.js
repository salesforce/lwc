// [].push(1);
[].push(1);

// [].push(2, 3);
[].push(2, 3);

// [].push(4).toString();
[].push(4).toString();

// [].push(5) + 1;
[].push(5) + 1;

// [0].unshift(1);
[0].unshift(1);

// [1].concat([2]);
[1].concat([2]);

// var foo = { bar: { baz: [] } };
var foo = { bar: { baz: [] } };

// foo.bar.baz.push(1);
foo.bar.baz.push(1);

// var push = Array.prototype.push;
var push = Array.prototype.push;

// var concat = Array.prototype.concat;
var concat = Array.prototype.concat;

// var unshift = Array.prototype.unshift;
var unshift = Array.prototype.unshift;

// var slice = Array.prototype.slice;
var slice = Array.prototype.slice;

// var bar = [];
var bar = [];

// push.call(bar, 1);
push.call(bar, 1);

// push.apply(bar, [1]);
push.apply(bar, [1]);

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
    this.arr = arr;
  }

  push(...args) {
    this.arr.push(...args);
  }

  get(index) {
    return this.arr[index]
  }
}

// var arr = new MyArray();
var arr = new MyArray();

// arr.push(1);
arr.push(1);
