import { isUndefined } from './shared/language';
import assert from './shared/assert';

export enum ReactionEventType {
    connected,
    disconnected,
}

export type ReactionCallback = (node: Node, reactionEventType: String, parentNode: Node) => void;

const nodeToCallbackMap: WeakMap<Node, { [key: string]: Array<ReactionCallback> }> = new WeakMap();
export function reactTo(
    node: Node,
    reactionEventType: ReactionEventType,
    callback: ReactionCallback
): void {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(node, 'Missing required node param');
        assert.invariant(reactionEventType, 'Missing required event type param');
        assert.invariant(callback, 'Missing callback');
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

export function getRegisteredCallbacks(
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
