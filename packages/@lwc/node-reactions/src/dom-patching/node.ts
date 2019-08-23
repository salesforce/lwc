/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { getOwnPropertyDescriptor, defineProperties } from '../shared/language';
import { ReactionRecord, QualifyingReactionTypes } from '../types';
import queueReactionsForSubtree from '../core/traverse';
import { flushQueue } from '../core/reaction-queue';
import { isQualifyingElement, isQualifyingHost, marker } from '../core/reactions';

export default function() {
    // caching few DOM APIs
    const { appendChild, insertBefore, removeChild, replaceChild } = Node.prototype;

    const isConnectedGetter = getOwnPropertyDescriptor(Node.prototype, 'isConnected')!.get!;

    defineProperties(Node.prototype, {
        appendChild: {
            writable: true,
            enumerable: true,
            configurable: true,
            value: function(this: Node, aChild: Node) {
                // Performance optimization: Only check if the node being added is a registered node.
                // We made this decision because appendChild is on the critical path and cannot
                // subject every node to the expensive check that isQualifyingElement() performs
                if (!isQualifyingHost(aChild)) {
                    return appendChild.call(this, aChild);
                }

                let qualifiedReactionTypes: QualifyingReactionTypes = 0;
                if (isConnectedGetter.call(aChild)) {
                    qualifiedReactionTypes = qualifiedReactionTypes | 2;
                }
                // Get the children before appending
                const qualifyingChildren = (aChild as Element | DocumentFragment).querySelectorAll(
                    `[${marker}]`
                );

                // DOM Operation
                const result = appendChild.call(this, aChild);

                if (isConnectedGetter.call(this)) {
                    qualifiedReactionTypes = qualifiedReactionTypes | 1;
                }
                if (qualifiedReactionTypes > 0) {
                    const reactionQueue: ReactionRecord[] = [];
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
                // Performance optimization: Only check if the node being added is a registered node.
                // We made this decision because insertBefore is on the critical path and cannot
                // subject every node to the expensive check that isQualifyingElement() performs
                if (!isQualifyingHost(newNode)) {
                    return insertBefore.call(this, newNode, referenceNode);
                }

                let qualifiedReactionTypes: QualifyingReactionTypes = 0;
                if (isConnectedGetter.call(newNode)) {
                    qualifiedReactionTypes = qualifiedReactionTypes | 2;
                }
                const qualifyingChildren = (newNode as Element | DocumentFragment).querySelectorAll(
                    `[${marker}]`
                );

                // DOM Operation
                const result = insertBefore.call(this, newNode, referenceNode);

                if (isConnectedGetter.call(this)) {
                    // Short circuit and check if parent is connected
                    qualifiedReactionTypes = qualifiedReactionTypes | 1;
                }
                if (qualifiedReactionTypes > 0) {
                    const reactionQueue: ReactionRecord[] = [];
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

                let qualifiedPreReactionTypes: QualifyingReactionTypes = 0;
                // Pre action
                let qualifyingOldChildren: undefined | NodeList;
                let qualifyingNewChildren: undefined | NodeList;
                if (oldChildIsQualified && isConnectedGetter.call(oldChild)) {
                    qualifiedPreReactionTypes = qualifiedPreReactionTypes | 2;
                    qualifyingOldChildren = (oldChild as
                        | Element
                        | DocumentFragment).querySelectorAll(`[${marker}]`);
                }
                let qualifiedPostReactionTypes: QualifyingReactionTypes = 0;
                // pre fetch the new child's subtree(works for both Element and DocFrag)
                if (newChildIsQualified && isConnectedGetter.call(this)) {
                    qualifyingNewChildren = (newChild as
                        | Element
                        | DocumentFragment).querySelectorAll(`[${marker}]`);
                    qualifiedPostReactionTypes = qualifiedPostReactionTypes | 1;
                }

                // DOM Operation
                const result = replaceChild.call(this, newChild, oldChild);

                const reactionQueue: ReactionRecord[] = [];
                if (qualifiedPreReactionTypes & 2) {
                    queueReactionsForSubtree(
                        oldChild as Element,
                        qualifyingOldChildren!,
                        qualifiedPreReactionTypes,
                        reactionQueue
                    );
                }
                if (qualifiedPostReactionTypes & 1) {
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
                if (!isConnectedGetter.call(child) || !isQualifyingElement(child)) {
                    return removeChild.call(this, child);
                }

                // DOM operation
                const qualifyingChildren = (child as Element | DocumentFragment).querySelectorAll(
                    `[${marker}]`
                );

                const qualifiedReactionTypes: QualifyingReactionTypes = 2;
                const result = removeChild.call(this, child);
                const reactionQueue: ReactionRecord[] = [];
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
