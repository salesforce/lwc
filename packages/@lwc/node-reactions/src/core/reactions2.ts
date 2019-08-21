/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ReactionCallback } from '../types';
import { ArrayPush } from '../shared/language';

export type Callback = () => void;

const { addEventListener } = Element.prototype;

let queue: Callback[] = [];

export function reactWhenConnected(element: Element, callback: ReactionCallback): void {
    addEventListener.call(element, 'DOMNodeInsertedIntoDocument', () =>
        callback.call(element, 'connected')
    );
}

export function reactWhenDisconnected(element: Element, callback: ReactionCallback): void {
    addEventListener.call(element, 'DOMNodeRemovedFromDocument', () =>
        ArrayPush.call(queue, () => callback.call(element, 'disconnected'))
    );
}

export function setQueue(q: Callback[]) {
    queue = q;
}

export function getQueue(): Callback[] {
    return queue;
}
