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
import { nodeTypeGetter, ELEMENT_NODE } from './env/node';
import { querySelectorAll as elementQuerySelectorAll } from './env/element';
import { querySelectorAll as docFragQuerySelectorAll } from './env/document-fragment';

/**
 * Queue qualifying reaction callbacks for a single node.
 * If the node is a host element, this method will only queue callbacks for the host element.
 * It does not process the host's shadow tree.
 */
function queueReactionsForSingleNode(
    node: Node,
    reactionTypes: Array<ReactionEventType>,
    reactionQueue: Array<ReactionEvent>
): void {
    const callbackListByType = getRegisteredCallbacksForNode(node);
    if (!isUndefined(callbackListByType)) {
        forEach.call(reactionTypes, reactionType => {
            if (!isUndefined(callbackListByType[reactionType])) {
                queueCallback(reactionType, node, callbackListByType[reactionType], reactionQueue);
            }
        });
    }
}

/**
 * Process nodes in a shadow tree
 */
function queueReactionsForShadowRoot(
    sr: ShadowRoot,
    reactionTypes: Array<ReactionEventType>,
    reactionQueue: Array<ReactionEvent>
): void {
    queueReactionsForSingleNode(sr, reactionTypes, reactionQueue);
    queueReactionsForNodeList(docFragQuerySelectorAll.call(sr, '*'), reactionTypes, reactionQueue);
}

/**
 * Process nodes in a NodeList
 */
function queueReactionsForNodeList(
    nodeList: NodeList,
    reactionTypes: Array<ReactionEventType>,
    reactionQueue: Array<ReactionEvent>
): void {
    forEach.call(nodeList, node => {
        queueReactionsForSingleNode(node, reactionTypes, reactionQueue);
        const rootNodeType = nodeTypeGetter.call(node);
        // If node is a custom element
        if (rootNodeType === ELEMENT_NODE && (node as Element).shadowRoot) {
            queueReactionsForShadowRoot(
                (node as Element).shadowRoot!,
                reactionTypes,
                reactionQueue
            );
        }
    });
}

/**
 * Traverse and queue reactions for a sub tree
 */
export default function queueReactionsForTree(
    root: Node,
    reactionTypes: Array<ReactionEventType>,
    reactionQueue: Array<ReactionEvent>
): void {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(!isUndefined(root), `Expected a dom node but received undefined`);
    }
    // Process root node first
    queueReactionsForSingleNode(root, reactionTypes, reactionQueue);

    const rootNodeType = nodeTypeGetter.call(root);
    if (rootNodeType === ELEMENT_NODE) {
        // If root node is a custom element, process its shadow tree
        // intentionally co-oercing to a truthy value because shadowRoot property can be undefined or null(HTMLUnknownElement)
        if ((root as Element).shadowRoot) {
            queueReactionsForShadowRoot(
                (root as Element).shadowRoot!,
                reactionTypes,
                reactionQueue
            );
        }
        // Process all nodes in subtree in preorder
        queueReactionsForNodeList(
            elementQuerySelectorAll.call(root, '*'),
            reactionTypes,
            reactionQueue
        );
    }
}
