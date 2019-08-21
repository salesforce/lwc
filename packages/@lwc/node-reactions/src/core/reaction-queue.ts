/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ReactionRecord } from '../types';
import { forEach, ArrayPush } from '../shared/language';

export function queueReactionRecord(
    reactionQueue: Array<ReactionRecord>,
    reactionList: Array<ReactionRecord>
): void {
    ArrayPush.call(reactionQueue, ...reactionList);
}

export function flushQueue(reactionQueue: Array<ReactionRecord>) {
    forEach.call(reactionQueue, (entry: ReactionRecord) => {
        try {
            entry.callback.call(entry.element, entry.type);
        } catch (e) {
            // Dequeue the callbacks and rethrow
            reactionQueue.length = 0;
            throw e;
        }
    });
}
