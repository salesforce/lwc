/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ReactionEventType, ReactionCallback, ReactionEvent } from '../types';
import { ArrayPush, isUndefined, create } from '../shared/language';
import { getInternalField, setInternalField } from '../shared/fields';
import { setAttribute, hasAttribute } from '../env/element';
import { NodeToReactionsLookup } from '../global/init';

export const marker = 'data-node-reactions';

const connectedEvent = create(null, { type: { value: ReactionEventType.connected } });
const disconnectedEvent = create(null, { type: { value: ReactionEventType.disconnected } });

export function reactWhenConnected(elm: Element, callback: ReactionCallback): void {
    const reaction: ReactionEvent = create(connectedEvent, {
        node: { value: elm },
        callback: { value: callback },
    });

    let reactionListByType = getInternalField(elm, NodeToReactionsLookup);
    if (isUndefined(reactionListByType)) {
        reactionListByType = create(null);
        reactionListByType[ReactionEventType.connected] = [reaction];
        setInternalField(elm, NodeToReactionsLookup, reactionListByType);
        setAttribute.call(elm, marker, '');
        return;
    }
    const connectedReactionList = reactionListByType[ReactionEventType.connected];
    if (isUndefined(connectedReactionList)) {
        reactionListByType[ReactionEventType.connected] = [reaction];
        return;
    }
    ArrayPush.call(connectedReactionList, reaction);
}

export function reactWhenDisconnected(elm: Element, callback: ReactionCallback): void {
    const reaction: ReactionEvent = create(disconnectedEvent, {
        node: { value: elm },
        callback: { value: callback },
    });
    let reactionListByType = getInternalField(elm, NodeToReactionsLookup);
    if (isUndefined(reactionListByType)) {
        reactionListByType = create(null);
        reactionListByType[ReactionEventType.disconnected] = [reaction];
        setInternalField(elm, NodeToReactionsLookup, reactionListByType);
        setAttribute.call(elm, marker, '');
        return;
    }
    const disconnectedReactionList = reactionListByType[ReactionEventType.disconnected];
    if (isUndefined(disconnectedReactionList)) {
        reactionListByType[ReactionEventType.disconnected] = [reaction];
        return;
    }
    ArrayPush.call(disconnectedReactionList, reaction);
}

export function getRegisteredReactionsForElement(
    elm: Node
): { [key: string]: Array<ReactionEvent> } | undefined {
    return getInternalField(elm, NodeToReactionsLookup);
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
