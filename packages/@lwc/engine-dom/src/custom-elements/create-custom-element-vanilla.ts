/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined } from '@lwc/shared';
import type { LifecycleCallback } from '@lwc/engine-core';

const cachedConstructors = new Map<string, CustomElementConstructor>();
const elementsUpgradedOutsideLWC = new WeakSet<HTMLElement>();
let elementBeingUpgradedByLWC = false;

// Creates a constructor that is intended to be used as a vanilla custom element, except that the upgradeCallback is
// passed in to the constructor so LWC can reuse the same custom element constructor for multiple components.
// Another benefit is that only LWC can create components that actually do anything – if you do
// `customElements.define('x-foo')`, then you don't have access to the upgradeCallback, so it's a dummy custom element.
// This class should be created once per tag name.
const createUpgradableConstructor = (
    connectedCallback?: LifecycleCallback,
    disconnectedCallback?: LifecycleCallback
) => {
    const hasConnectedCallback = !isUndefined(connectedCallback);
    const hasDisconnectedCallback = !isUndefined(disconnectedCallback);

    // TODO [#2972]: this class should expose observedAttributes as necessary
    class UpgradableConstructor extends HTMLElement {
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

export const createCustomElementVanilla = (
    tagName: string,
    upgradeCallback: LifecycleCallback,
    connectedCallback?: LifecycleCallback,
    disconnectedCallback?: LifecycleCallback
) => {
    // use global custom elements registry
    let UpgradableConstructor = cachedConstructors.get(tagName);

    if (isUndefined(UpgradableConstructor)) {
        if (!isUndefined(customElements.get(tagName))) {
            throw new Error(
                `Unexpected tag name "${tagName}". This name is a registered custom element, preventing LWC to upgrade the element.`
            );
        }
        UpgradableConstructor = createUpgradableConstructor(
            connectedCallback,
            disconnectedCallback
        );
        customElements.define(tagName, UpgradableConstructor);
        cachedConstructors.set(tagName, UpgradableConstructor);
    }

    elementBeingUpgradedByLWC = true;
    try {
        return new UpgradableConstructor(upgradeCallback);
    } finally {
        elementBeingUpgradedByLWC = false;
    }
};
