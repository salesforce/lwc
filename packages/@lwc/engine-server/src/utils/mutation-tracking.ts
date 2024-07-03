/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { HostAttributesKey, HostElement, HostNamespaceKey } from '../types';

const elementsToTrackForMutations: WeakSet<HostElement> = new WeakSet();

const ATTRIBUTE_NAME = 'data-lwc-host-mutated';

export function reportMutation(element: HostElement) {
    if (elementsToTrackForMutations.has(element)) {
        const hasAttribute = element[HostAttributesKey].find(
            (attr) => attr.name === ATTRIBUTE_NAME && attr[HostNamespaceKey] === null
        );
        if (!hasAttribute) {
            element[HostAttributesKey].push({
                name: ATTRIBUTE_NAME,
                [HostNamespaceKey]: null,
                value: '',
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
