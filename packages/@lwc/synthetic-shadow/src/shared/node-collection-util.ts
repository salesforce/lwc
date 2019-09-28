/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined, isTrue } from './language';
/**
 * Writing our own utils to handle NodeList and HTMLCollection. This is to not conflict with
 * some legacy third party libraries like prototype.js that patch Array.prototype.
 */

/**
 * Custom implementation of filter since using Array.prototype.filter conflicts with other
 * legacy libraries like prototype.js
 * Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter#Polyfill
 */
export function collectionFilter<T extends Node, K extends Element>(
    this: NodeListOf<T> | HTMLCollectionOf<K>,
    fn: (value: T | K, index?: number, collection?: NodeListOf<T> | HTMLCollectionOf<K>) => boolean,
    thisArg?: any
): Array<T | K> {
    const res: Array<T | K> = [];
    const length = this.length;
    for (let i = 0; i < length; i++) {
        const curr = this[i];
        if (isTrue(fn.call(thisArg, curr, i, this))) {
            res.push(curr);
        }
    }
    return res;
}

/**
 * Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find#Polyfill
 */
export function collectionFind<T extends Node>(
    this: NodeListOf<T>,
    fn: (value: T, index?: number, nodelist?: NodeListOf<T>) => boolean,
    thisArg?: any
): T | undefined {
    const length = this.length;
    for (let i = 0; i < length; i++) {
        const curr = this[i];
        if (isTrue(fn.call(thisArg, curr, i, this))) {
            return curr;
        }
    }
    return undefined;
}

/**
 * Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice#Streamlining_cross-browser_behavior
 */
export function collectionSlice<T extends Node>(
    this: NodeListOf<T>,
    begin?: number,
    end?: number
): Array<T> {
    end = !isUndefined(end) ? end : this.length;
    const cloned: T[] = [];
    const len = this.length;

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
            cloned.push(this[start + i]);
        }
    }
    return cloned;
}

/**
 * Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf#Polyfill
 */
export function collectionIndexOf<T extends Node>(
    this: NodeListOf<T>,
    searchItem: T,
    fromIndex: number = 0
): number {
    const len = this.length;
    let i = Math.min(fromIndex, len);
    if (i < 0) {
        i = Math.max(0, len + i);
    } else if (i >= len) {
        return -1;
    }

    for (; i !== len; ++i) {
        if (this[i] === searchItem) {
            return i;
        }
    }
    return -1;
}
