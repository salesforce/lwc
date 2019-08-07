/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ReactionEventType, ReactionCallback } from './types';
import { isUndefined } from './shared/language';
import assert from './shared/assert';
import { createFieldName, getInternalField, setInternalField } from './shared/fields';

const NodeToCallbackLookup = createFieldName('');

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
    let callbackListByType = getInternalField(node, NodeToCallbackLookup);
    if (isUndefined(callbackListByType)) {
        callbackListByType = {};
        callbackListByType[reactionEventType] = [callback];
        setInternalField(node, NodeToCallbackLookup, callbackListByType);
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

export function getRegisteredCallbacksForNode(
    node: Node
): { [key: string]: Array<ReactionCallback> } | undefined {
    return getInternalField(node, NodeToCallbackLookup);
}
