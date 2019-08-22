/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { defineProperties } from '../shared/language';
import { setQueue, Callback } from '../core/reactions2';

function domMethodWrapper(fn: (...args: any[]) => any, context: any, args: any[]): any {
    const newQueue: Callback[] = [];
    setQueue(newQueue);
    const result = fn.apply(context, args);
    setQueue(null);
    for (let i = 0, len = newQueue.length; i < len; i += 1) {
        const callback = newQueue[i];
        callback();
    }
    return result;
}

export default function() {
    // caching few DOM APIs
    const { removeChild, replaceChild, insertBefore, appendChild } = Node.prototype;

    defineProperties(Node.prototype, {
        appendChild: {
            writable: true,
            enumerable: true,
            configurable: true,
            value: function(this: Node, newChild: Node) {
                return domMethodWrapper(appendChild, this, [newChild]);
            },
        },
        insertBefore: {
            writable: true,
            enumerable: true,
            configurable: true,
            value: function(this: Node, newNode: Node, referenceNode: Node) {
                return domMethodWrapper(insertBefore, this, [newNode, referenceNode]);
            },
        },
        replaceChild: {
            writable: true,
            enumerable: true,
            configurable: true,
            value: function(this: Node, newChild: Node, oldChild: Node) {
                return domMethodWrapper(replaceChild, this, [newChild, oldChild]);
            },
        },
        removeChild: {
            writable: true,
            enumerable: true,
            configurable: true,
            value: function(this: Node, child: Node) {
                return domMethodWrapper(removeChild, this, [child]);
            },
        },
    });
}
