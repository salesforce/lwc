/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { getOwnPropertyDescriptor, defineProperties, ArrayIndexOf } from '../shared/language';
import { setQueue, getQueue, Callback } from '../core/reactions2';

export default function() {
    // caching few DOM APIs
    const { removeChild, replaceChild, insertBefore } = Node.prototype;

    const isConnectedGetter = getOwnPropertyDescriptor(Node.prototype, 'isConnected')!.get!;

    defineProperties(Node.prototype, {
        replaceChild: {
            writable: true,
            enumerable: true,
            configurable: true,
            value: function(this: Node, newChild: Node, oldChild: Node) {
                if (isConnectedGetter.call(oldChild)) {
                    const { childNodes } = this;
                    const indx = ArrayIndexOf.call(childNodes, oldChild);
                    const refChild = childNodes[indx + 1] || null;
                    const oldQueue = getQueue();
                    const newQueue: Callback[] = [];
                    setQueue(newQueue);
                    removeChild.call(this, oldChild);
                    setQueue(oldQueue);
                    for (let i = 0, len = newQueue.length; i < len; i += 1) {
                        const callback = newQueue[i];
                        callback();
                    }
                    insertBefore.call(this, newChild, refChild);
                    return oldChild;
                } else {
                    return replaceChild.call(this, newChild, oldChild);
                }
            },
        },
        removeChild: {
            writable: true,
            enumerable: true,
            configurable: true,
            value: function(this: Node, child: Node) {
                const oldQueue = getQueue();
                const newQueue: Callback[] = [];
                setQueue(newQueue);
                const result = removeChild.call(this, child);
                setQueue(oldQueue);
                for (let i = 0, len = newQueue.length; i < len; i += 1) {
                    const callback = newQueue[i];
                    callback();
                }
                return result;
            },
        },
    });
}
