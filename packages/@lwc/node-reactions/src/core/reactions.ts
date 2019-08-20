/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ReactionEventType, ReactionCallback } from '../types';
import { ArrayPush, isUndefined, create, ArrayIndexOf } from '../shared/language';
import assert from '../shared/assert';
import { getInternalField, setInternalField } from '../shared/fields';
import { setAttribute, hasAttribute } from '../env/element';
import { NodeToCallbackLookup } from '../global/init';

export const marker = 'data-node-reactions';

export function reactToConnection(elm: Element, callback: ReactionCallback): void {
    let callbackListByType = getInternalField(elm, NodeToCallbackLookup);
    if (isUndefined(callbackListByType)) {
        callbackListByType = create(null);
        callbackListByType[ReactionEventType.connected] = [callback];
        setInternalField(elm, NodeToCallbackLookup, callbackListByType);
        setAttribute.call(elm, marker, '');
        return;
    }
    if (isUndefined(callbackListByType[ReactionEventType.connected])) {
        callbackListByType[ReactionEventType.connected] = [callback];
        return;
    }
    if (process.env.NODE_ENV !== 'production') {
        // TODO: Handle duplicates https://github.com/salesforce/lwc-rfcs/pull/11/files#r305508013
        assert.invariant(
            ArrayIndexOf.call(callbackListByType[ReactionEventType.connected], callback) === -1,
            `Registering a duplicate connected callback for node ${elm}`
        );
    }
    ArrayPush.call(callbackListByType[ReactionEventType.connected], callback);
}

export function reactToDisconnection(elm: Element, callback: ReactionCallback): void {
    let callbackListByType = getInternalField(elm, NodeToCallbackLookup);
    if (isUndefined(callbackListByType)) {
        callbackListByType = create(null);
        callbackListByType[ReactionEventType.disconnected] = [callback];
        setInternalField(elm, NodeToCallbackLookup, callbackListByType);
        setAttribute.call(elm, marker, '');
        return;
    }
    if (isUndefined(callbackListByType[ReactionEventType.disconnected])) {
        callbackListByType[ReactionEventType.disconnected] = [callback];
        return;
    }
    if (process.env.NODE_ENV !== 'production') {
        // TODO: Handle duplicates https://github.com/salesforce/lwc-rfcs/pull/11/files#r305508013
        assert.invariant(
            ArrayIndexOf.call(callbackListByType[ReactionEventType.disconnected], callback) === -1,
            `Registering a duplicate connected callback for node ${elm}`
        );
    }
    ArrayPush.call(callbackListByType[ReactionEventType.disconnected], callback);
}

export function getRegisteredCallbacksForElement(
    elm: Node
): { [key: string]: Array<ReactionCallback> } | undefined {
    return getInternalField(elm, NodeToCallbackLookup);
}

export function isRegisteredNode(node: Node): boolean {
    return hasAttribute.call(node, marker);
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
