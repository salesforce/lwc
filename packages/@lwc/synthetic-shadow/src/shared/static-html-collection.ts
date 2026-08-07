/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { create, defineProperty, forEach, setPrototypeOf } from '@lwc/shared';

import { getAttribute } from '../env/element';

const Items = new WeakMap<any, Element[]>();

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
        value(this: HTMLCollection, index: number) {
            if (!Items.has(this) && !lwcRuntimeFlags.ENABLE_LEGACY_ITEM_POLYFILL) {
                throw new TypeError('Cannot call "item" on object that is not an HTMLCollection.');
            }
            return this[index];
        },
    },
    length: {
        enumerable: true,
        configurable: true,
        get() {
            return Items.get(this)!.length;
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

            const items = Items.get(this)!;
            for (let i = 0, len = items.length; i < len; i++) {
                const item =
                    items[lwcRuntimeFlags.ENABLE_BROKEN_HTML_COLLECTION_NAMED_ITEM ? len : i];

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
    Items.set(collection, items);
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
