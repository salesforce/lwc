/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ReactionEventType, ReactionCallback, ReactionEvent } from './types';
import { forEach, ArraySlice, ArrayPush } from './shared/language';

export function queueCallback(
    type: ReactionEventType,
    node: Node,
    callbackList: Array<ReactionCallback>,
    reactionQueue: Array<ReactionEvent>
): Array<ReactionEvent> {
    if (callbackList.length === 1) {
        ArrayPush.call(reactionQueue, { type, node, callback: callbackList[0] });
        return reactionQueue; // Optimization to avoid the foreach
    }
    forEach.call(callbackList, callback => {
        ArrayPush.call(reactionQueue, { type, node, callback: callback });
    });
    return reactionQueue;
}

export function flushQueue(reactionQueue: Array<ReactionEvent>) {
    forEach.call(reactionQueue, (entry: ReactionEvent, index: number) => {
        try {
            entry.callback.call(entry.node, entry.type);
        } catch (e) {
            // Dequeue the callbacks and rethrow
            reactionQueue.length = 0;
            throw e;
        }
        ArraySlice.call(reactionQueue, index, 1);
    });
}
