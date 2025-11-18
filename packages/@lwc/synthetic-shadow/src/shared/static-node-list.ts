/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { create, defineProperty, setPrototypeOf } from '@lwc/shared';

const Items = new WeakMap<any, Node[]>();

function StaticNodeList() {
    throw new TypeError('Illegal constructor');
}

StaticNodeList.prototype = create(NodeList.prototype, {
    constructor: {
        writable: true,
        configurable: true,
        value: StaticNodeList,
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
            return Items.get(this)!.length;
        },
    },

    // Iterator protocol

    forEach: {
        writable: true,
        enumerable: true,
        configurable: true,
        value(cb: (value: Node, key: number, parent: Node[]) => void, thisArg?: any) {
            Items.get(this)!.forEach(cb, thisArg);
        },
    },
    entries: {
        writable: true,
        enumerable: true,
        configurable: true,
        value() {
            return Items.get(this)!.map((v, i) => [i, v]);
        },
    },
    keys: {
        writable: true,
        enumerable: true,
        configurable: true,
        value() {
            return Items.get(this)!.map((_v, i) => i);
        },
    },
    values: {
        writable: true,
        enumerable: true,
        configurable: true,
        value() {
            return Items.get(this);
        },
    },
    [Symbol.iterator]: {
        writable: true,
        configurable: true,
        value() {
            let nextIndex = 0;
            return {
                next: () => {
                    const items = Items.get(this)!;
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
            return 'NodeList';
        },
    },
    // IE11 doesn't support Symbol.toStringTag, in which case we
    // provide the regular toString method.
    toString: {
        writable: true,
        configurable: true,
        value() {
            return '[object NodeList]';
        },
    },
});
// prototype inheritance dance
setPrototypeOf(StaticNodeList, NodeList);

export function createStaticNodeList<T extends Node>(items: T[]): NodeListOf<T> {
    const nodeList: NodeListOf<T> = create(StaticNodeList.prototype);
    Items.set(nodeList, items);
    // setting static indexes
    items.forEach((item, index) => {
        defineProperty(nodeList, index, {
            value: item,
            enumerable: true,
            configurable: true,
        });
    });
    return nodeList;
}
