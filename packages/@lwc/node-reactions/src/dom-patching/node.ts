import { appendChild, insertBefore, replaceChild, removeChild, isConnected } from '../env/node';
import { defineProperties, ArrayPush } from '../shared/language';
import { ReactionEventType } from '../types';
import queueReactionsForTree from '../traverse';
import { flushQueue } from '../reaction-queue';

export default function() {
    defineProperties(Node.prototype, {
        appendChild: {
            writable: true,
            enumerable: true,
            configurable: true,
            value: function(this: Node, aChild: Node) {
                const reactions: Array<ReactionEventType> = [];
                // Pre action
                if (isConnected.call(aChild)) {
                    ArrayPush.call(reactions, ReactionEventType.disconnected);
                }
                // Action
                appendChild.call(this, aChild);
                // Post action
                if (isConnected.call(aChild)) {
                    ArrayPush.call(reactions, ReactionEventType.connected);
                }
                queueReactionsForTree(aChild, reactions);
                // Flush the queue only after the appendChild was successful
                flushQueue();
            },
        },
        insertBefore: {
            writable: true,
            enumerable: true,
            configurable: true,
            value: function(this: Node, newNode: Node, referenceNode: Node) {
                const reactions: Array<ReactionEventType> = [];
                // Pre action
                if (isConnected.call(newNode)) {
                    ArrayPush.call(reactions, ReactionEventType.disconnected);
                }
                // Action
                insertBefore.call(this, newNode, referenceNode);
                // Post action
                if (isConnected.call(newNode)) {
                    ArrayPush.call(reactions, ReactionEventType.connected);
                }
                queueReactionsForTree(newNode, reactions);
                flushQueue();
            },
        },
        replaceChild: {
            writable: true,
            enumerable: true,
            configurable: true,
            value: function(this: Node, newChild: Node, oldChild: Node) {
                const preReactions: Array<ReactionEventType> = [];
                // Pre action
                if (isConnected.call(oldChild)) {
                    ArrayPush.call(preReactions, ReactionEventType.disconnected);
                }
                // Action
                replaceChild.call(this, newChild, oldChild);

                const postReactions: Array<ReactionEventType> = [];
                // Post action
                if (isConnected.call(newChild)) {
                    ArrayPush.call(postReactions, ReactionEventType.connected);
                }
                queueReactionsForTree(oldChild, preReactions);
                queueReactionsForTree(newChild, postReactions);
                flushQueue();
            },
        },
        removeChild: {
            writable: true,
            enumerable: true,
            configurable: true,
            value: function(this: Node, child: Node) {
                const reactions: Array<ReactionEventType> = [];
                if (isConnected.call(child)) {
                    ArrayPush.call(reactions, ReactionEventType.disconnected);
                }
                removeChild.call(this, child);
                queueReactionsForTree(child, reactions);
                // Flush the queue only after the appendChild was successful
                flushQueue();
            },
        },
    });
}
