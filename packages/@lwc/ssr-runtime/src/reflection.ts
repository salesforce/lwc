/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { AriaAttrNameToPropNameMap, create, entries, hasOwnProperty, isNull } from '@lwc/shared';
import { LightningElement } from './lightning-element';

// Eventually include globals that also reflect
const attrsToProps = AriaAttrNameToPropNameMap;

export function reflectAttrToProp(
    instance: LightningElement,
    attrName: string,
    attrValue: string | null
) {
    const reflectedPropName = attrsToProps[attrName];
    // If the reflected property was not overriden by the instance
    if (!hasOwnProperty.call(instance, reflectedPropName)) {
        (instance as any)[reflectedPropName] = attrValue;
    }
}

export const descriptors = create(null);
for (const [attrName, propName] of entries(attrsToProps)) {
    descriptors[propName] = {
        get(this: LightningElement): any {
            return this.getAttribute(attrName);
        },
        set(this: LightningElement, newValue: unknown) {
            const currentValue = this.getAttribute(attrName);
            if (newValue !== currentValue) {
                // According to the spec, IDL nullable type values (null and
                // undefined) should remove the attribute; however, we only do
                // so in the case of null for historical reasons.
                if (isNull(newValue)) {
                    this.removeAttribute(attrName);
                } else {
                    this.setAttribute(attrName, newValue);
                }
            }
        },
        // configurable and enumerable to allow it to be overridden – this mimics Safari's/Chrome's behavior
        configurable: true,
        enumerable: true,
    };
}
