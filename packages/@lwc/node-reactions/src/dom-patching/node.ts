/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { appendChild, insertBefore, replaceChild, removeChild, isConnected } from '../env/node';
import { defineProperties, ArrayPush } from '../shared/language';
import { ReactionEventType, ReactionEvent } from '../types';
import queueReactionsForTree from '../traverse';
import { flushQueue } from '../reaction-queue';

export default function() {
    defineProperties(Node.prototype, {
        appendChild: {
            writable: true,
            enumerable: true,
            configurable: true,
            value: function(this: Node, aChild: Node) {
                const qualifiedReactionTypes: Array<ReactionEventType> = [];
                // Pre action
                if (isConnected.call(aChild)) {
                    ArrayPush.call(qualifiedReactionTypes, ReactionEventType.disconnected);
                }
                // Action
                appendChild.call(this, aChild);
                // Post action
                if (isConnected.call(aChild)) {
                    ArrayPush.call(qualifiedReactionTypes, ReactionEventType.connected);
                }
                const reactionQueue: Array<ReactionEvent> = [];
                queueReactionsForTree(aChild, qualifiedReactionTypes, reactionQueue);
                // Flush the queue only after the appendChild was successful
                flushQueue(reactionQueue);
            },
        },
        insertBefore: {
            writable: true,
            enumerable: true,
            configurable: true,
            value: function(this: Node, newNode: Node, referenceNode: Node) {
                const qualifiedReactionTypes: Array<ReactionEventType> = [];
                // Pre action
                if (isConnected.call(newNode)) {
                    ArrayPush.call(qualifiedReactionTypes, ReactionEventType.disconnected);
                }
                // Action
                insertBefore.call(this, newNode, referenceNode);
                // Post action
                if (isConnected.call(newNode)) {
                    ArrayPush.call(qualifiedReactionTypes, ReactionEventType.connected);
                }
                const reactionQueue: Array<ReactionEvent> = [];
                queueReactionsForTree(newNode, qualifiedReactionTypes, reactionQueue);
                flushQueue(reactionQueue);
            },
        },
        replaceChild: {
            writable: true,
            enumerable: true,
            configurable: true,
            value: function(this: Node, newChild: Node, oldChild: Node) {
                const qualifiedPreReactionTypes: Array<ReactionEventType> = [];
                // Pre action
                if (isConnected.call(oldChild)) {
                    ArrayPush.call(qualifiedPreReactionTypes, ReactionEventType.disconnected);
                }
                // Action
                replaceChild.call(this, newChild, oldChild);

                const qualifiedPostReactionTypes: Array<ReactionEventType> = [];
                // Post action
                if (isConnected.call(newChild)) {
                    ArrayPush.call(qualifiedPostReactionTypes, ReactionEventType.connected);
                }
                const reactionQueue: Array<ReactionEvent> = [];
                queueReactionsForTree(oldChild, qualifiedPreReactionTypes, reactionQueue);
                queueReactionsForTree(newChild, qualifiedPostReactionTypes, reactionQueue);
                flushQueue(reactionQueue);
            },
        },
        removeChild: {
            writable: true,
            enumerable: true,
            configurable: true,
            value: function(this: Node, child: Node) {
                const qualifiedReactionTypes: Array<ReactionEventType> = [];
                if (isConnected.call(child)) {
                    ArrayPush.call(qualifiedReactionTypes, ReactionEventType.disconnected);
                }
                removeChild.call(this, child);
                const reactionQueue: Array<ReactionEvent> = [];
                queueReactionsForTree(child, qualifiedReactionTypes, reactionQueue);
                // Flush the queue only after the appendChild was successful
                flushQueue(reactionQueue);
            },
        },
    });
}
