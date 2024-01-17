/*
 * Copyright (c) 2023, Salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined, entries, isTrue } from '@lwc/shared';
import {
    LifecycleCallback,
    connectRootElement,
    disconnectRootElement,
    runFormAssociatedCallback,
    runFormDisabledCallback,
    runFormResetCallback,
    runFormStateRestoreCallback,
} from '@lwc/engine-core';

const LIFECYCLE_CALLBACKS = {
    connectedCallback: connectRootElement,
    disconnectedCallback: disconnectRootElement,
    formAssociatedCallback: runFormAssociatedCallback,
    formDisabledCallback: runFormDisabledCallback,
    formResetCallback: runFormResetCallback,
    formStateRestoreCallback: runFormStateRestoreCallback,
};

const cachedConstructors = new Map<string, CustomElementConstructor>();
const nativeLifecycleElementsToUpgradedByLWC = new WeakMap<HTMLElement, boolean>();

let elementBeingUpgradedByLWC = false;

// Creates a constructor that is intended to be used directly as a custom element, except that the upgradeCallback is
// passed in to the constructor so LWC can reuse the same custom element constructor for multiple components.
// Another benefit is that only LWC can create components that actually do anything – if you do
// `customElements.define('x-foo')`, then you don't have access to the upgradeCallback, so it's a dummy custom element.
// This class should be created once per tag name.
const createUpgradableConstructor = () => {
    // TODO [#2972]: this class should expose observedAttributes as necessary
    class UpgradableConstructor extends HTMLElement {
        static formAssociated = true;

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
    }

    for (const [propName, callback] of entries(LIFECYCLE_CALLBACKS)) {
        (UpgradableConstructor.prototype as any)[propName] = function () {
            // If the element is in the WeakMap (i.e. it's marked as native lifecycle), and if it was upgraded by LWC,
            // then it can use native lifecycle
            if (isTrue(nativeLifecycleElementsToUpgradedByLWC.get(this))) {
                callback(this);
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

export const createCustomElement = (
    tagName: string,
    upgradeCallback: LifecycleCallback,
    useNativeLifecycle: boolean
) => {
    const UpgradableConstructor = getUpgradableConstructor(tagName);

    elementBeingUpgradedByLWC = true;
    try {
        return new UpgradableConstructor(upgradeCallback, useNativeLifecycle);
    } finally {
        elementBeingUpgradedByLWC = false;
    }
};
