// @flow

import dismounter from "./dismounter.js";
import mounter from "./mounter.js";
import {
    isDuplex,
    EmptyNode,
} from "./utils.js";

export const IteratorItem = Symbol('Iterator Item Backpointer');

// the role of this method is to produce a flatten and indexed list of items
// (which are the source of every vnode) and the corresponding vnodes, considering
// that we can have nested iterators as part of the list of childrens of a one vnode
//  * we use level to produce unique ids for the flattened list.
//  * we use a map for the items, whos keys are the unique ids stored in the indexSet
//  * we use a map for the elements, and it matches the items' keys as well.
function flattenList(items: array, level: string, indexSet: Set, itemMap: Map, elementMap: Map) {
    const len = items.length;
    for (let i = 0; i < len; i += 1) {
        const item = items[i];
        const key = level + i;
        if (Array.isArray(item)) {
            flattenList(item, key + '>', indexSet, itemMap, elementMap);
        } else {
            indexSet.add(key);
            if (isDuplex(item)) {
                itemMap.set(key, item.key);
                elementMap.set(key, item.value);
            } else {
                itemMap.set(key, undefined);
                elementMap.set(key, item);
            }
        }
    }
}

function findBestMatch(oldElementMap: Map, oldElement: Object, item: Object): Object {
    if (oldElement && oldElement.vnode.item === item) {
        // our best chance to return quickly is based on both elements
        // preserving the original index.
        return oldElement;
    }
    for (let oldElement of oldElementMap.values()) {
        if (oldElement.vnode.item === item) {
            return oldElement;
        }
    }
    return null;
}

/*
TODO: This is problably the most important method of all, in theory, we will have:

1. A matrix like this, which represents the unique keys of the children list, plus
   the actual item used to generate the vnode, and the vnode list, e.g.:

```
[1, 2>1, 2>2, 3]
[ ,   k,   v,  ]
[a,   b,   c, d]
```

2. In succesive operations, a new matrix will change, and the only thing that will
   be preseved from one iteration to another is the value of the item used to generate
   a vnode, e.g.:

```
[1, 2>1, 3]
[ ,   v,  ]
[a,   c, d]
```
*/
function patchList(oldElementMap: Map, newItems: array<any>): array<any> {
    const indexSet = Set();
    const itemMap = Map();
    const elementMap = Map();
    const marker = Set(oldElementMap.values());
    flattenList(newItems, '', indexSet, itemMap, elementMap);
    for (var [index, newElement] of elementMap.entries()) {
        const item = itemMap.get(index);
        const oldElement = oldElementMap.get(index);
        if (oldElement !== newElement) {
            const reflectiveElement = findBestMatch(oldElementMap, oldElement, item);
            const patchedElement = patcher(reflectiveElement, newElement);
            elementMap.set(index, patchedElement);
            marker.delete(reflectiveElement);
        } else {
            marker.delete(oldElement);
        }
    }
    // dismounting the rest
    for (let elementToBeDismounted of marker) {
        dismounter(elementToBeDismounted);
    }
    return elementMap;
}

function rehydrate(element: Object, newAttrs: Object, newChildren: array): Object {
    const { attrs, children, vnode } = element;
    let isDirty = false;
    if (children !== newChildren) {
        element.children = patchList(element.children, newChildren);
        vnode.set('children', element.children.values());
        isDirty = true;
    }
    if (attrs !== newAttrs) {
        // infuse new attrs into element.vnode
        for (let [attrName, attrValue] of Object.entries(newAttrs)) {
            if (attrs[attrName] !== attrValue) {
                vnode.set(attrName, attrValue);
                isDirty = true;
            }
        }
    }
    if (isDirty) {
        vnode.toBeHydrated();
    }
    return element;
}

export default function patcher(oldElement: any, newElement: any): Object {
    if (oldElement === newElement) {
        return oldElement;
    }
    if (newElement === EmptyNode || typeof newElement === 'string') {
        dismounter(oldElement);
        return newElement;
    }
    // assert: newElement and oldElement are objects and they both have Ctor-s
    const { attrs, children } = newElement;
    if (oldElement && oldElement.Ctor === newElement.Ctor) {
        return rehydrate(oldElement.vnode, attrs, children);
    } else {
        if (oldElement && oldElement !== EmptyNode) {
            dismounter(oldElement);
        }
        mounter(newElement);
        return newElement;
    }
}
