import { ReactionEventType, ReactionEvent } from './types';
import { getRegisteredCallbacksForNode } from './registry';
import { isUndefined, forEach, isTrue } from './shared/language';
import { queueCallback } from './reaction-queue';
import { hasChildNodes, childNodesGetter } from './env/node';

/**
 * Traverse and queue reactions for nodes in a sub tree
 */
export default function queueReactionsForTree(
    root: Node,
    reactionTypes: Array<ReactionEventType>,
    reactionQueue: Array<ReactionEvent>
): void {
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

    if (root instanceof Element && !!root.shadowRoot) {
        // intentionally co-oercing to a truthy value because shadowRoot property can be undefined or null(HTMLUnknownElement)
        queueReactionsForTree(root.shadowRoot, reactionTypes, reactionQueue);
    }

    if (isTrue(hasChildNodes.call(root))) {
        forEach.call(childNodesGetter.call(root), child => {
            queueReactionsForTree(child, reactionTypes, reactionQueue);
        });
    }
}
