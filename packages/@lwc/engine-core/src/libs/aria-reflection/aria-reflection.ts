/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    AriaPropNameToAttrNameMap,
    defineProperty,
    getOwnPropertyDescriptor,
    isNull,
    isUndefined,
    keys,
} from '@lwc/shared';

// Apply ARIA string reflection behavior to a prototype.
// This is deliberately kept separate from @lwc/aria-reflection. @lwc/aria-reflection is a global polyfill that is
// needed for backwards compatibility in LEX, whereas `applyAriaReflection` is designed to only apply to our own
// LightningElement/BaseBridgeElement prototypes.
export function applyAriaReflection(prototype: any) {
    for (const propName of keys(AriaPropNameToAttrNameMap)) {
        const attrName = AriaPropNameToAttrNameMap[propName];
        if (isUndefined(getOwnPropertyDescriptor(prototype, propName))) {
            // Note that we need to call this.{get,set,has,remove}Attribute rather than dereferencing
            // from Element.prototype, because these methods are overridden in LightningElement.
            defineProperty(prototype, propName, {
                get(this: HTMLElement): any {
                    return this.getAttribute(attrName);
                },
                set(this: HTMLElement, newValue: any) {
                    // TODO [#3284]: there is disagreement between browsers and the spec on how to treat undefined
                    // Our historical behavior is to only treat null as removing the attribute
                    // See also https://github.com/w3c/aria/issues/1858
                    if (isNull(newValue)) {
                        this.removeAttribute(attrName);
                    } else {
                        this.setAttribute(attrName, newValue);
                    }
                },
                // configurable and enumerable to allow it to be overridden – this mimics Safari's/Chrome's behavior
                configurable: true,
                enumerable: true,
            });
        }
    }
}
