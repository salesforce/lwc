/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isNull, isUndefined } from '@lwc/shared';

import { getNodeKey, getNodeNearestOwnerKey, getNodeOwnerKey } from '../shared/node-ownership';
import { isGlobalPatchingSkipped } from '../shared/utils';

import { isSyntheticShadowHost } from './shadow-root';
import { getAllMatches, getNodeOwner, getAllSlottedMatches } from './traverse';

/**
 * This methods filters out elements that are not in the same shadow root of context.
 * It does not enforce shadow dom semantics if $context is not managed by LWC
 * @param context
 * @param unfilteredNodes
 */
export function getNonPatchedFilteredArrayOfNodes<T extends Node>(
    context: Element,
    unfilteredNodes: Array<T>
): Array<T> {
    let filtered: T[];

    const ownerKey = getNodeOwnerKey(context);

    // a node inside a shadow.
    if (!isUndefined(ownerKey)) {
        if (isSyntheticShadowHost(context)) {
            // element with shadowRoot attached
            const owner = getNodeOwner(context);
            if (isNull(owner)) {
                filtered = [];
            } else if (getNodeKey(context)) {
                // it is a custom element, and we should then filter by slotted elements
                filtered = getAllSlottedMatches(context, unfilteredNodes);
            } else {
                // regular element, we should then filter by ownership
                filtered = getAllMatches(owner, unfilteredNodes);
            }
        } else {
            // context is handled by lwc, using getNodeNearestOwnerKey to include manually inserted elements in the same shadow.
            filtered = unfilteredNodes.filter((elm) => getNodeNearestOwnerKey(elm) === ownerKey);
        }
    } else if (context instanceof HTMLBodyElement) {
        // `context` is document.body which is already patched.
        filtered = unfilteredNodes.filter(
            (elm) => isUndefined(getNodeOwnerKey(elm)) || isGlobalPatchingSkipped(context)
        );
    } else {
        // `context` is outside the lwc boundary, return unfiltered list.
        filtered = unfilteredNodes.slice();
    }

    return filtered;
}
