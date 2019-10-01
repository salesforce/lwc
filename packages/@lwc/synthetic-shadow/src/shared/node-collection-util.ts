/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ArrayPush } from '@lwc/shared';
/**
 * Issue #1545 - Writing our own util to convert NodeList and HTMLCollection instances to array.
 * This is to not conflict with some legacy third party libraries like prototype.js
 * that patch Array.prototype and are incapable of handling NodeList and HTMLCollection.
 */
export function arrayFromCollection<T extends Node, K extends Element>(
    collection: NodeListOf<T> | HTMLCollectionOf<K>
): Array<T | K> {
    const cloned: T[] = [];
    const size = collection.length;
    if (size > 0) {
        for (let i = 0; i < size; i++) {
            ArrayPush.call(cloned, collection[i]);
        }
    }
    return cloned;
}
