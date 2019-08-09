/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import {
    appendChild,
    insertBefore,
    replaceChild,
    removeChild,
    isConnected,
    nodeTypeGetter,
    ELEMENT_NODE,
    DOCUMENT_FRAGMENT_NODE,
} from '../env/node';
import { defineProperties, ArrayPush } from '../shared/language';
import { ReactionEventType, ReactionEvent } from '../types';
import queueReactionsForSubtree, { queueReactionsForNodeList } from '../traverse';
import { flushQueue } from '../reaction-queue';
import { isQualifyingElement, marker } from '../registry';
import { querySelectorAll as documentFragmentQuerySelectorAll } from '../env/document-fragment';

export default function() {
    defineProperties(Node.prototype, {
        appendChild: {
            writable: true,
            enumerable: true,
            configurable: true,
            value: function(this: Node, aChild: Node) {
                // If subtree being appended does not have any qualifying nodes, exit fast
                if (!isQualifyingElement(aChild)) {
                    return appendChild.call(this, aChild);
                }
                const nodeType = nodeTypeGetter.call(aChild);
                switch (nodeType) {
                    case ELEMENT_NODE: {
                        const qualifiedReactionTypes: Array<ReactionEventType> = [];
                        // Pre action
                        if (isConnected.call(aChild)) {
                            ArrayPush.call(qualifiedReactionTypes, ReactionEventType.disconnected);
                        }
                        // Action
                        const result = appendChild.call(this, aChild);
                        // Post action
                        if (isConnected.call(this)) {
                            ArrayPush.call(qualifiedReactionTypes, ReactionEventType.connected);
                        }
                        if (qualifiedReactionTypes.length > 0) {
                            const reactionQueue: Array<ReactionEvent> = [];
                            queueReactionsForSubtree(
                                aChild as Element,
                                qualifiedReactionTypes,
                                reactionQueue
                            );
                            flushQueue(reactionQueue);
                        }
                        return result;
                    }
                    case DOCUMENT_FRAGMENT_NODE: {
                        const qualifiedReactionTypes: Array<ReactionEventType> = [];
                        // Pre action
                        if (isConnected.call(aChild)) {
                            ArrayPush.call(qualifiedReactionTypes, ReactionEventType.disconnected);
                        }
                        // Get the children before appending
                        const qualifyingChildren = documentFragmentQuerySelectorAll.call(
                            aChild,
                            `[${marker}]`
                        );
                        // Action
                        const result = appendChild.call(this, aChild);
                        // Post action
                        if (isConnected.call(this)) {
                            ArrayPush.call(qualifiedReactionTypes, ReactionEventType.connected);
                        }
                        if (qualifiedReactionTypes.length > 0) {
                            const reactionQueue: Array<ReactionEvent> = [];
                            queueReactionsForNodeList(
                                qualifyingChildren,
                                qualifiedReactionTypes,
                                reactionQueue
                            );
                            // Flush the queue only after the appendChild was successful
                            flushQueue(reactionQueue);
                        }
                        return result;
                    }
                    default:
                        return appendChild.call(this, aChild);
                }
            },
        },
        insertBefore: {
            writable: true,
            enumerable: true,
            configurable: true,
            value: function(this: Node, newNode: Node, referenceNode: Node) {
                // If subtree being inserted does not have any qualifying nodes, exit fast
                if (!isQualifyingElement(newNode)) {
                    return insertBefore.call(this, newNode, referenceNode);
                }
                const nodeType = nodeTypeGetter.call(newNode);
                switch (nodeType) {
                    case ELEMENT_NODE: {
                        const qualifiedReactionTypes: Array<ReactionEventType> = [];
                        // Pre action
                        if (isConnected.call(newNode)) {
                            ArrayPush.call(qualifiedReactionTypes, ReactionEventType.disconnected);
                        }
                        // Action
                        const result = insertBefore.call(this, newNode, referenceNode);
                        // Post action
                        if (isConnected.call(this)) {
                            ArrayPush.call(qualifiedReactionTypes, ReactionEventType.connected);
                        }
                        if (qualifiedReactionTypes.length > 0) {
                            const reactionQueue: Array<ReactionEvent> = [];
                            queueReactionsForSubtree(
                                newNode as Element,
                                qualifiedReactionTypes,
                                reactionQueue
                            );
                            flushQueue(reactionQueue);
                        }
                        return result;
                    }
                    case DOCUMENT_FRAGMENT_NODE: {
                        const qualifiedReactionTypes: Array<ReactionEventType> = [];
                        // Pre action
                        if (isConnected.call(newNode)) {
                            ArrayPush.call(qualifiedReactionTypes, ReactionEventType.disconnected);
                        }
                        const qualifyingChildren = documentFragmentQuerySelectorAll.call(
                            newNode,
                            `[${marker}]`
                        );
                        // Action
                        const result = insertBefore.call(this, newNode, referenceNode);
                        // Post action
                        if (isConnected.call(this)) {
                            // Short circuit and check if parent is connected
                            ArrayPush.call(qualifiedReactionTypes, ReactionEventType.connected);
                        }
                        if (qualifiedReactionTypes.length > 0) {
                            const reactionQueue: Array<ReactionEvent> = [];
                            queueReactionsForNodeList(
                                qualifyingChildren,
                                qualifiedReactionTypes,
                                reactionQueue
                            );
                            flushQueue(reactionQueue);
                        }
                        return result;
                    }
                    default:
                        return insertBefore.call(this, newNode, referenceNode);
                }
            },
        },
        replaceChild: {
            writable: true,
            enumerable: true,
            configurable: true,
            value: function(this: Node, newChild: Node, oldChild: Node) {
                const oldChildIsQualified = isQualifyingElement(oldChild);
                const newChildIsQualified = isQualifyingElement(newChild);
                // If old subtree being removed and new subtree being appended
                // do not have any qualifying nodes, exit fast
                if (!oldChildIsQualified && !newChildIsQualified) {
                    return replaceChild.call(this, newChild, oldChild);
                }

                const nodeType = nodeTypeGetter.call(newChild);
                switch (nodeType) {
                    case ELEMENT_NODE: {
                        const qualifiedPreReactionTypes: Array<ReactionEventType> = [];
                        // Pre action
                        if (oldChildIsQualified && isConnected.call(oldChild)) {
                            ArrayPush.call(
                                qualifiedPreReactionTypes,
                                ReactionEventType.disconnected
                            );
                        }
                        // Action
                        const result = replaceChild.call(this, newChild, oldChild);

                        const qualifiedPostReactionTypes: Array<ReactionEventType> = [];
                        // Post action
                        if (newChildIsQualified && isConnected.call(this)) {
                            ArrayPush.call(qualifiedPostReactionTypes, ReactionEventType.connected);
                        }
                        const reactionQueue: Array<ReactionEvent> = [];
                        if (qualifiedPreReactionTypes.length > 0) {
                            queueReactionsForSubtree(
                                oldChild as Element,
                                qualifiedPreReactionTypes,
                                reactionQueue
                            );
                        }
                        if (qualifiedPostReactionTypes.length > 0) {
                            queueReactionsForSubtree(
                                newChild as Element,
                                qualifiedPostReactionTypes,
                                reactionQueue
                            );
                        }
                        flushQueue(reactionQueue);
                        return result;
                    }
                    case DOCUMENT_FRAGMENT_NODE: {
                        const qualifiedPreReactionTypes: Array<ReactionEventType> = [];
                        // Pre action
                        if (oldChildIsQualified && isConnected.call(oldChild)) {
                            ArrayPush.call(
                                qualifiedPreReactionTypes,
                                ReactionEventType.disconnected
                            );
                        }
                        const qualifyingChildren = documentFragmentQuerySelectorAll.call(
                            newChild,
                            `[${marker}]`
                        );
                        // Action
                        const result = replaceChild.call(this, newChild, oldChild);

                        const qualifiedPostReactionTypes: Array<ReactionEventType> = [];
                        // Post action
                        if (newChildIsQualified && isConnected.call(this)) {
                            ArrayPush.call(qualifiedPostReactionTypes, ReactionEventType.connected);
                        }
                        const reactionQueue: Array<ReactionEvent> = [];
                        if (qualifiedPreReactionTypes.length > 0) {
                            queueReactionsForSubtree(
                                oldChild as Element,
                                qualifiedPreReactionTypes,
                                reactionQueue
                            );
                        }
                        if (qualifiedPostReactionTypes.length > 0) {
                            queueReactionsForNodeList(
                                qualifyingChildren,
                                qualifiedPostReactionTypes,
                                reactionQueue
                            );
                        }
                        flushQueue(reactionQueue);
                        return result;
                    }
                    default:
                        return replaceChild.call(this, newChild, oldChild);
                }
            },
        },
        removeChild: {
            writable: true,
            enumerable: true,
            configurable: true,
            value: function(this: Node, child: Node) {
                // If  child is not connected or subtree being removed does not have any qualifying nodes, exit fast
                if (!isConnected.call(child) || !isQualifyingElement(child)) {
                    return removeChild.call(this, child);
                }
                const qualifiedReactionTypes: Array<ReactionEventType> = [
                    ReactionEventType.disconnected,
                ];
                const result = removeChild.call(this, child);
                const reactionQueue: Array<ReactionEvent> = [];
                queueReactionsForSubtree(child as Element, qualifiedReactionTypes, reactionQueue);
                // Flush the queue only after the appendChild was successful
                flushQueue(reactionQueue);
                return result;
            },
        },
    });
}
