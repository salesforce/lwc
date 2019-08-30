/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { getOwnPropertyDescriptor, defineProperties, ArraySlice } from '../shared/language';
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
                const args: any = ArraySlice.call(arguments);
                // Performance optimization: Only check if the node being added is a registered node.
                // We made this decision because appendChild is on the critical path and cannot
                // subject every node to the expensive check that isQualifyingElement() performs
                if (!isQualifyingHost(aChild)) {
                    // invoke with apply to preserve native behavior of missing arguments, invalid types etc
                    return appendChild.apply(this, args);
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
                const result = appendChild.apply(this, args);

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
            value: function(this: Node, newNode: Node, _referenceNode: Node) {
                const args: any = ArraySlice.call(arguments);
                // Performance optimization: Only check if the node being added is a registered node.
                // We made this decision because insertBefore is on the critical path and cannot
                // subject every node to the expensive check that isQualifyingElement() performs
                if (!isQualifyingHost(newNode)) {
                    return insertBefore.apply(this, args);
                }

                let qualifiedReactionTypes: QualifyingReactionTypes = 0;
                if (isConnectedGetter.call(newNode)) {
                    qualifiedReactionTypes = qualifiedReactionTypes | 2;
                }
                const qualifyingChildren = (newNode as Element | DocumentFragment).querySelectorAll(
                    `[${marker}]`
                );

                // DOM Operation
                const result = insertBefore.apply(this, args);

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
                const args: any = ArraySlice.call(arguments);
                const oldChildIsQualified = isQualifyingElement(oldChild);
                const newChildIsQualified = isQualifyingElement(newChild);
                // If both oldChild and newChild are non qualifying elements, exit early
                if (!oldChildIsQualified && !newChildIsQualified) {
                    return replaceChild.apply(this, args);
                }

                // Process oldChild
                let qualifiedReactionTypesForOldChild: QualifyingReactionTypes = 0;
                let qualifyingOldChildren: undefined | NodeList;
                // Is the parent node whose subtree is being modified, a connected node?
                const parentIsConnected = isConnectedGetter.call(this);
                if (oldChildIsQualified && parentIsConnected) {
                    qualifiedReactionTypesForOldChild = qualifiedReactionTypesForOldChild | 2;
                    qualifyingOldChildren = (oldChild as
                        | Element
                        | DocumentFragment).querySelectorAll(`[${marker}]`);
                }

                // Process newChild
                let qualifiedReactionTypesForNewChild: QualifyingReactionTypes = 0;
                // pre fetch the new child's subtree(works for both Element and DocFrag)
                let qualifyingNewChildren: undefined | NodeList;
                if (newChildIsQualified) {
                    // If newChild was connected, call disconnectedCallback
                    if (isConnectedGetter.call(newChild)) {
                        qualifiedReactionTypesForNewChild = qualifiedReactionTypesForNewChild | 2;
                    }
                    // If newChild will be connected, call connectedCallback
                    if (parentIsConnected) {
                        qualifiedReactionTypesForNewChild = qualifiedReactionTypesForNewChild | 1;
                    }
                    if (qualifiedReactionTypesForNewChild > 0) {
                        qualifyingNewChildren = (newChild as
                            | Element
                            | DocumentFragment).querySelectorAll(`[${marker}]`);
                    }
                }

                // DOM Operation
                const result = replaceChild.apply(this, args);

                const reactionQueue: ReactionRecord[] = [];
                if (qualifiedReactionTypesForOldChild & 2) {
                    queueReactionsForSubtree(
                        oldChild as Element,
                        qualifyingOldChildren!,
                        qualifiedReactionTypesForOldChild,
                        reactionQueue
                    );
                }
                if (qualifiedReactionTypesForNewChild > 0) {
                    queueReactionsForSubtree(
                        newChild as Element | DocumentFragment,
                        qualifyingNewChildren!,
                        qualifiedReactionTypesForNewChild,
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
                const args: any = ArraySlice.call(arguments);
                // If child is connected and it is a qualifying element, process reaction records
                if (isConnectedGetter.call(this) && isQualifyingElement(child)) {
                    const qualifyingChildren = (child as
                        | Element
                        | DocumentFragment).querySelectorAll(`[${marker}]`);
                    const qualifiedReactionTypes: QualifyingReactionTypes = 2;

                    // DOM operation
                    const result = removeChild.apply(this, args);
                    const reactionQueue: ReactionRecord[] = [];
                    queueReactionsForSubtree(
                        child as Element | DocumentFragment,
                        qualifyingChildren,
                        qualifiedReactionTypes,
                        reactionQueue
                    );
                    flushQueue(reactionQueue);
                    return result;
                }
                return removeChild.apply(this, args);
            },
        },
    });
}
