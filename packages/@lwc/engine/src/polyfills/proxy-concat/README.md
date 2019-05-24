# Proxy-concat polyfill

This polyfill is needed for Safari to properly handle `Array.prototype.concat` on proxified array.
Webkit issue: https://bugs.webkit.org/show_bug.cgi?id=184267

```js
// Repro
const proxy = new Proxy([3, 4], {});
const res = [1, 2].concat(proxy);

console.log(res[0]);
console.log(res[1]);
console.log(res[2]);
console.log(res[3]);

// Expected ouptut
1
2
3
4

// Safari output
1
2
Proxy {0: 3, 1: 4}
undefined
```

> TODO: #XXX - Remove this polyfill once https://bugs.webkit.org/show_bug.cgi?id=184267 is fixed
