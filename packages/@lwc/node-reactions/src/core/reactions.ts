/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ArrayPush, isTrue, isUndefined } from '@lwc/shared';
import { ReactionCallback, ReactionRecord } from '../types';
import { getInternalField, setInternalField, createFieldName } from '../shared/fields';

export const marker = 'data-node-reactions';
const ConnectedRecordsLookup = createFieldName('connected-records-lookup');
const DisconnectedRecordsLookup = createFieldName('disconnected-records-lookup');
export const RegisteredFlag = createFieldName('registered-node');
const { setAttribute } = Element.prototype;

export function reactWhenConnected(element: Element, callback: ReactionCallback) {
    const reactionRecord: ReactionRecord = { element, callback, type: 1 };

    const reactionRecords: ReactionRecord[] = getInternalField(element, ConnectedRecordsLookup);
    if (isUndefined(reactionRecords)) {
        setInternalField(element, ConnectedRecordsLookup, [reactionRecord]);
        setInternalField(element, RegisteredFlag, true);
        setAttribute.call(element, marker, '');
        return;
    }
    ArrayPush.call(reactionRecords, reactionRecord);
}

export function reactWhenDisconnected(element: Element, callback: ReactionCallback) {
    const reactionRecord: ReactionRecord = { element, callback, type: 2 };
    const reactionRecords: ReactionRecord[] = getInternalField(element, DisconnectedRecordsLookup);
    if (isUndefined(reactionRecords)) {
        setInternalField(element, DisconnectedRecordsLookup, [reactionRecord]);
        setInternalField(element, RegisteredFlag, true);
        setAttribute.call(element, marker, '');
        return;
    }
    ArrayPush.call(reactionRecords, reactionRecord);
}

export function getDisconnectedRecordsForElement(elm: Element): ReactionRecord[] | undefined {
    return getInternalField(elm, DisconnectedRecordsLookup);
}

export function getConnectedRecordsForElement(elm: Element): ReactionRecord[] | undefined {
    return getInternalField(elm, ConnectedRecordsLookup);
}

/**
 * For perf reasons, instead of running an instanceof to disambiguate the type, we just look up the field.
 */
export function isRegisteredNode(node: Node): boolean {
    return isTrue(getInternalField(node, RegisteredFlag));
}

/**
 * Is a given node qualified for reactions?
 * Conditions to satisfy
 * 1. The root, has to be an element or document fragment
 * 2. The root, has to have children or is a registered element
 *  2a. Assumption here is that all custom elements are registered
 */
export function isQualifyingElement(elmOrDocFrag: Node): boolean {
    return (
        elmOrDocFrag != null &&
        // TODO: Can we substitute with an instanceof check?
        // duck-typing to detect if node is an element or a document fragment, instead of the expensive instanceOf
        'childElementCount' in elmOrDocFrag &&
        ((elmOrDocFrag as Element | DocumentFragment).childElementCount > 0 ||
            isRegisteredNode(elmOrDocFrag))
    );
}

export function isQualifyingHost(node: Node): boolean {
    return node != null && isRegisteredNode(node);
}
