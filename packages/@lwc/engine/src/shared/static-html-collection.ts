/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { defineProperty, forEach, ArrayMap, create, setPrototypeOf } from "./language";
import { createFieldName, getInternalField } from "./fields";

const Items = createFieldName('items');

function isValidHTMLCollectionName(name) {
    return name !== 'length' && isNaN(name);
}

function getNodeHTMLCollectionName(node) {
    return node.getAttribute('id') || node.getAttribute('name');
}

function StaticHTMLCollection() {
    throw new TypeError('Illegal constructor');
}
StaticHTMLCollection.prototype = create(HTMLCollection.prototype, {
    constructor: {
        writable: true,
        configurable: true,
        value: StaticHTMLCollection,
    },
    item: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(index: number) {
            return this[index];
        },
    },
    length: {
        enumerable: true,
        configurable: true,
        get() {
            return getInternalField(this, Items).length;
        },
    },
    // https://dom.spec.whatwg.org/#dom-htmlcollection-nameditem-key
    namedItem: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(name: string) {
            if (isValidHTMLCollectionName(name) && this[name]) {
                return this[name];
            }
            const items = getInternalField(this, Items);
            // Note: loop in reverse so that the first named item matches the named property
            for (let len = items.length - 1; len >= 0; len -= 1) {
                const item = items[len];
                const nodeName = getNodeHTMLCollectionName(item);
                if (nodeName === name) {
                    return item;
                }
            }
            return null;
        },
    },

    // Iterator protocol

    forEach: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(cb, thisArg) {
            forEach.call(getInternalField(this, Items), cb, thisArg);
        },
    },
    entries: {
        writable: true,
        enumerable: true,
        configurable: true,
        value() {
            return ArrayMap.call(getInternalField(this, Items), (v: any, i: number) => [i, v]);
        },
    },
    keys: {
        writable: true,
        enumerable: true,
        configurable: true,
        value() {
            return ArrayMap.call(getInternalField(this, Items), (v: any, i: number) => i);
        },
    },
    values: {
        writable: true,
        enumerable: true,
        configurable: true,
        value() {
            return getInternalField(this, Items);
        },
    },
    [Symbol.iterator]: {
        writable: true,
        configurable: true,
        value() {
            let nextIndex = 0;
            return {
                next: () => {
                    const items = getInternalField(this, Items);
                    return nextIndex < items.length
                        ? {
                              value: items[nextIndex++],
                              done: false,
                          }
                        : {
                              done: true,
                          };
                },
            };
        },
    },
});
// prototype inheritance dance
setPrototypeOf(StaticHTMLCollection, HTMLCollection);

export function createStaticHTMLCollection<T extends Element>(items: T[]): HTMLCollectionOf<T> {
    const collection: HTMLCollectionOf<T> = create(StaticHTMLCollection.prototype, {
        [Items]: {
            value: items,
        }
    });
    // setting static indexes
    forEach.call(items, (item: T, index: number) => {
        defineProperty(collection, index, {
            value: item,
            enumerable: true,
            configurable: true,
        });
    });
    return collection;
}
