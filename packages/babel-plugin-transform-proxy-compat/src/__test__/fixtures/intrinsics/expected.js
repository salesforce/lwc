import __ProxyCompat from 'proxy-compat';
var __getKey = __ProxyCompat.getKey;
var __callKey = __ProxyCompat.callKey;
//var push = Array.prototype.push;
var push = __getKey(Array.prototype, 'compatPush');

//Object.keys({});
Object.compatKeys({});

//Array.prototype.push.apply([], [a]);
__callKey(__getKey(Array.prototype, 'compatPush'), 'apply', [], [a]);

//Array['prototype'].push.apply([], [a]);
__callKey(Array['prototype'].push, 'apply', [], [a]);

//Array.prototype.join.call(arguments, ' ');
__callKey(__getKey(Array.prototype, 'join'), 'call', arguments, ' ');

//const children = Array.prototype.slice.call(list);
const children = __callKey(__getKey(Array.prototype, 'slice'), 'call', list);

(function () {
    // var Object = {};
    var String = {};

    //String.prototype.slice(1);
    __callKey(__getKey(String, 'prototype'), 'slice', 1);
})();

//String.prototype.slice(1);
__callKey(String.prototype, 'slice', 1);
