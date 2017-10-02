var __setKey = window.Proxy.setKey;
var __callKey = window.Proxy.callKey;
var __getKey = window.Proxy.getKey;
var __deleteKey = window.Proxy.deleteKey;
var __iterableKey = window.Proxy.iterableKey;
var __inKey = window.Proxy.inKey;
// var a = 1;
var a = 1;
var n = [0, 1];

// var b, c = 1;
var b,
    c = 1;

// var d = { e: 1 };
var obj = { x: {}, e: 1, foo: { bar: (...args) => args } };

// obj.f = 1;
__setKey(obj, "f", 1);

// console.log("x");
__callKey(console, "log", "x");

// console.log("x", "foo");
__callKey(console, "log", "x", "foo");

// obj.foo.bar(1, 2, 3)
__callKey(__getKey(obj, "foo"), "bar", 1, 2, 3);

// obj.x.y = 1;
__setKey(__getKey(obj, "x"), "y", 1);

// obj["x"].y = 2;
__setKey(__getKey(obj, "x"), "y", 2);

// obj[b] = 1;
__setKey(obj, b, 1);

// obj[2] = {};
__setKey(obj, 2, {});

// obj[2].y = 3;
__setKey(__getKey(obj, 2), "y", 3);

//obj[function (){}] = 1;
__setKey(obj, function () {}, 1);

// obj["y"] = function () {return { z: 2 }};
__setKey(obj, "y", function () {
    return { z: 2 };
});

// obj.y().z = 1;
__setKey(__callKey(obj, "y"), "z", 1);

// var x = obj.r || (obj.r = { m: 5 });
var x = __getKey(obj, "r") || __setKey(obj, "r", { m: 5 });

// for (var i = obj.x.y; i < obj.f; i--) {}
for (var i = __getKey(__getKey(obj, "x"), "y"); i < __getKey(obj, "f"); i--) {}

// while (a = n.pop()) {}
while (a = __callKey(n, "pop")) {}

// ++a;
++a;

// obj.r.m += 3;
__setKey(__getKey(obj, "r"), "m", __getKey(__getKey(obj, "r"), "m") + 3);

// obj.f |= 1
__setKey(obj, "f", __getKey(obj, "f") | 1);

// ++obj.f
__setKey(obj, "f", __getKey(obj, "f") + 1);

// obj.e++;
__setKey(obj, "e", __getKey(obj, "e") + 1, __getKey(obj, "e"));

// delete obj.u;
__deleteKey(obj, "u");

// delete obj.r.m;
__deleteKey(__getKey(obj, "r"), "m");

// delete obj.r.m;
__deleteKey(__getKey(obj, "r"), "m");

// for (let k in obj) {}
for (let k in __iterableKey(obj)) {}

// for (let k in obj.x) {}
for (let k in __iterableKey(__getKey(obj, "x"))) {}

// if ("x" in obj) {}
if (__inKey(obj, "x")) {}

// if ("foo" in obj.x) {}
if (__inKey(__getKey(obj, "x"), "foo")) {}
