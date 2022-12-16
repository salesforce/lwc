/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { AriaPropNameToAttrNameMap, isNull, defineProperty } from '@lwc/shared';

function createAriaPropertyPropertyDescriptor(attrName: string): PropertyDescriptor {
    // Note that we need to call this.{get,set,has,remove}Attribute rather than dereferencing
    // from Element.prototype, because these methods are overridden in LightningElement.
    return {
        get(this: HTMLElement): any {
            // reflect what's in the attribute
            return this.hasAttribute(attrName) ? this.getAttribute(attrName) : null;
        },
        set(this: HTMLElement, newValue: any) {
            // reflect into the corresponding attribute
            if (isNull(newValue)) {
                this.removeAttribute(attrName);
            } else {
                this.setAttribute(attrName, newValue);
            }
        },
        configurable: true,
        enumerable: true,
    };
}

export function patch(propName: string, prototype: any) {
    const attrName = AriaPropNameToAttrNameMap[propName];
    const descriptor = createAriaPropertyPropertyDescriptor(attrName);
    defineProperty(prototype, propName, descriptor);
}
