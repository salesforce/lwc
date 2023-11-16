/*
 * Copyright (c) 2023, Salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined, entries } from '@lwc/shared';
import {
    LifecycleCallback,
    connectRootElement,
    disconnectRootElement,
    runFormAssociatedCallback,
    runFormDisabledCallback,
    runFormResetCallback,
    runFormStateRestoreCallback,
} from '@lwc/engine-core';
const cachedConstructors = new Map<string, CustomElementConstructor>();
const elementsUpgradedOutsideLWC = new WeakSet<HTMLElement>();
let elementBeingUpgradedByLWC = false;

const lifecycleCallbacks = lwcRuntimeFlags.ENABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE
    ? {
          connectedCallback: connectRootElement,
          disconnectedCallback: disconnectRootElement,
          formAssociatedCallback: runFormAssociatedCallback,
          formDisabledCallback: runFormDisabledCallback,
          formResetCallback: runFormResetCallback,
          formStateRestoreCallback: runFormStateRestoreCallback,
      }
    : undefined;

// Creates a constructor that is intended to be used directly as a custom element, except that the upgradeCallback is
// passed in to the constructor so LWC can reuse the same custom element constructor for multiple components.
// Another benefit is that only LWC can create components that actually do anything – if you do
// `customElements.define('x-foo')`, then you don't have access to the upgradeCallback, so it's a dummy custom element.
// This class should be created once per tag name.
const createUpgradableConstructor = () => {
    // TODO [#2972]: this class should expose observedAttributes as necessary
    class UpgradableConstructor extends HTMLElement {
        static formAssociated = true;

        constructor(upgradeCallback: LifecycleCallback) {
            super();
            // If the element is not created using lwc.createElement(), e.g. `document.createElement('x-foo')`,
            // then elementBeingUpgraded will be false
            if (elementBeingUpgradedByLWC) {
                upgradeCallback(this);
            } else if (!isUndefined(lifecycleCallbacks)) {
                // If this element has any lifecycle callbacks, then we need to keep track of
                // instances that were created outside LWC (i.e. not created by `lwc.createElement()`).
                // If the element has no connected or disconnected callbacks, then we don't need to track this.
                elementsUpgradedOutsideLWC.add(this);

                // TODO [#2970]: LWC elements cannot be upgraded via new Ctor()
                // Do we want to support this? Throw an error? Currently for backwards compat it's a no-op.
            }
        }
    }

    // Do not unnecessarily add a connectedCallback/disconnectedCallback/etc., as it introduces perf overhead
    // See: https://github.com/salesforce/lwc/pull/3162#issuecomment-1311851174
    if (!isUndefined(lifecycleCallbacks)) {
        for (const [propName, callback] of entries(lifecycleCallbacks)) {
            (UpgradableConstructor.prototype as any)[propName] = function () {
                if (!elementsUpgradedOutsideLWC.has(this)) {
                    callback(this);
                }
            };
        }
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
