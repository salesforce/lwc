/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { appendChild, insertBefore, replaceChild, removeChild, isConnected } from '../env/node';
import { defineProperties, ArrayPush } from '../shared/language';
import { ReactionEventType, ReactionEvent } from '../types';
import queueReactionsForSubtree from '../traverse';
import { flushQueue } from '../reaction-queue';
import { isQualifyingElement, marker } from '../registry';

export default function() {
    defineProperties(Node.prototype, {
        appendChild: {
            writable: true,
            enumerable: true,
            configurable: true,
            value: function(this: Node, aChild: Node) {
                // perform operation and exit early
                if (!isQualifyingElement(aChild)) {
                    return appendChild.call(this, aChild);
                }

                const qualifiedReactionTypes: Array<ReactionEventType> = [];
                if (isConnected.call(aChild)) {
                    ArrayPush.call(qualifiedReactionTypes, ReactionEventType.disconnected);
                }
                // Get the children before appending
                const qualifyingChildren = (aChild as Element | DocumentFragment).querySelectorAll(
                    `[${marker}]`
                );

                // DOM Operation
                const result = appendChild.call(this, aChild);

                if (isConnected.call(this)) {
                    ArrayPush.call(qualifiedReactionTypes, ReactionEventType.connected);
                }
                if (qualifiedReactionTypes.length > 0) {
                    const reactionQueue: Array<ReactionEvent> = [];
                    queueReactionsForSubtree(
                        aChild as Element | DocumentFragment,
                        qualifyingChildren,
                        qualifiedReactionTypes,
                        reactionQueue
                    );
                    flushQueue(reactionQueue);
                }
                return result;
            },
        },
        insertBefore: {
            writable: true,
            enumerable: true,
            configurable: true,
            value: function(this: Node, newNode: Node, referenceNode: Node) {
                // perform operation, exit early
                if (!isQualifyingElement(newNode)) {
                    return insertBefore.call(this, newNode, referenceNode);
                }

                const qualifiedReactionTypes: Array<ReactionEventType> = [];
                if (isConnected.call(newNode)) {
                    ArrayPush.call(qualifiedReactionTypes, ReactionEventType.disconnected);
                }
                const qualifyingChildren = (newNode as Element | DocumentFragment).querySelectorAll(
                    `[${marker}]`
                );

                // DOM Operation
                const result = insertBefore.call(this, newNode, referenceNode);

                if (isConnected.call(this)) {
                    // Short circuit and check if parent is connected
                    ArrayPush.call(qualifiedReactionTypes, ReactionEventType.connected);
                }
                if (qualifiedReactionTypes.length > 0) {
                    const reactionQueue: Array<ReactionEvent> = [];
                    queueReactionsForSubtree(
                        newNode as Element | DocumentFragment,
                        qualifyingChildren,
                        qualifiedReactionTypes,
                        reactionQueue
                    );
                    flushQueue(reactionQueue);
                }
                return result;
            },
        },
        replaceChild: {
            writable: true,
            enumerable: true,
            configurable: true,
            value: function(this: Node, newChild: Node, oldChild: Node) {
                const oldChildIsQualified = isQualifyingElement(oldChild);
                const newChildIsQualified = isQualifyingElement(newChild);
                // If oldChild and newChild are not an Element(/DocumentFragment) or do not have children, exit early
                if (!oldChildIsQualified && !newChildIsQualified) {
                    return replaceChild.call(this, newChild, oldChild);
                }

                const qualifiedPreReactionTypes: Array<ReactionEventType> = [];
                // Pre action
                let qualifyingOldChildren: undefined | NodeList;
                let qualifyingNewChildren: undefined | NodeList;
                if (oldChildIsQualified && isConnected.call(oldChild)) {
                    ArrayPush.call(qualifiedPreReactionTypes, ReactionEventType.disconnected);
                    qualifyingOldChildren = (oldChild as
                        | Element
                        | DocumentFragment).querySelectorAll(`[${marker}]`);
                }
                const qualifiedPostReactionTypes: Array<ReactionEventType> = [];
                // pre fetch the new child's subtree(works for both Element and DocFrag)
                if (newChildIsQualified && isConnected.call(this)) {
                    qualifyingNewChildren = (newChild as
                        | Element
                        | DocumentFragment).querySelectorAll(`[${marker}]`);
                    ArrayPush.call(qualifiedPostReactionTypes, ReactionEventType.connected);
                }

                // DOM Operation
                const result = replaceChild.call(this, newChild, oldChild);

                const reactionQueue: Array<ReactionEvent> = [];
                if (qualifiedPreReactionTypes.length > 0) {
                    queueReactionsForSubtree(
                        oldChild as Element,
                        qualifyingOldChildren!,
                        qualifiedPreReactionTypes,
                        reactionQueue
                    );
                }
                if (qualifiedPostReactionTypes.length > 0) {
                    queueReactionsForSubtree(
                        newChild as Element | DocumentFragment,
                        qualifyingNewChildren!,
                        qualifiedPostReactionTypes,
                        reactionQueue
                    );
                }
                flushQueue(reactionQueue);
                return result;
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

                // DOM operation
                const qualifyingChildren = (child as Element | DocumentFragment).querySelectorAll(
                    `[${marker}]`
                );

                const qualifiedReactionTypes: Array<ReactionEventType> = [
                    ReactionEventType.disconnected,
                ];
                const result = removeChild.call(this, child);
                const reactionQueue: Array<ReactionEvent> = [];
                queueReactionsForSubtree(
                    child as Element | DocumentFragment,
                    qualifyingChildren,
                    qualifiedReactionTypes,
                    reactionQueue
                );
                flushQueue(reactionQueue);
                return result;
            },
        },
    });
}
