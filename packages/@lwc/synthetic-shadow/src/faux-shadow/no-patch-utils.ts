/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isHostElement } from './shadow-root';
import { getAllMatches, getNodeOwner, getAllSlottedMatches } from './traverse';
import { ArrayFilter, ArraySlice, isNull, isUndefined } from '@lwc/shared';
import { getNodeKey, getNodeOwnerKey } from './node';
import { isGlobalPatchingSkipped } from '../shared/utils';

export function getNonPatchedFilteredArrayOfNodes<T extends Node>(
    context: Element,
    unfilteredNodes: Array<T>
): Array<T> {
    let filtered: T[];

    const ownerKey = getNodeOwnerKey(context);
    if (!isUndefined(ownerKey)) {
        // a node inside a shadow.
        if (isHostElement(context)) {
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
            filtered = ArrayFilter.call(unfilteredNodes, elm => getNodeOwnerKey(elm) === ownerKey);
        }
    } else if (context instanceof HTMLBodyElement) {
        // `context` is document.body which is already patched.
        filtered = ArrayFilter.call(
            unfilteredNodes,
            // TODO: issue #1222 - remove global bypass
            elm => isUndefined(getNodeOwnerKey(elm)) || isGlobalPatchingSkipped(context)
        );
    } else {
        // `context` is outside the lwc boundary, return unfiltered list.
        filtered = ArraySlice.call(unfilteredNodes);
    }

    return filtered;
}
