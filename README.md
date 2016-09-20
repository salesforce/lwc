# Mr. Frankenstein POC

## Getting Start

### Requirements

 * Node 6.x

### Installation

```bash
git clone https://git.soma.salesforce.com/cpatino/frankenstein.git
cd frank
npm install .
npm start
```

At this point, the app is running in watch mode, and it is accessible via http://localhost:8080/

## TODO

 * `framework/vdom.js` all dom operations, including node creation from all files should be concentrated in this file, and eventually batched in the next microtask as a performance optimization.
 * `$A.mountToDom()` operation should return a promise if the dom will be generated in the next turn. It should also clean up the container before inserting the new tree.
 * [x] `mountBody()` is the most important piece, and should be splitted into small methods. One of them should be `findBestMatch()` which should return the possible best match to replace an existing element from the list, with the new one. In the current implementation is does part of that, but the "last" element from `bar` example is being recreated because it is not preserving its index position anymore.
 * 2ways data binding is pending to be figured out.
 * just like string values are allowed in a list of elements, and transformed into `t()` during the flattening process, `null` values should be transformed into `f()` in the same method for symmetry.
 * [x] implement memoization `m()` in api.
 * implement the tricks to determine when an array or object was passed as attributes down, and do the corresponding getters to detect changes and re-render the component that owns the data structure. (the `watcher`).
 * activate decorators.
 * [x] connect `@attribute()` decorator with the validation of the attributes in `vnode-component`.
 * get all tagNames and attributes to be validated in `vnode-html` when in `DEVELOPMENT`.
 * finish an example of ADS, and finish the ADS service.
