/*
 * Copyright (c) 2023, Salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined } from '@lwc/shared';
import { getLifecycleCallbacks } from '../lifecycle-callbacks';
import type { LifecycleCallback } from '@lwc/engine-core';

const cachedConstructors = new Map<string, CustomElementConstructor>();
const elementsUpgradedOutsideLWC = new WeakSet<HTMLElement>();
let elementBeingUpgradedByLWC = false;

// Creates a constructor that is intended to be used directly as a custom element, except that the upgradeCallback is
// passed in to the constructor so LWC can reuse the same custom element constructor for multiple components.
// Another benefit is that only LWC can create components that actually do anything – if you do
// `customElements.define('x-foo')`, then you don't have access to the upgradeCallback, so it's a dummy custom element.
// This class should be created once per tag name.
const createUpgradableConstructor = () => {
    const lifecycleCallbacks = getLifecycleCallbacks();
    const connectedCallback = lifecycleCallbacks?.connectedCallback;
    const disconnectedCallback = lifecycleCallbacks?.disconnectedCallback;
    const hasConnectedCallback = !isUndefined(connectedCallback);
    const hasDisconnectedCallback = !isUndefined(disconnectedCallback);

    // TODO [#2972]: this class should expose observedAttributes as necessary
    class UpgradableConstructor extends HTMLElement {
        static formAssociated = true;

        constructor(upgradeCallback: LifecycleCallback) {
            super();
            // If the element is not created using lwc.createElement(), e.g. `document.createElement('x-foo')`,
            // then elementBeingUpgraded will be false
            if (elementBeingUpgradedByLWC) {
                upgradeCallback(this);
            } else if (hasConnectedCallback || hasDisconnectedCallback) {
                // If this element has connected or disconnected callbacks, then we need to keep track of
                // instances that were created outside LWC (i.e. not created by `lwc.createElement()`).
                // If the element has no connected or disconnected callbacks, then we don't need to track this.
                elementsUpgradedOutsideLWC.add(this);

                // TODO [#2970]: LWC elements cannot be upgraded via new Ctor()
                // Do we want to support this? Throw an error? Currently for backwards compat it's a no-op.
            }
        }

        formAssociatedCallback() {
            const formAssociatedCallback = getLifecycleCallbacks()?.formAssociatedCallback;
            // if element was upgraded outside LWC, this will be undefined
            if (!isUndefined(formAssociatedCallback) && !elementsUpgradedOutsideLWC.has(this)) {
                formAssociatedCallback(this);
            }
        }

        formResetCallback() {
            const formResetCallback = getLifecycleCallbacks()?.formResetCallback;
            // if element was upgraded outside LWC, this will be undefined
            if (!isUndefined(formResetCallback) && !elementsUpgradedOutsideLWC.has(this)) {
                formResetCallback(this);
            }
        }

        formDisabledCallback() {
            const formDisabledCallback = getLifecycleCallbacks()?.formDisabledCallback;
            // if element was upgraded outside LWC, this will be undefined
            if (!isUndefined(formDisabledCallback) && !elementsUpgradedOutsideLWC.has(this)) {
                formDisabledCallback(this);
            }
        }

        formStateRestoreCallback() {
            const formStateRestoreCallback = getLifecycleCallbacks()?.formStateRestoreCallback;
            // if element was upgraded outside LWC, this will be undefined
            if (!isUndefined(formStateRestoreCallback) && !elementsUpgradedOutsideLWC.has(this)) {
                formStateRestoreCallback(this);
            }
        }
    }

    // Do not unnecessarily add a connectedCallback/disconnectedCallback, as it introduces perf overhead
    // See: https://github.com/salesforce/lwc/pull/3162#issuecomment-1311851174
    if (hasConnectedCallback) {
        (UpgradableConstructor.prototype as any).connectedCallback = function () {
            if (!elementsUpgradedOutsideLWC.has(this)) {
                connectedCallback(this);
            }
        };
    }

    if (hasDisconnectedCallback) {
        (UpgradableConstructor.prototype as any).disconnectedCallback = function () {
            if (!elementsUpgradedOutsideLWC.has(this)) {
                disconnectedCallback(this);
            }
        };
    }

    return UpgradableConstructor;
};

export function getUpgradableConstructor(tagName: string) {
    let UpgradableConstructor = cachedConstructors.get(tagName);

    if (isUndefined(UpgradableConstructor)) {
        if (!isUndefined(customElements.get(tagName))) {
            throw new Error(
                `Unexpected tag name "${tagName}". This name is a registered custom element, preventing LWC to upgrade the element.`
            );
        }
        UpgradableConstructor = createUpgradableConstructor();
        customElements.define(tagName, UpgradableConstructor);
        cachedConstructors.set(tagName, UpgradableConstructor);
    }
    return UpgradableConstructor;
}

export const createCustomElement = (tagName: string, upgradeCallback: LifecycleCallback) => {
    const UpgradableConstructor = getUpgradableConstructor(tagName);

    elementBeingUpgradedByLWC = true;
    try {
        return new UpgradableConstructor(upgradeCallback);
    } finally {
        elementBeingUpgradedByLWC = false;
    }
};
