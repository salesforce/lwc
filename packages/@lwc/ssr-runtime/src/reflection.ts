/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import {
    AriaAttrNameToPropNameMap,
    create,
    entries,
    hasOwnProperty,
    isNull,
    toString,
} from '@lwc/shared';
import { LightningElement } from './lightning-element';

export function reflectAttrToProp(
    instance: LightningElement,
    attrName: string,
    attrValue: string | null
) {
    const reflectedPropName = AriaAttrNameToPropNameMap[attrName];
    // If it is a reflected property and it was not overriden by the instance
    if (reflectedPropName && !hasOwnProperty.call(instance, reflectedPropName)) {
        const currentValue = (instance as any)[reflectedPropName];
        if (currentValue !== attrValue) {
            (instance as any)[reflectedPropName] = attrValue;
        }
    }
}

export const descriptors = create(null);
for (const [attrName, propName] of entries(AriaAttrNameToPropNameMap)) {
    descriptors[propName] = {
        get(this: LightningElement): string | null {
            return this.getAttribute(attrName);
        },
        set(this: LightningElement, newValue: unknown): void {
            const currentValue = this.getAttribute(attrName);
            if (newValue !== currentValue) {
                // TODO [#3284]: According to the spec, IDL nullable type values
                // (null and undefined) should remove the attribute; however, we
                // only do so in the case of null for historical reasons.
                if (isNull(newValue)) {
                    this.removeAttribute(attrName);
                } else {
                    this.setAttribute(attrName, toString(newValue));
                }
            }
        },
        configurable: true,
        enumerable: true,
    };
}
