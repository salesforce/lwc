/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { forEach, ArrayPush } from '@lwc/shared';
import { ReactionRecord } from '../types';

export function queueReactionRecord(
    reactionQueue: ReactionRecord[],
    reactionList: ReactionRecord[]
) {
    ArrayPush.apply(reactionQueue, reactionList);
}

export function flushQueue(reactionQueue: ReactionRecord[]) {
    forEach.call(reactionQueue, (entry: ReactionRecord) =>
        entry.callback.call(entry.element, entry.type)
    );
}
