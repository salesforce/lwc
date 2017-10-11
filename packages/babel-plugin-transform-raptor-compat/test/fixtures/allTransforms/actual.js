// var a = 1;
var a = 1;
var n = [0, 1];

// var b, c = 1;
var b, c = 1;

// var d = { e: 1 };
var obj = { x: {}, e: 1, foo: { bar: (...args) => args } };

// obj.f = 1;
obj.f = 1;

// console.log("x");
console.log("x");

// console.log("x", "foo");
console.log("x", "foo");

// obj.foo.bar(1, 2, 3)
obj.foo.bar(1, 2, 3);

// obj.x.y = 1;
obj.x.y = 1;

// obj["x"].y = 2;
obj["x"].y = 2;

// obj[b] = 1;
obj[b] = 1;

// obj[2] = {};
obj[2] = {};

// obj[2].y = 3;
obj[2].y = 3;

//obj[function (){}] = 1;
obj[function () {}] = 1;

// obj["y"] = function () {return { z: 2 }};
obj["y"] = function () {
    return { z: 2 };
};

// obj.y().z = 1;
obj.y().z = 1;

// var x = obj.r || (obj.r = { m: 5 });
var x = obj.r || (obj.r = { m: 5 });

// for (var i = obj.x.y; i < obj.f; i--) {}
for (var i = obj.x.y; i < obj.f; i--) {}

// while (a = n.pop()) {}
while( a = n.pop()) {}

// ++a;
++a;

// obj.r.m += 3;
obj.r.m += 3;

// obj.f |= 1
obj.f |= 1

// ++obj.f
++obj.f

// obj.e++;
obj.e++;

// delete obj.u;
delete obj.u;

// delete obj.r.m;
delete obj.r.m;

// delete obj.r.m;
delete obj["r"].m;

// for (let k in obj) {}
for (let k in obj) {}

// for (let k in obj.x) {}
for (let k in obj.x) {}

// if ("x" in obj) {}
if ("x" in obj) {}

// if ("foo" in obj.x) {}
if ("foo" in obj.x) {}

// foo instanceof Bar
foo instanceof Bar