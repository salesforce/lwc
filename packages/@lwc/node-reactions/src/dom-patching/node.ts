/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { getOwnPropertyDescriptor, defineProperties, ObjectKeys, isTrue } from '../shared/language';
import { ReactionRecord, QualfyingReactionTypes } from '../types';
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

                const qualifiedReactionTypes: QualfyingReactionTypes = {};
                if (isConnectedGetter.call(aChild)) {
                    qualifiedReactionTypes.disconnected = true;
                }
                // Get the children before appending
                const qualifyingChildren = (aChild as Element | DocumentFragment).querySelectorAll(
                    `[${marker}]`
                );

                // DOM Operation
                const result = appendChild.call(this, aChild);

                if (isConnectedGetter.call(this)) {
                    qualifiedReactionTypes.connected = true;
                }
                if (ObjectKeys(qualifiedReactionTypes).length > 0) {
                    const reactionQueue: Array<ReactionRecord> = [];
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

                const qualifiedReactionTypes: QualfyingReactionTypes = {};
                if (isConnectedGetter.call(newNode)) {
                    qualifiedReactionTypes.disconnected = true;
                }
                const qualifyingChildren = (newNode as Element | DocumentFragment).querySelectorAll(
                    `[${marker}]`
                );

                // DOM Operation
                const result = insertBefore.call(this, newNode, referenceNode);

                if (isConnectedGetter.call(this)) {
                    // Short circuit and check if parent is connected
                    qualifiedReactionTypes.connected = true;
                }
                if (ObjectKeys(qualifiedReactionTypes).length > 0) {
                    const reactionQueue: Array<ReactionRecord> = [];
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

                const qualifiedPreReactionTypes: QualfyingReactionTypes = {};
                // Pre action
                let qualifyingOldChildren: undefined | NodeList;
                let qualifyingNewChildren: undefined | NodeList;
                if (oldChildIsQualified && isConnectedGetter.call(oldChild)) {
                    qualifiedPreReactionTypes.disconnected = true;
                    qualifyingOldChildren = (oldChild as
                        | Element
                        | DocumentFragment).querySelectorAll(`[${marker}]`);
                }
                const qualifiedPostReactionTypes: QualfyingReactionTypes = {};
                // pre fetch the new child's subtree(works for both Element and DocFrag)
                if (newChildIsQualified && isConnectedGetter.call(this)) {
                    qualifyingNewChildren = (newChild as
                        | Element
                        | DocumentFragment).querySelectorAll(`[${marker}]`);
                    qualifiedPostReactionTypes.connected = true;
                }

                // DOM Operation
                const result = replaceChild.call(this, newChild, oldChild);

                const reactionQueue: Array<ReactionRecord> = [];
                if (isTrue(qualifiedPreReactionTypes.disconnected)) {
                    queueReactionsForSubtree(
                        oldChild as Element,
                        qualifyingOldChildren!,
                        qualifiedPreReactionTypes,
                        reactionQueue
                    );
                }
                if (isTrue(qualifiedPostReactionTypes.connected)) {
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

                const qualifiedReactionTypes: QualfyingReactionTypes = { disconnected: true };
                const result = removeChild.call(this, child);
                const reactionQueue: Array<ReactionRecord> = [];
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
