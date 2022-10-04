/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isFunction, isUndefined } from '@lwc/shared';
import type { LifecycleCallback } from '@lwc/engine-core';

const cachedConstructors = new Map<string, CustomElementConstructor>();

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
            // The upgradeCallback will be undefined in cases where LWC is not creating the element,
            // e.g. `document.createElement('x-foo')`
            if (isFunction(upgradeCallback)) {
                upgradeCallback(this);
            }
        }
        connectedCallback() {
            connectedCallback(this);
        }
        disconnectedCallback() {
            disconnectedCallback(this);
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
    return new UpgradableConstructor(upgradeCallback);
};
