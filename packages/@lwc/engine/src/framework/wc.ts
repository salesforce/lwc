/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ArrayMap, getOwnPropertyNames, isNull, isObject, isUndefined } from '@lwc/shared';
import { ComponentConstructor } from './component';
import { createVM, getAssociatedVM, CreateVMInit, removeVM, appendVM, renderVM } from './vm';
import { getComponentDef } from './def';
import { getPropNameFromAttrName, isAttributeLocked } from './attributes';
import { HTMLElementConstructor } from './base-bridge-element';

/**
 * This function builds a Web Component class from a LWC constructor
 * so it can be registered as a new element via customElements.define()
 * at any given time. E.g.:
 *
 *      import { buildCustomElementConstructor } from 'lwc';
 *      import Foo from 'ns/foo';
 *      const WC = buildCustomElementConstructor(Foo);
 *      customElements.define('x-foo', WC);
 *      const elm = document.createElement('x-foo');
 *
 */
export function buildCustomElementConstructor(
    Ctor: ComponentConstructor,
    options?: ShadowRootInit
): HTMLElementConstructor {
    const def = getComponentDef(Ctor);
    const { props, bridge: BaseElement } = def;
    const normalizedOptions: CreateVMInit = {
        mode: 'open',
        owner: null,
    };
    if (isObject(options) && !isNull(options)) {
        const { mode } = options;
        if (mode === 'closed') {
            normalizedOptions.mode = mode;
        }
    }
    return class extends BaseElement {
        constructor() {
            super();
            createVM(this, def, normalizedOptions);
        }
        connectedCallback() {
            const vm = getAssociatedVM(this);
            appendVM(vm);
            renderVM(vm);
        }
        disconnectedCallback() {
            const vm = getAssociatedVM(this);
            removeVM(vm);
        }
        attributeChangedCallback(attrName: string, oldValue: string, newValue: string) {
            if (oldValue === newValue) {
                // ignoring similar values for better perf
                return;
            }
            const propName = getPropNameFromAttrName(attrName);
            if (isUndefined(props[propName])) {
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
        static observedAttributes = ArrayMap.call(
            getOwnPropertyNames(props),
            propName => props[propName].attr
        );
    };
}
