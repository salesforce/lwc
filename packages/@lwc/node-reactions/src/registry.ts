import { ReactionEventType, ReactionCallback } from './types';
import { isUndefined } from './shared/language';
import assert from './shared/assert';

const nodeToCallbackMap: WeakMap<Node, { [key: string]: Array<ReactionCallback> }> = new WeakMap();
export function reactTo(
    node: Node,
    reactionEventType: ReactionEventType,
    callback: ReactionCallback
): void {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(!isUndefined(node), 'Missing required node param');
        assert.invariant(!isUndefined(reactionEventType), 'Missing required event type param');
        assert.invariant(!isUndefined(callback), 'Missing callback');
    }
    let callbackListByType = nodeToCallbackMap.get(node);
    if (isUndefined(callbackListByType)) {
        callbackListByType = {};
        callbackListByType[reactionEventType] = [callback];
        nodeToCallbackMap.set(node, callbackListByType);
        return;
    }
    if (isUndefined(callbackListByType[reactionEventType])) {
        callbackListByType[reactionEventType] = [];
    }
    if (process.env.NODE_ENV !== 'production') {
        // TODO: Handle duplicates https://github.com/salesforce/lwc-rfcs/pull/11/files#r305508013
        assert.invariant(
            callbackListByType[reactionEventType].indexOf(callback) === -1,
            `Registering a duplicate callback for node ${node} and ${reactionEventType} reaction`
        );
    }
    callbackListByType[reactionEventType].push(callback);
}

export function getRegisteredCallbacksByReactionType(
    node: Node,
    reactionEventType: ReactionEventType
): Array<ReactionCallback> | undefined {
    const callbackListByType = nodeToCallbackMap.get(node);
    if (isUndefined(callbackListByType)) {
        return;
    }
    const callbackList = callbackListByType[reactionEventType];
    return callbackList;
}

export function getRegisteredCallbacksForNode(
    node: Node
): { [key: string]: Array<ReactionCallback> } | undefined {
    return nodeToCallbackMap.get(node);
}
