/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    ArrayFind,
    StringSplit,
    StringToLowerCase,
    ArrayJoin,
    ArraySort,
    ArrayPush,
} from '@lwc/shared';
import { HostAttributesKey, HostNamespaceKey } from '../types';
import type { HostElement } from '../types';

const elementsToTrackForMutations: WeakSet<HostElement> = new WeakSet();

const MUTATION_TRACKING_ATTRIBUTE = 'data-lwc-host-mutated';

export function reportMutation(element: HostElement, attributeName: string) {
    if (elementsToTrackForMutations.has(element)) {
        const existingMutationAttribute = ArrayFind.call(
            element[HostAttributesKey],
            (attr) => attr.name === MUTATION_TRACKING_ATTRIBUTE && attr[HostNamespaceKey] === null
        );
        const attrNameValues = new Set(
            existingMutationAttribute
                ? StringSplit.call(existingMutationAttribute.value, ' ' as any)
                : []
        );
        attrNameValues.add(StringToLowerCase.call(attributeName));

        const newMutationAttributeValue = ArrayJoin.call(ArraySort.call([...attrNameValues]), ' ');

        if (existingMutationAttribute) {
            existingMutationAttribute.value = newMutationAttributeValue;
        } else {
            ArrayPush.call(element[HostAttributesKey], {
                name: MUTATION_TRACKING_ATTRIBUTE,
                [HostNamespaceKey]: null,
                value: newMutationAttributeValue,
            });
        }
    }
}

export function startTrackingMutations(element: HostElement) {
    elementsToTrackForMutations.add(element);
}

export function stopTrackingMutations(element: HostElement) {
    elementsToTrackForMutations.delete(element);
}
