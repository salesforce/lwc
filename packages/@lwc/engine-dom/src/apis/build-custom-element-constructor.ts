/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import {
    createVM,
    connectRootElement,
    disconnectRootElement,
    LightningElement,
} from '@lwc/engine-core';
import { hydrateComponent } from './hydrate-component';

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

// Note: WeakSet is not supported in IE11, and the polyfill is not performant enough.
//       This WeakSet usage is valid because this functionality is not meant to run in IE11.
const hydratedCustomElements = new WeakSet<Element>();

export function buildCustomElementConstructor(Ctor: ComponentConstructor): HTMLElementConstructor {
    // const HtmlPrototype = getComponentHtmlPrototype(Ctor);

    return class extends HTMLElement {
        constructor() {
            super();

            if (this.isConnected) {
                // this if block is hit when there's already an un-upgraded element in the DOM with the same tag name.
                hydrateComponent(this, Ctor, {});
                hydratedCustomElements.add(this);
            } else {
                createVM(this, Ctor, {
                    mode: 'open',
                    owner: null,
                    tagName: this.tagName,
                });
            }
        }
        connectedCallback() {
            if (hydratedCustomElements.has(this)) {
                // This is an un-upgraded element that was hydrated in the constructor.
                hydratedCustomElements.delete(this);
            } else {
                connectRootElement(this);
            }
        }
        disconnectedCallback() {
            disconnectRootElement(this);
        }
    };
}
