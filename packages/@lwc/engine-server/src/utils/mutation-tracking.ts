/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { HostAttributesKey, HostElement, HostNamespaceKey } from '../types';

const elementsToTrackForMutations: WeakSet<HostElement> = new WeakSet();

const MUTATION_TRACKING_ATTRIBUTE = 'data-lwc-host-mutated';

export function reportMutation(element: HostElement, attributeName: string) {
    if (elementsToTrackForMutations.has(element)) {
        const existingMutationAttribute = element[HostAttributesKey].find(
            (attr) => attr.name === MUTATION_TRACKING_ATTRIBUTE && attr[HostNamespaceKey] === null
        );
        const attrNameValues = new Set(
            existingMutationAttribute ? existingMutationAttribute.value.split(' ') : []
        );
        attrNameValues.add(attributeName.toLowerCase());

        const newMutationAttributeValue = [...attrNameValues].sort().join(' ');

        if (existingMutationAttribute) {
            existingMutationAttribute.value = newMutationAttributeValue;
        } else {
            element[HostAttributesKey].push({
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
