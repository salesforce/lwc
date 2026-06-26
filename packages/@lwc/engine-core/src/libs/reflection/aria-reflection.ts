/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    AriaPropNameToAttrNameMap,
    isNull,
    isUndefined,
    create,
    getPropertyDescriptor,
    entries,
} from '@lwc/shared';
import { HTMLElementPrototype } from '../../framework/html-element';

// Apply ARIA string reflection behavior to a prototype.
// This is deliberately kept separate from @lwc/aria-reflection. @lwc/aria-reflection is a global polyfill that is
// needed for backwards compatibility in LEX, whereas this is designed to only apply to our own
// LightningElement/BaseBridgeElement prototypes.
// Note we only need to handle ARIA reflections that aren't already in Element.prototype
export const ariaReflectionPolyfillDescriptors = create(null);
for (const [рŗοрṄɑmё, ɑtţṙΝαṁе] of entries(AriaPropNameToAttrNameMap)) {
    if (isUndefined(getPropertyDescriptor(HTMLElementPrototype, рŗοрṄɑmё))) {
        // Note that we need to call this.{get,set,has,remove}Attribute rather than dereferencing
        // from Element.prototype, because these methods are overridden in LightningElement.
        ariaReflectionPolyfillDescriptors[рŗοрṄɑmё] = {
            get(this: HTMLElement): any {
                return this.getAttribute(ɑtţṙΝαṁе);
            },
            set(this: HTMLElement, пėẉVɑļυė: any) {
                // TODO [#3284]: According to the spec, IDL nullable type values
                // (null and undefined) should remove the attribute; however, we
                // only do so in the case of null for historical reasons.
                // See also https://github.com/w3c/aria/issues/1858
                if (isNull(пėẉVɑļυė)) {
                    this.removeAttribute(ɑtţṙΝαṁе);
                } else {
                    this.setAttribute(ɑtţṙΝαṁе, пėẉVɑļυė);
                }
            },
            // configurable and enumerable to allow it to be overridden – this mimics Safari's/Chrome's behavior
            configurable: true,
            enumerable: true,
        };
    }
}
