/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined, keys } from '@lwc/shared';
import { ComponentConstructor } from './component';
import { getAttrNameFromPropName, isAttributeLocked } from './attributes';
import { getComponentInternalDef } from './def';
import { createVM, connectRootElement, disconnectedRootElement } from './vm';
import { HTMLElementConstructor } from './base-bridge-element';

/**
 * EXPERIMENTAL: This function builds a Web Component class from a LWC constructor so it can be
 * registered as a new element via customElements.define() at any given time.
 *
 * @example
 * ```
 * import { buildCustomElementConstructor } from 'lwc';
 * import Foo from 'ns/foo';
 * const WC = buildCustomElementConstructor(Foo);
 * customElements.define('x-foo', WC);
 * const elm = document.createElement('x-foo');
 * ```
 */
export function buildCustomElementConstructor(Ctor: ComponentConstructor): HTMLElementConstructor {
    const { props, bridge: BaseElement } = getComponentInternalDef(Ctor);

    // generating the hash table for attributes to avoid duplicate fields
    // and facilitate validation and false positives in case of inheritance.
    const attributeToPropMap: Record<string, string> = {};
    for (const propName in props) {
        attributeToPropMap[getAttrNameFromPropName(propName)] = propName;
    }
    return class extends BaseElement {
        constructor() {
            super();
            createVM(this, Ctor, {
                mode: 'open',
                isRoot: true,
                owner: null,
            });
        }
        connectedCallback() {
            connectRootElement(this);
        }
        disconnectedCallback() {
            disconnectedRootElement(this);
        }
        attributeChangedCallback(attrName: string, oldValue: string, newValue: string) {
            if (oldValue === newValue) {
                // ignoring similar values for better perf
                return;
            }
            const propName = attributeToPropMap[attrName];
            if (isUndefined(propName)) {
                // ignoring unknown attributes
                return;
            }
            if (!isAttributeLocked(this, attrName)) {
                // ignoring changes triggered by the engine itself during:
                // * diffing when public props are attempting to reflect to the DOM
                // * component via `this.setAttribute()`, should never update the prop.
                // Both cases, the the setAttribute call is always wrap by the unlocking
                // of the attribute to be changed
                return;
            }
            // reflect attribute change to the corresponding props when changed
            // from outside.
            (this as any)[propName] = newValue;
        }
        // collecting all attribute names from all public props to apply
        // the reflection from attributes to props via attributeChangedCallback.
        static observedAttributes = keys(attributeToPropMap);
    };
}
