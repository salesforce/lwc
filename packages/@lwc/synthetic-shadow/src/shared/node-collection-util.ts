/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ArrayConstructor } from '@lwc/shared';
/**
 * Issue #1545 - Writing a custom util to convert NodeList and HTMLCollection instances to array.
 * This is to aviod conflict with some legacy third party libraries like prototype.js
 * that patch Array.prototype and are incapable of handling NodeList and HTMLCollection.
 */
export function arrayFromCollection<T extends Node, K extends Element>(
    collection: NodeListOf<T> | HTMLCollectionOf<K>
): Array<T | K> {
    const size = collection.length;
    const cloned: T[] | K[] = new ArrayConstructor(size);
    if (size > 0) {
        for (let i = 0; i < size; i++) {
            cloned[i] = collection[i];
        }
    }
    return cloned;
}
