/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ComponentConstructor } from './component';
import {
    isUndefined,
    isObject,
    isNull,
    StringToLowerCase,
    getOwnPropertyNames,
    isTrue,
    isFalse,
    ArrayMap,
} from '../shared/language';
import { createVM, appendRootVM, removeRootVM, getCustomElementVM, CreateVMInit } from './vm';
import { resolveCircularModuleDependency, isCircularModuleDependency, EmptyObject } from './utils';
import { getComponentDef } from './def';
import { tagNameGetter } from '../env/element';
import { isNativeShadowRootAvailable } from '../env/dom';
import { getPropNameFromAttrName, isAttributeLocked } from './attributes';
import { patchCustomElementProto } from './patch';
import { HTMLElementConstructor } from './base-bridge-element';
import { patchCustomElementWithRestrictions } from './restrictions';

export function buildCustomElementConstructor(
    Ctor: ComponentConstructor,
    options?: ShadowRootInit
): HTMLElementConstructor {
    if (isCircularModuleDependency(Ctor)) {
        Ctor = resolveCircularModuleDependency(Ctor);
    }
    const { props, bridge: BaseElement } = getComponentDef(Ctor);
    const normalizedOptions: CreateVMInit = {
        fallback: false,
        mode: 'open',
        isRoot: true,
        owner: null,
    };
    if (isObject(options) && !isNull(options)) {
        const { mode, fallback } = options as any;
        // TODO: for now, we default to open, but eventually it should default to 'closed'
        if (mode === 'closed') {
            normalizedOptions.mode = mode;
        }
        // fallback defaults to false to favor shadowRoot
        normalizedOptions.fallback = isTrue(fallback) || isFalse(isNativeShadowRootAvailable);
    }
    return class extends BaseElement {
        constructor() {
            super();
            const tagName = StringToLowerCase.call(tagNameGetter.call(this));
            if (isTrue(normalizedOptions.fallback)) {
                const def = getComponentDef(Ctor);
                patchCustomElementProto(this, {
                    def,
                });
            }
            createVM(tagName, this, Ctor, normalizedOptions);
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
