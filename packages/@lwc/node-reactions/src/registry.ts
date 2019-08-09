/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ReactionEventType, ReactionCallback } from './types';
import { ArrayPush, isUndefined, create, ArrayIndexOf } from './shared/language';
import assert from './shared/assert';
import { createFieldName, getInternalField, setInternalField } from './shared/fields';
import { setAttribute } from './env/element';

export const marker = 'data-node-reactions';

const NodeToCallbackLookup = createFieldName('callback-lookup');
export function reactTo(
    elm: Element,
    reactionEventType: ReactionEventType,
    callback: ReactionCallback
): void {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(!isUndefined(elm), 'Missing required node param');
        assert.invariant(!isUndefined(reactionEventType), 'Missing required event type param');
        assert.invariant(!isUndefined(callback), 'Missing callback');
        assert.invariant(elm instanceof Element, 'Expected to only register Elements');
    }

    let callbackListByType = getInternalField(elm, NodeToCallbackLookup);
    if (isUndefined(callbackListByType)) {
        callbackListByType = create(null);
        callbackListByType[reactionEventType] = [callback];
        setInternalField(elm, NodeToCallbackLookup, callbackListByType);
        setAttribute.call(elm, marker, '');
        return;
    }
    if (isUndefined(callbackListByType[reactionEventType])) {
        callbackListByType[reactionEventType] = [];
    }
    if (process.env.NODE_ENV !== 'production') {
        // TODO: Handle duplicates https://github.com/salesforce/lwc-rfcs/pull/11/files#r305508013
        assert.invariant(
            ArrayIndexOf.call(callbackListByType[reactionEventType], callback) === -1,
            `Registering a duplicate callback for node ${elm} and ${reactionEventType} reaction`
        );
    }
    ArrayPush.call(callbackListByType[reactionEventType], callback); // TODO arrayPush from shared
}

export function getRegisteredCallbacksForElement(
    elm: Node
): { [key: string]: Array<ReactionCallback> } | undefined {
    return getInternalField(elm, NodeToCallbackLookup);
}

export function isRegisteredNode(node: Node): boolean {
    return !isUndefined(getInternalField(node, NodeToCallbackLookup));
}

/**
 * Whether a subtree, including the root node, has any inspectable nodes.
 * Conditions to satisfy
 * 1. The root, has to be an element
 * 2. The root, has to have children or is a custom element
 *  2a. Assumption here is that all custom elements are registered
 */
export function isQualifyingElement(rootNode: Node): boolean {
    return (
        !isUndefined(rootNode) &&
        'childElementCount' in rootNode && // duck-typing to detect if node is an element, instead of the expensive instanceOf
        ((rootNode as Element | DocumentFragment).childElementCount > 0 ||
            isRegisteredNode(rootNode))
    );
}
