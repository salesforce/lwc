/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ComponentConstructor } from './component';
import { isUndefined, isObject, isNull, getOwnPropertyNames, ArrayMap } from '../shared/language';
import { createVM, appendRootVM, removeRootVM, getCustomElementVM, CreateVMInit } from './vm';
import { EmptyObject } from './utils';
import { getComponentDef } from './def';
import { getPropNameFromAttrName, isAttributeLocked } from './attributes';
import { HTMLElementConstructor } from './base-bridge-element';
import { patchCustomElementWithRestrictions } from './restrictions';

/**
 * This function builds a Web Component class from a LWC constructor
 * so it can be registered as a new element via customElements.define()
 * at any given time. E.g.:
 *
 *      import { buildCustomElementConstructor } from 'lwc';
 *      import Foo from 'ns/foo';
 *      const WC = buildCustomElementConstructor(Foo);
 *      customElements.define('x-foo', Foo);
 *      const elm = document.createElement('x-foo');
 *
 */
export function buildCustomElementConstructor(
    Ctor: ComponentConstructor,
    options?: ShadowRootInit
): HTMLElementConstructor {
    const { props, bridge: BaseElement } = getComponentDef(Ctor);
    const normalizedOptions: CreateVMInit = {
        mode: 'open',
        isRoot: true,
        owner: null,
    };
    if (isObject(options) && !isNull(options)) {
        const { mode } = options as any;
        // TODO: #1300 - use a default value of 'closed'
        if (mode === 'closed') {
            normalizedOptions.mode = mode;
        }
    }
    return class extends BaseElement {
        constructor() {
            super();
            createVM(this, Ctor, normalizedOptions);
            if (process.env.NODE_ENV !== 'production') {
                patchCustomElementWithRestrictions(this, EmptyObject);
            }
        }
        connectedCallback() {
            const vm = getCustomElementVM(this);
            appendRootVM(vm);
        }
        disconnectedCallback() {
            const vm = getCustomElementVM(this);
            removeRootVM(vm);
        }
        attributeChangedCallback(attrName, oldValue, newValue) {
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
            this[propName] = newValue;
        }
        // collecting all attribute names from all public props to apply
        // the reflection from attributes to props via attributeChangedCallback.
        static observedAttributes = ArrayMap.call(
            getOwnPropertyNames(props),
            propName => props[propName].attr
        );
    };
}
