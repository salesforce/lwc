/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { AriaPropNameToAttrNameMap, create, getPropertyDescriptor, entries } from '@lwc/shared';
import { HTMLElementPrototype } from '../../framework/html-element';

// Apply ARIA string reflection behavior to a prototype.
// This is deliberately kept separate from @lwc/aria-reflection. @lwc/aria-reflection is a global polyfill that is
// needed for backwards compatibility in LEX, whereas this is designed to only apply to our own
// LightningElement/BaseBridgeElement prototypes.
// Note we only need to handle ARIA reflections that aren't already in Element.prototype
export const ariaReflectionPolyfillDescriptors = create(null);
for (const [propName, attrName] of entries(AriaPropNameToAttrNameMap)) {
    if (isUndefined(getPropertyDescriptor(HTMLElementPrototype, propName))) {
        // Note that we need to call this.{get,set,has,remove}Attribute rather than dereferencing
        // from Element.prototype, because these methods are overridden in LightningElement.
        ariaReflectionPolyfillDescriptors[propName] = {
            get(this: HTMLElement): any {
                return this.getAttribute(attrName);
            },
            set(this: HTMLElement, newValue: any) {
                // TODO [#3284]: According to the spec, IDL nullable type values
                // (null and undefined) should remove the attribute; however, we
                // only do so in the case of null for historical reasons.
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
        };
    }
}
