/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined } from '@lwc/shared';
import type { LifecycleCallback } from '@lwc/engine-core';

const cachedConstructors = new Map<string, CustomElementConstructor>();

let elementBeingUpgradedByLWC = false;
let upgradeCallbackToUse: LifecycleCallback | undefined;
let connectedCallbackToUse: LifecycleCallback | undefined;
let disconnectedCallbackToUse: LifecycleCallback | undefined;

const instancesToConnectedCallbacks = new WeakMap<HTMLElement, LifecycleCallback>();
const instancesToDisconnectedCallbacks = new WeakMap<HTMLElement, LifecycleCallback>();

// Creates a constructor that is intended to be used directly as a custom element, except that the upgradeCallback is
// passed in to the constructor so LWC can reuse the same custom element constructor for multiple components.
// Another benefit is that only LWC can create components that actually do anything – if you do
// `customElements.define('x-foo')`, then you don't have access to the upgradeCallback, so it's a dummy custom element.
// This class should be created once per tag name.
const createUpgradableConstructor = () => {
    // TODO [#2972]: this class should expose observedAttributes as necessary
    return class UpgradableConstructor extends HTMLElement {
        constructor() {
            super();
            // If the element is not created using lwc.createElement(), e.g. `document.createElement('x-foo')`,
            // then elementBeingUpgraded will be false
            if (elementBeingUpgradedByLWC) {
                // Cache the callbacks in the weak maps
                instancesToConnectedCallbacks.set(this, connectedCallbackToUse!);
                instancesToDisconnectedCallbacks.set(this, disconnectedCallbackToUse!);
                upgradeCallbackToUse!(this);
            }
            // TODO [#2970]: LWC elements cannot be upgraded via new Ctor()
            // Do we want to support this? Throw an error? Currently for backwards compat it's a no-op.
        }

        connectedCallback() {
            const connectedCallback = instancesToConnectedCallbacks.get(this);
            if (!isUndefined(connectedCallback)) {
                connectedCallback(this);
            }
        }

        disconnectedCallback() {
            const disconnectedCallback = instancesToDisconnectedCallbacks.get(this);
            if (!isUndefined(disconnectedCallback)) {
                disconnectedCallback(this);
            }
        }
    };
};

export const createCustomElementUsingUpgradableConstructor = (
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
        UpgradableConstructor = createUpgradableConstructor();
        customElements.define(tagName, UpgradableConstructor);
        cachedConstructors.set(tagName, UpgradableConstructor);
    }

    elementBeingUpgradedByLWC = true;
    upgradeCallbackToUse = upgradeCallback;
    connectedCallbackToUse = connectedCallback;
    disconnectedCallbackToUse = disconnectedCallback;
    try {
        return new UpgradableConstructor();
    } finally {
        elementBeingUpgradedByLWC = false;
        upgradeCallbackToUse = undefined;
        connectedCallbackToUse = undefined;
        disconnectedCallbackToUse = undefined;
    }
};
