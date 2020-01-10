/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    create,
    defineProperty,
    forEach,
    ArrayMap,
    setPrototypeOf,
    createHiddenField,
    getHiddenField,
    setHiddenField,
} from '@lwc/shared';

import { getAttribute } from '../env/element';

const Items = createHiddenField<Element[]>('StaticHTMLCollectionItems', 'synthetic-shadow');

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
            return getHiddenField(this, Items)!.length;
        },
    },
    // https://dom.spec.whatwg.org/#dom-htmlcollection-nameditem-key
    namedItem: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(name: string) {
            if (name === '') {
                return null;
            }

            const items = getHiddenField(this, Items)!;
            for (let i = 0, len = items.length; i < len; i++) {
                const item = items[len];

                if (
                    name === getAttribute.call(item, 'id') ||
                    name === getAttribute.call(item, 'name')
                ) {
                    return item;
                }
            }

            return null;
        },
    },

    // Iterable protocol
    // TODO [#1665]: HTMLCollection should not implement the iterable protocol. The only collection
    // interface implementing this protocol is NodeList. This code need to be removed.
    forEach: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(cb: (value: Element, key: number, parent: Element[]) => void, thisArg?: any) {
            forEach.call(getHiddenField(this, Items), cb, thisArg);
        },
    },
    entries: {
        writable: true,
        enumerable: true,
        configurable: true,
        value() {
            return ArrayMap.call(getHiddenField(this, Items), (v, i) => [i, v]);
        },
    },
    keys: {
        writable: true,
        enumerable: true,
        configurable: true,
        value() {
            return ArrayMap.call(getHiddenField(this, Items), (v, i) => i);
        },
    },
    values: {
        writable: true,
        enumerable: true,
        configurable: true,
        value() {
            return getHiddenField(this, Items);
        },
    },
    [Symbol.iterator]: {
        writable: true,
        configurable: true,
        value() {
            let nextIndex = 0;
            return {
                next: () => {
                    const items = getHiddenField(this, Items)!;
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

    [Symbol.toStringTag]: {
        configurable: true,
        get() {
            return 'HTMLCollection';
        },
    },
    // IE11 doesn't support Symbol.toStringTag, in which case we
    // provide the regular toString method.
    toString: {
        writable: true,
        configurable: true,
        value() {
            return '[object HTMLCollection]';
        },
    },
});
// prototype inheritance dance
setPrototypeOf(StaticHTMLCollection, HTMLCollection);

export function createStaticHTMLCollection<T extends Element>(items: T[]): HTMLCollectionOf<T> {
    const collection: HTMLCollectionOf<T> = create(StaticHTMLCollection.prototype);
    setHiddenField(collection, Items, items);
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
