/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ReactionCallback, ReactionRecord, ReactionType } from '../types';
import { ArrayPush, isTrue, isUndefined } from '../shared/language';
import { getInternalField, setInternalField, createFieldName } from '../shared/fields';

export const marker = 'data-node-reactions';
const ConnectedRecordsLookup: symbol = createFieldName('connected-records-lookup');
const DisconnectedRecordsLookup: symbol = createFieldName('disconnected-records-lookup');
export const RegisteredFlag: symbol = createFieldName('registered-node');
const { setAttribute } = Element.prototype;

export function reactWhenConnected(element: Element, callback: ReactionCallback): void {
    const reactionRecord: ReactionRecord = { element, callback, type: 'connected' };

    const reactionRecords = getInternalField(element, ConnectedRecordsLookup);
    if (isUndefined(reactionRecords)) {
        setInternalField(element, ConnectedRecordsLookup, [reactionRecord]);
        setInternalField(element, RegisteredFlag, true);
        setAttribute.call(element, marker, '');
        return;
    }
    ArrayPush.call(reactionRecords, reactionRecord);
}

export function reactWhenDisconnected(element: Element, callback: ReactionCallback): void {
    const reactionRecord: ReactionRecord = { element, callback, type: 'disconnected' };
    const reactionRecords = getInternalField(element, DisconnectedRecordsLookup);
    if (isUndefined(reactionRecords)) {
        setInternalField(element, DisconnectedRecordsLookup, [reactionRecord]);
        setInternalField(element, RegisteredFlag, true);
        setAttribute.call(element, marker, '');
        return;
    }
    ArrayPush.call(reactionRecords, reactionRecord);
}

export function getRecordsForElement(
    elm: Element,
    type: ReactionType
): Array<ReactionRecord> | undefined {
    return getInternalField(
        elm,
        type === 'connected' ? ConnectedRecordsLookup : DisconnectedRecordsLookup
    );
}

/**
 * This method expects an Element type but can sometimes be called with a DocumentFragment
 * For perf reasons, instead of running an instanceof to disambiguate the type, we just look up the field.
 */
export function isRegisteredNode(element: Element): boolean {
    return isTrue(getInternalField(element, RegisteredFlag));
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
