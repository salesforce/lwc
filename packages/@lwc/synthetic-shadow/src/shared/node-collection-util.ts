/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined, isTrue, ArrayPush } from '@lwc/shared';
/**
 * Issue #1545 - Writing our own utils to handle NodeList and HTMLCollection. This is to not conflict with
 * some legacy third party libraries like prototype.js that patch Array.prototype.
 */

/**
 * Custom implementation of filter since using Array.prototype.filter conflicts with other
 * legacy libraries like prototype.js
 * Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter#Polyfill
 */
export function collectionFilter<T extends Node, K extends Element>(
    collection: NodeListOf<T> | HTMLCollectionOf<K>,
    fn: (value: T | K, index?: number, collection?: NodeListOf<T> | HTMLCollectionOf<K>) => boolean
): Array<T | K> {
    const res: Array<T | K> = [];
    const length = collection.length;
    for (let i = 0; i < length; i++) {
        const curr = collection[i];
        if (isTrue(fn(curr, i, collection))) {
            ArrayPush.call(res, curr);
        }
    }
    return res;
}

/**
 * Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find#Polyfill
 */
export function collectionFind<T extends Node>(
    collection: NodeListOf<T>,
    fn: (value: T, index?: number, nodelist?: NodeListOf<T>) => boolean
): T | undefined {
    const length = collection.length;
    for (let i = 0; i < length; i++) {
        const curr = collection[i];
        if (isTrue(fn(curr, i, collection))) {
            return curr;
        }
    }
    return undefined;
}

/**
 * Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice#Streamlining_cross-browser_behavior
 */
export function collectionSlice<T extends Node>(
    collection: NodeListOf<T>,
    begin?: number,
    end?: number
): Array<T> {
    end = !isUndefined(end) ? end : collection.length;
    const cloned: T[] = [];
    const len = collection.length;

    // Handle negative value for "begin"
    let start = !isUndefined(begin) ? begin : 0;
    start = start >= 0 ? start : Math.max(0, len + start);

    // Handle negative value for "end"
    let upTo = !isUndefined(end) ? Math.min(end, len) : len;
    if (end < 0) {
        upTo = len + end;
    }

    // Actual expected size of the slice
    const size = upTo - start;

    if (size > 0) {
        for (let i = 0; i < size; i++) {
            ArrayPush.call(cloned, collection[start + i]);
        }
    }
    return cloned;
}

/**
 * Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf#Polyfill
 */
export function collectionIndexOf<T extends Node>(
    collection: NodeListOf<T>,
    searchItem: T,
    fromIndex: number = 0
): number {
    const len = collection.length;
    let i = Math.min(fromIndex, len);
    if (i < 0) {
        i = Math.max(0, len + i);
    } else if (i >= len) {
        return -1;
    }

    for (; i !== len; ++i) {
        if (collection[i] === searchItem) {
            return i;
        }
    }
    return -1;
}
