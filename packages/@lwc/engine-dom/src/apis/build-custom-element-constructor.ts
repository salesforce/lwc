/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { create, isUndefined, keys } from '@lwc/shared';
import {
    createVM,
    connectRootElement,
    disconnectRootElement,
    getAttrNameFromPropName,
    getComponentInternalDef,
    isAttributeLocked,
    LightningElement,
} from '@lwc/engine-core';

import { renderer } from '../renderer';

type ComponentConstructor = typeof LightningElement;
type HTMLElementConstructor = typeof HTMLElement;

/**
 * This function builds a Web Component class from a LWC constructor so it can be
 * registered as a new element via customElements.define() at any given time.
 *
 * @deprecated since version 1.3.11
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
export function deprecatedBuildCustomElementConstructor(
    Ctor: ComponentConstructor
): HTMLElementConstructor {
    if (process.env.NODE_ENV !== 'production') {
        /* eslint-disable-next-line no-console */
        console.warn(
            'Deprecated function called: "buildCustomElementConstructor" function is deprecated and it will be removed.' +
                `Use "${Ctor.name}.CustomElementConstructor" static property of the component constructor to access the corresponding custom element constructor instead.`
        );
    }

    return Ctor.CustomElementConstructor;
}

export function buildCustomElementConstructor(Ctor: ComponentConstructor): HTMLElementConstructor {
    const def = getComponentInternalDef(Ctor);

    // generating the hash table for attributes to avoid duplicate fields and facilitate validation
    // and false positives in case of inheritance.
    const attributeToPropMap: Record<string, string> = create(null);
    for (const propName in def.props) {
        attributeToPropMap[getAttrNameFromPropName(propName)] = propName;
    }

    return class extends def.bridge {
        constructor() {
            super();
            createVM(this, def, {
                mode: 'open',
                owner: null,
                tagName: this.tagName,
                renderer,
            });
        }
        connectedCallback() {
            connectRootElement(this);
        }
        disconnectedCallback() {
            disconnectRootElement(this);
        }
        attributeChangedCallback(attrName: string, oldValue: string, newValue: string) {
            if (oldValue === newValue) {
                // Ignore same values.
                return;
            }
            const propName = attributeToPropMap[attrName];
            if (isUndefined(propName)) {
                // Ignore unknown attributes.
                return;
            }
            if (!isAttributeLocked(this, attrName)) {
                // Ignore changes triggered by the engine itself during:
                // * diffing when public props are attempting to reflect to the DOM
                // * component via `this.setAttribute()`, should never update the prop
                // Both cases, the setAttribute call is always wrapped by the unlocking of the
                // attribute to be changed
                return;
            }
            // Reflect attribute change to the corresponding property when changed from outside.
            (this as any)[propName] = newValue;
        }
        // Specify attributes for which we want to reflect changes back to their corresponding
        // properties via attributeChangedCallback.
        static observedAttributes = keys(attributeToPropMap);
    };
}
