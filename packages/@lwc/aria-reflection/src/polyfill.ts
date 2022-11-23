/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { AriaPropNameToAttrNameMap } from '@lwc/shared';

function createAriaPropertyPropertyDescriptor(
    propName: string,
    attrName: string
): PropertyDescriptor {
    return {
        get(this: HTMLElement): any {
            // reflect what's in the attribute
            return this.hasAttribute(attrName) ? this.getAttribute(attrName) : null;
        },
        set(this: HTMLElement, newValue: any) {
            // reflect into the corresponding attribute
            if (newValue === null) {
                this.removeAttribute(attrName);
            } else {
                this.setAttribute(attrName, newValue);
            }
        },
        configurable: true,
        enumerable: true,
    };
}

export function patch(propName: string, prototype: any = Element.prototype) {
    // Typescript is inferring the wrong function type for this particular
    // overloaded method: https://github.com/Microsoft/TypeScript/issues/27972
    // @ts-ignore type-mismatch
    const attrName = AriaPropNameToAttrNameMap[propName];
    const descriptor = createAriaPropertyPropertyDescriptor(propName, attrName);
    Object.defineProperty(prototype, propName, descriptor);
}
