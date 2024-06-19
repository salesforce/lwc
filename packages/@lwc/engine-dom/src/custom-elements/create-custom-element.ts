/*
 * Copyright (c) 2023, Salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined, isTrue } from '@lwc/shared';
import {
    LifecycleCallback,
    connectRootElement,
    disconnectRootElement,
    runFormAssociatedCallback,
    runFormDisabledCallback,
    runFormResetCallback,
    runFormStateRestoreCallback,
    FormRestoreState,
    FormRestoreReason,
} from '@lwc/engine-core';

const cachedConstructors = new Map<string, CustomElementConstructor>();
const nativeLifecycleElementsToUpgradedByLWC = new WeakMap<HTMLElement, boolean>();

let elementBeingUpgradedByLWC = false;

let BaseUpgradableConstructor: CustomElementConstructor | undefined;
let BaseHTMLElement: typeof HTMLElement | undefined;

function createBaseUpgradableConstructor() {
    // Creates a constructor that is intended to be used directly as a custom element, except that the upgradeCallback is
    // passed in to the constructor so LWC can reuse the same custom element constructor for multiple components.
    // Another benefit is that only LWC can create components that actually do anything – if you do
    // `customElements.define('x-foo')`, then you don't have access to the upgradeCallback, so it's a dummy custom element.
    // This class should be created once per tag name.
    // TODO [#2972]: this class should expose observedAttributes as necessary
    BaseUpgradableConstructor = class TheBaseUpgradableConstructor extends HTMLElement {
        constructor(upgradeCallback: LifecycleCallback, useNativeLifecycle: boolean) {
            super();

            if (useNativeLifecycle) {
                // When in native lifecycle mode, we need to keep track of instances that were created outside LWC
                // (i.e. not created by `lwc.createElement()`). If the element uses synthetic lifecycle, then we don't
                // need to track this.
                nativeLifecycleElementsToUpgradedByLWC.set(this, elementBeingUpgradedByLWC);
            }

            // If the element is not created using lwc.createElement(), e.g. `document.createElement('x-foo')`,
            // then elementBeingUpgradedByLWC will be false
            if (elementBeingUpgradedByLWC) {
                upgradeCallback(this);
            }
            // TODO [#2970]: LWC elements cannot be upgraded via new Ctor()
            // Do we want to support this? Throw an error? Currently for backwards compat it's a no-op.
        }

        connectedCallback() {
            // native `connectedCallback`/`disconnectedCallback` are only enabled in native lifecycle mode
            if (isTrue(nativeLifecycleElementsToUpgradedByLWC.get(this))) {
                connectRootElement(this);
            }
        }

        disconnectedCallback() {
            // native `connectedCallback`/`disconnectedCallback` are only enabled in native lifecycle mode
            if (isTrue(nativeLifecycleElementsToUpgradedByLWC.get(this))) {
                disconnectRootElement(this);
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
    };
    BaseHTMLElement = HTMLElement; // cache to track if it changes
}

const createUpgradableConstructor = (isFormAssociated: boolean) => {
    if (HTMLElement !== BaseHTMLElement) {
        // If the global HTMLElement changes out from under our feet, then we need to create a new
        // BaseUpgradableConstructor from scratch (since it extends from HTMLElement). This can occur if
        // polyfills are in play, e.g. a polyfill for scoped custom element registries.
        // This workaround can potentially be removed when W-15361244 is resolved.
        createBaseUpgradableConstructor();
    }
    // Using a BaseUpgradableConstructor superclass here is a perf optimization to avoid
    // re-defining the same logic (connectedCallback, disconnectedCallback, etc.) over and over.
    class UpgradableConstructor extends (BaseUpgradableConstructor!) {}

    if (isFormAssociated) {
        // Perf optimization - the vast majority of components have formAssociated=false,
        // so we can skip the setter in those cases, since undefined works the same as false.
        UpgradableConstructor.formAssociated = isFormAssociated;
    }
    return UpgradableConstructor;
};

export function getUpgradableConstructor(tagName: string, isFormAssociated: boolean) {
    let UpgradableConstructor = cachedConstructors.get(tagName);

    if (isUndefined(UpgradableConstructor)) {
        if (!isUndefined(customElements.get(tagName))) {
            throw new Error(
                `Unexpected tag name "${tagName}". This name is a registered custom element, preventing LWC to upgrade the element.`
            );
        }
        UpgradableConstructor = createUpgradableConstructor(isFormAssociated);
        customElements.define(tagName, UpgradableConstructor);
        cachedConstructors.set(tagName, UpgradableConstructor);
    }
    return UpgradableConstructor;
}

export const createCustomElement = (
    tagName: string,
    upgradeCallback: LifecycleCallback,
    useNativeLifecycle: boolean,
    isFormAssociated: boolean
) => {
    const UpgradableConstructor = getUpgradableConstructor(tagName, isFormAssociated);

    if (Boolean(UpgradableConstructor.formAssociated) !== isFormAssociated) {
        throw new Error(
            `<${tagName}> was already registered with formAssociated=${UpgradableConstructor.formAssociated}. It cannot be re-registered with formAssociated=${isFormAssociated}. Please rename your component to have a different name than <${tagName}>`
        );
    }

    elementBeingUpgradedByLWC = true;
    try {
        return new UpgradableConstructor(upgradeCallback, useNativeLifecycle);
    } finally {
        elementBeingUpgradedByLWC = false;
    }
};
