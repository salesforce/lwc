/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assert, isUndefined } from '@lwc/shared';
import { ReactionRecord, QualifyingReactionTypes } from '../types';
import {
    getConnectedRecordsForElement,
    getDisconnectedRecordsForElement,
    marker,
} from './reactions';
import { queueReactionRecord } from './reaction-queue';

/**
 * Queue qualifying reaction callbacks for a single node.
 * If the node is a host element, this method will only queue callbacks for the host element.
 * It does not process the host's shadow tree.
 */
function queueReactionsForSingleElement(
    elm: Element,
    reactionTypes: QualifyingReactionTypes,
    reactionQueue: ReactionRecord[]
) {
    // Disconnected callback has to be processed before connected callback
    if (reactionTypes & 2) {
        const reactionRecords = getDisconnectedRecordsForElement(elm);
        if (!isUndefined(reactionRecords)) {
            queueReactionRecord(reactionQueue, reactionRecords);
        }
    }
    if (reactionTypes & 1) {
        const reactionRecords = getConnectedRecordsForElement(elm);
        if (!isUndefined(reactionRecords)) {
            queueReactionRecord(reactionQueue, reactionRecords);
        }
    }
}

/**
 * Process nodes in a shadow tree
 */
function queueReactionsForShadowRoot(
    sr: ShadowRoot,
    reactionTypes: QualifyingReactionTypes,
    reactionQueue: ReactionRecord[]
) {
    queueReactionsForNodeList(sr.querySelectorAll(`[${marker}]`), reactionTypes, reactionQueue);
}

/**
 * Process nodes in a NodeList of marked elements
 */
function queueReactionsForNodeList(
    nodeList: NodeListOf<Element>,
    reactionTypes: QualifyingReactionTypes,
    reactionQueue: ReactionRecord[]
) {
    const length = nodeList.length;
    for (let i = 0; i < length; i++) {
        const element = nodeList[i];
        queueReactionsForSingleElement(element, reactionTypes, reactionQueue);
        // If node has a shadow tree, process its shadow tree
        queueReactionsForShadowRoot(element.shadowRoot!, reactionTypes, reactionQueue);
    }
}

/**
 * Traverse and queue reactions for a sub tree
 */
export default function queueReactionsForSubtree(
    rootElm: Element | DocumentFragment,
    nodeList: NodeListOf<Element>,
    reactionTypes: QualifyingReactionTypes,
    reactionQueue: ReactionRecord[]
) {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(!isUndefined(rootElm), `Expected a dom node but received undefined`);
    }

    // Process root node first
    queueReactionsForSingleElement(rootElm as any, reactionTypes, reactionQueue);

    // If root node has a shadow tree, process its shadow tree
    const sr = (rootElm as any).shadowRoot;
    if (sr != null) {
        // coerce to null, shadowRoot of docFrag will be undefined
        queueReactionsForShadowRoot(sr, reactionTypes, reactionQueue);
    }
    // Process all registered nodes in subtree in pre-order
    queueReactionsForNodeList(nodeList, reactionTypes, reactionQueue);
}
