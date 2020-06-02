/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined, keys } from '@lwc/shared';
import { ComponentConstructor } from './component';
import { createVM, connectRootElement, disconnectedRootElement } from './vm';
import { getAttrNameFromPropName, isAttributeLocked } from './attributes';
import { getComponentInternalDef } from './def';
import { HTMLElementConstructor } from './base-bridge-element';

export function buildCustomElementConstructor(Ctor: ComponentConstructor): HTMLElementConstructor {
    const def = getComponentInternalDef(Ctor);

    // generating the hash table for attributes to avoid duplicate fields
    // and facilitate validation and false positives in case of inheritance.
    const attributeToPropMap: Record<string, string> = {};
    for (const propName in def.props) {
        attributeToPropMap[getAttrNameFromPropName(propName)] = propName;
    }
    return class extends def.bridge {
        constructor() {
            super();
            createVM(this, def, {
                mode: 'open',
                isRoot: true,
                owner: null,
                tagName: this.tagName,
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
