/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { ReactionEventType, ReactionEvent } from './types';
import { getRegisteredCallbacksForElement, marker } from './registry';
import { isUndefined, forEach, isNull } from './shared/language';
import assert from './shared/assert';
import { queueCallback } from './reaction-queue';

/**
 * Queue qualifying reaction callbacks for a single node.
 * If the node is a host element, this method will only queue callbacks for the host element.
 * It does not process the host's shadow tree.
 */
function queueReactionsForSingleElement(
    elm: Element,
    reactionTypes: Array<ReactionEventType>,
    reactionQueue: Array<ReactionEvent>
): void {
    const callbackListByType = getRegisteredCallbacksForElement(elm);
    if (!isUndefined(callbackListByType)) {
        forEach.call(reactionTypes, reactionType => {
            if (!isUndefined(callbackListByType[reactionType])) {
                queueCallback(reactionType, elm, callbackListByType[reactionType], reactionQueue);
            }
        });
    }
}

const ShadowRootQuerySelectorAll = ShadowRoot.prototype.querySelectorAll;
/**
 * Process nodes in a shadow tree
 */
function queueReactionsForShadowRoot(
    sr: ShadowRoot,
    reactionTypes: Array<ReactionEventType>,
    reactionQueue: Array<ReactionEvent>
): void {
    queueReactionsForNodeList(
        ShadowRootQuerySelectorAll.call(sr, `[${marker}]`),
        reactionTypes,
        reactionQueue
    );
}

/**
 * Process nodes in a NodeList
 */
export function queueReactionsForNodeList(
    nodeList: NodeList,
    reactionTypes: Array<ReactionEventType>,
    reactionQueue: Array<ReactionEvent>
): void {
    forEach.call(nodeList, node => {
        queueReactionsForSingleElement(node, reactionTypes, reactionQueue);
        // If node has a shadow tree, process its shadow tree
        if (!isNull((node as Element).shadowRoot)) {
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
export default function queueReactionsForSubtree(
    rootElm: Element | DocumentFragment,
    nodeList: NodeList,
    reactionTypes: Array<ReactionEventType>,
    reactionQueue: Array<ReactionEvent>
): void {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(!isUndefined(rootElm), `Expected a dom node but received undefined`);
    }

    // Process root node first
    queueReactionsForSingleElement(rootElm as any, reactionTypes, reactionQueue);

    // If root node has a shadow tree, process its shadow tree
    if ('shadowRoot' in rootElm && !isNull(rootElm.shadowRoot)) {
        queueReactionsForShadowRoot(rootElm.shadowRoot, reactionTypes, reactionQueue);
    }
    // Process all registered nodes in subtree in preorder
    queueReactionsForNodeList(nodeList, reactionTypes, reactionQueue);
}
