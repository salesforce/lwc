/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { ReactionEventType, ReactionEvent } from './types';
import { getRegisteredCallbacksForNode } from './registry';
import { isUndefined, forEach } from './shared/language';
import assert from './shared/assert';
import { queueCallback } from './reaction-queue';
import { childNodesGetter } from './env/node';

/**
 * Traverse and queue reactions for nodes in a sub tree
 */
export default function queueReactionsForTree(
    root: Node,
    reactionTypes: Array<ReactionEventType>,
    reactionQueue: Array<ReactionEvent>
): void {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(!isUndefined(root), `Expected a dom node but received undefined`);
    }
    // Pre order traversal
    const callbackListByType = getRegisteredCallbacksForNode(root);
    if (!isUndefined(callbackListByType)) {
        // Process all reactions for a node and then move on to subtree
        forEach.call(reactionTypes, reactionType => {
            if (!isUndefined(callbackListByType[reactionType])) {
                queueCallback(reactionType, root, callbackListByType[reactionType], reactionQueue);
            }
        });
    }

    // Perf optimization: Only Element type can have shadowRoot
    if ((root as Element).shadowRoot) {
        // intentionally co-oercing to a truthy value because shadowRoot property can be undefined or null(HTMLUnknownElement)
        queueReactionsForTree((root as Element).shadowRoot!, reactionTypes, reactionQueue);
    }

    const childNodeList = childNodesGetter.call(root);
    // Perf optimization: Element and Document Fragment are the only types that need to be processed
    if (childNodeList.length > 0) {
        forEach.call(childNodeList, child => {
            queueReactionsForTree(child, reactionTypes, reactionQueue);
        });
    }
}
