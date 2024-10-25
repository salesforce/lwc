/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import {
    AriaAttrNameToPropNameMap,
    attributeToPropertyName,
    create,
    entries,
    fromEntries,
    GLOBAL_ATTRIBUTES,
    hasOwnProperty,
    isNull,
    toString,
} from '@lwc/shared';
import type { LightningElement } from './lightning-element';

/** Map of global attribute or ARIA attribute to the corresponding property name. */
const attrsToProps = {
    ...AriaAttrNameToPropNameMap,
    ...fromEntries(Array.from(GLOBAL_ATTRIBUTES, (attr) => [attr, attributeToPropertyName(attr)])),
};

export function reflectAttrToProp(
    instance: LightningElement,
    attrName: string,
    attrValue: string | null
) {
    const reflectedPropName = attrsToProps[attrName];
    // If it is a reflected property and it was not overriden by the instance
    if (reflectedPropName && !hasOwnProperty.call(instance, reflectedPropName)) {
        const currentValue = (instance as any)[reflectedPropName];
        if (currentValue !== attrValue) {
            (instance as any)[reflectedPropName] = attrValue;
        }
    }
}

export const descriptors: Record<string, TypedPropertyDescriptor<string | null>> = create(null);

// Add descriptors for ARIA attributes
for (const [attrName, propName] of entries(AriaAttrNameToPropNameMap)) {
    descriptors[propName] = {
        get(this: LightningElement): string | null {
            return this.getAttribute(attrName);
        },
        set(this: LightningElement, newValue: string | null): void {
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

// Add descriptors for global HTML attributes
for (const attrName of GLOBAL_ATTRIBUTES) {
    descriptors[attrsToProps[attrName]] = {
        get(this: LightningElement): string | null {
            return this.getAttribute(attrName);
        },
        set(this: LightningElement, newValue: string | null): void {
            const currentValue = this.getAttribute(attrName);
            const normalizedValue = String(newValue);
            if (normalizedValue !== currentValue) {
                this.setAttribute(attrName, normalizedValue);
            }
        },
        configurable: true,
        enumerable: true,
    };
}
