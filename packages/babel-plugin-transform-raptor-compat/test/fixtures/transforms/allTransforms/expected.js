import { inKey as _inKey } from "engine";
import { iteratorKey as _iteratorKey } from "engine";
import { deleteKey as _deleteKey } from "engine";
import { getKey as _getKey } from "engine";
import { setKey as _setKey } from "engine";
// var a = 1;
var a = 1;
var n = [0, 1];

// var b, c = 1;
var b,
    c = 1;

// var d = { e: 1 };
var obj = { x: {}, e: 1 };

// obj.f = 1;
_setKey(obj, "f", 1);

// console.log('x');
_getKey(console, "log")('x');

// obj.x.y = 1;
_setKey(_getKey(obj, "x"), "y", 1);

// obj["x"].y = 2;
_setKey(_getKey(obj, "x"), "y", 2);

// obj[2] = {};
_setKey(obj, 2, {});

// obj[2].y = 3;
_setKey(_getKey(obj, 2), "y", 3);

//obj[function (){}] = 1;
_setKey(obj, function () {}, 1);

// obj["y"] = function () {return { z: 2 }};
_setKey(obj, "y", function () {
    return { z: 2 };
});

// obj.y().z = 1;
_setKey(_getKey(obj, "y")(), "z", 1);

// var x = obj.r || (obj.r = { m: 5 });
var x = _getKey(obj, "r") || _setKey(obj, "r", { m: 5 });

// for (var i = obj.x.y; i < obj.f; i--) {}
for (var i = _getKey(_getKey(obj, "x"), "y"); i < _getKey(obj, "f"); i--) {}

// while (a = n.pop()) {}
while (a = _getKey(n, "pop")()) {}

// ++a;
++a;

// obj.r.m += 3;
_setKey(_getKey(obj, "r"), "m", _getKey(_getKey(obj, "r"), "m") + 3);

// obj.f |= 1
_setKey(obj, "f", _getKey(obj, "f") | 1);

// ++obj.f
_setKey(obj, "f", _getKey(obj, "f") + 1, _getKey(obj, "f"));

// obj.e++;
_setKey(obj, "e", _getKey(obj, "e") + 1);

// delete obj.u;
_deleteKey(obj, "u");

// delete obj.r.m;
_deleteKey(_getKey(obj, "r"), "m");

// delete obj.r.m;
_deleteKey(_getKey(obj, "r"), "m");

// for (let k in obj) {}
for (let k in _iteratorKey(obj)) {}

// for (let k in obj.x) {}
for (let k in _iteratorKey(_getKey(obj, "x"))) {}

// if ("x" in obj) {}
if (_inKey(obj, "x")) {}

// if ("foo" in obj.x) {}
if (_inKey(_getKey(obj, "x"), "foo")) {}
