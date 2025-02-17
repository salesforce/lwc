/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import {
    RenderMode,
    ShadowMode,
    computeShadowAndRenderMode,
    connectRootElement,
    createVM,
    disconnectRootElement,
    getComponentHtmlPrototype,
    runFormAssociatedCallback,
    runFormDisabledCallback,
    runFormResetCallback,
    runFormStateRestoreCallback,
    BaseBridgeElement,
} from '@lwc/engine-core';
import { isNull } from '@lwc/shared';
import { renderer } from '../renderer';
import type { LightningElement, FormRestoreState, FormRestoreReason } from '@lwc/engine-core';

type ComponentConstructor = typeof LightningElement;
type HTMLElementConstructor = typeof HTMLElement;

/**
 * This function builds a Web Component class from a LWC constructor so it can be
 * registered as a new element via customElements.define() at any given time.
 * @param Ctor LWC constructor to build
 * @returns A Web Component class
 * @example
 * import { buildCustomElementConstructor } from 'lwc';
 * import Foo from 'ns/foo';
 * const WC = buildCustomElementConstructor(Foo);
 * customElements.define('x-foo', WC);
 * const elm = document.createElement('x-foo');
 * @deprecated since version 1.3.11
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

function clearNode(node: Node) {
    const childNodes = renderer.getChildNodes(node);
    for (let i = childNodes.length - 1; i >= 0; i--) {
        renderer.remove(childNodes[i], node);
    }
}

/**
 * The real `buildCustomElementConstructor`. Should not be accessible to external users!
 * @internal
 * @param Ctor LWC constructor to build
 * @returns A Web Component class
 * @see {@linkcode deprecatedBuildCustomElementConstructor}
 */
export function buildCustomElementConstructor(Ctor: ComponentConstructor): HTMLElementConstructor {
    const HtmlPrototype = getComponentHtmlPrototype(Ctor);
    const { observedAttributes } = HtmlPrototype as any;
    const { attributeChangedCallback } = HtmlPrototype.prototype as any;

    return class extends HTMLElement {
        constructor() {
            super();

            if (!isNull(this.shadowRoot)) {
                if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.warn(
                        `Found an existing shadow root for the custom element "${Ctor.name}". Call \`hydrateComponent\` instead.`
                    );
                }
                clearNode(this.shadowRoot);
            }

            // Compute renderMode/shadowMode in advance. This must be done before `createVM` because `createVM` may
            // mutate the element.
            const { shadowMode, renderMode } = computeShadowAndRenderMode(Ctor, renderer);

            // Native shadow components are allowed to have pre-existing `childNodes` before upgrade. This supports
            // use cases where a custom element has declaratively-defined slotted content, e.g.:
            // https://github.com/salesforce/lwc/issues/3639
            const isNativeShadow =
                renderMode === RenderMode.Shadow && shadowMode === ShadowMode.Native;
            if (!isNativeShadow && this.childNodes.length > 0) {
                if (process.env.NODE_ENV !== 'production') {
                    // eslint-disable-next-line no-console
                    console.warn(
                        `Light DOM and synthetic shadow custom elements cannot have child nodes. ` +
                            `Ensure the element is empty, including whitespace.`
                    );
                }
                clearNode(this);
            }

            createVM(this, Ctor, renderer, {
                mode: 'open',
                owner: null,
                tagName: this.tagName,
            });
        }

        connectedCallback() {
            connectRootElement(this);
        }

        disconnectedCallback() {
            disconnectRootElement(this);
        }

        attributeChangedCallback(name: string, oldValue: any, newValue: any) {
            if (this instanceof BaseBridgeElement) {
                // W-17420330
                attributeChangedCallback.call(this, name, oldValue, newValue);
            }
        }

        formAssociatedCallback(form: HTMLFormElement | null) {
            runFormAssociatedCallback(this, form);
        }

        formDisabledCallback(disabled: boolean) {
            runFormDisabledCallback(this, disabled);
        }

        formResetCallback() {
            runFormResetCallback(this);
        }

        formStateRestoreCallback(state: FormRestoreState | null, reason: FormRestoreReason) {
            runFormStateRestoreCallback(this, state, reason);
        }

        static observedAttributes = observedAttributes;
        // Note CustomElementConstructor is not upgraded by LWC and inherits directly from HTMLElement which means it calls the native
        // attachInternals API.
        static formAssociated = Boolean(Ctor.formAssociated);
    };
}
