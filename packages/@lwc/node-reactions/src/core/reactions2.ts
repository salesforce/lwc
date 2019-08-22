/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ReactionCallback } from '../types';
import { ArrayPush, isNull } from '../shared/language';

export type Callback = () => void;

const { addEventListener } = Element.prototype;

let queue: Callback[] | null = [];

export function reactWhenConnected(element: Element, callback: ReactionCallback): void {
    addEventListener.call(element, 'DOMNodeInsertedIntoDocument', () => {
        if (isNull(queue)) {
            throw new Error('Uncontrolled DOMNodeInsertedIntoDocument');
        }
        ArrayPush.call(queue, () => callback.call(element, 'connected'));
    });
}

export function reactWhenDisconnected(element: Element, callback: ReactionCallback): void {
    addEventListener.call(element, 'DOMNodeRemovedFromDocument', () => {
        if (isNull(queue)) {
            throw new Error('Uncontrolled DOMNodeRemovedFromDocument');
        }
        ArrayPush.call(queue, () => callback.call(element, 'disconnected'));
    });
}

export function setQueue(q: Callback[] | null) {
    queue = q;
}

export function getQueue(): Callback[] | null {
    return queue;
}
