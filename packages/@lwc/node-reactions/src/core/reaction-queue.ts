/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ReactionEvent } from '../types';
import { forEach, ArrayPush } from '../shared/language';

export function queueCallback(
    reactionList: Array<ReactionEvent>,
    reactionQueue: Array<ReactionEvent>
): void {
    ArrayPush.call(reactionQueue, ...reactionList);
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
