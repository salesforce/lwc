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
    connectedCallback: LifecycleCallback,
    disconnectedCallback: LifecycleCallback
) => {
    // TODO [#2972]: this class should expose observedAttributes as necessary
    return class UpgradableConstructor extends HTMLElement {
        constructor(upgradeCallback: LifecycleCallback) {
            super();
            // If the element is not created using lwc.createElement(), e.g. `document.createElement('x-foo')`,
            // then elementBeingUpgraded will be false
            if (elementBeingUpgradedByLWC) {
                upgradeCallback(this);
            } else {
                // keep track of elements that were not created by lwc.createElement,
                // so we can ignore their lifecycle hooks
                elementsUpgradedOutsideLWC.add(this);

                if (!isUndefined(upgradeCallback)) {
                    // This will only happen if someone is doing something zany like passing their own
                    // custom upgradeCallback into the Ctor.
                    throw new Error(
                        'Failed to create custom element: upgradeCallback should either be undefined or registered'
                    );
                }
            }
        }
        connectedCallback() {
            if (!elementsUpgradedOutsideLWC.has(this)) {
                connectedCallback(this);
            }
        }
        disconnectedCallback() {
            if (!elementsUpgradedOutsideLWC.has(this)) {
                disconnectedCallback(this);
            }
        }
    };
};

export const createCustomElementVanilla = (
    tagName: string,
    upgradeCallback: LifecycleCallback,
    connectedCallback: LifecycleCallback,
    disconnectedCallback: LifecycleCallback
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
