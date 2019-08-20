/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ReactionEventType, ReactionCallback, ReactionEvent } from '../types';
import { forEach, ArrayPush } from '../shared/language';

export function queueCallback(
    type: ReactionEventType,
    elm: Element,
    callbackList: Array<ReactionCallback>,
    reactionQueue: Array<ReactionEvent>
): Array<ReactionEvent> {
    if (callbackList.length === 1) {
        ArrayPush.call(reactionQueue, { type, node: elm, callback: callbackList[0] });
        return reactionQueue; // Optimization to avoid the foreach
    }
    forEach.call(callbackList, callback => {
        ArrayPush.call(reactionQueue, { type, node: elm, callback: callback });
    });
    return reactionQueue;
}

export function flushQueue(reactionQueue: Array<ReactionEvent>) {
    forEach.call(reactionQueue, (entry: ReactionEvent) => {
        try {
            entry.callback.call(entry.node, entry.type);
        } catch (e) {
            // Dequeue the callbacks and rethrow
            reactionQueue.length = 0;
            throw e;
        }
    });
}
