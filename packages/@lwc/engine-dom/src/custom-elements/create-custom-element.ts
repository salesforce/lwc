/*
 * Copyright (c) 2023, Salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined } from '@lwc/shared';
import type { LifecycleCallback } from '@lwc/engine-core';

const cachedConstructors = new Map<string, CustomElementConstructor>();

let upgradeCallbackToUse: LifecycleCallback | undefined;
let connectedCallbackToUse: LifecycleCallback | undefined;
let disconnectedCallbackToUse: LifecycleCallback | undefined;
let formAssociatedCallbackToUse: LifecycleCallback | undefined;
let formDisabledCallbackToUse: LifecycleCallback | undefined;
let formResetCallbackToUse: LifecycleCallback | undefined;
let formStateRestoreCallbackToUse: LifecycleCallback | undefined;

const instancesToConnectedCallbacks = new WeakMap<HTMLElement, LifecycleCallback>();
const instancesToDisconnectedCallbacks = new WeakMap<HTMLElement, LifecycleCallback>();
const instancesToFormAssociatedCallbacks = new WeakMap<HTMLElement, LifecycleCallback>();
const instancesToFormDisabledCallbacks = new WeakMap<HTMLElement, LifecycleCallback>();
const instancesToFormResetCallbacks = new WeakMap<HTMLElement, LifecycleCallback>();
const instancesToFormStateRestoreCallbacks = new WeakMap<HTMLElement, LifecycleCallback>();

// Creates a constructor that is intended to be used directly as a custom element, except that the upgradeCallback is
// passed in via a side channel so LWC can reuse the same custom element constructor for multiple components.
// Another benefit is that only LWC can create components that actually do anything – if you do
// `customElements.define('x-foo')`, then you don't have access to the upgradeCallback, so it's a dummy custom element.
// This class should be created once per tag name.
const createUpgradableConstructor = () => {
    // TODO [#2972]: this class should expose observedAttributes as necessary
    class UpgradableConstructor extends HTMLElement {
        static formAssociated = true;

        constructor() {
            super();
            // If the element is not created using `lwc.createElement()` (e.g. `document.createElement('x-foo')`),
            // then `upgradeCallbackToUse` will be undefined
            if (!isUndefined(upgradeCallbackToUse)) {
                // Cache the callbacks in the weak maps
                instancesToConnectedCallbacks.set(this, connectedCallbackToUse!);
                instancesToDisconnectedCallbacks.set(this, disconnectedCallbackToUse!);
                instancesToFormAssociatedCallbacks.set(this, formAssociatedCallbackToUse!);
                instancesToFormDisabledCallbacks.set(this, formDisabledCallbackToUse!);
                instancesToFormResetCallbacks.set(this, formResetCallbackToUse!);
                instancesToFormStateRestoreCallbacks.set(this, formStateRestoreCallbackToUse!);

                upgradeCallbackToUse(this);
            }
            // TODO [#2970]: LWC elements cannot be upgraded via new Ctor()
            // Do we want to support this? Throw an error? Currently for backwards compat it's a no-op.
        }

        connectedCallback() {
            const connectedCallback = instancesToConnectedCallbacks.get(this);
            // if element was upgraded outside LWC, this will be undefined
            if (!isUndefined(connectedCallback)) {
                connectedCallback(this);
            }
        }

        disconnectedCallback() {
            const disconnectedCallback = instancesToDisconnectedCallbacks.get(this);
            // if element was upgraded outside LWC, this will be undefined
            if (!isUndefined(disconnectedCallback)) {
                disconnectedCallback(this);
            }
        }

        formAssociatedCallback() {
            const formAssociatedCallback = instancesToFormAssociatedCallbacks.get(this);
            // if element was upgraded outside LWC, this will be undefined
            if (!isUndefined(formAssociatedCallback)) {
                formAssociatedCallback(this);
            }
        }

        formResetCallback() {
            const formResetCallback = instancesToFormResetCallbacks.get(this);
            // if element was upgraded outside LWC, this will be undefined
            if (!isUndefined(formResetCallback)) {
                formResetCallback(this);
            }
        }

        formDisabledCallback() {
            const formDisabledCallback = instancesToFormDisabledCallbacks.get(this);
            // if element was upgraded outside LWC, this will be undefined
            if (!isUndefined(formDisabledCallback)) {
                formDisabledCallback(this);
            }
        }

        formStateRestoreCallback() {
            const formStateRestoreCallback = instancesToFormStateRestoreCallbacks.get(this);
            // if element was upgraded outside LWC, this will be undefined
            if (!isUndefined(formStateRestoreCallback)) {
                formStateRestoreCallback(this);
            }
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

export const createCustomElement = (
    tagName: string,
    upgradeCallback: LifecycleCallback,
    connectedCallback: LifecycleCallback,
    disconnectedCallback: LifecycleCallback,
    formAssociatedCallback: LifecycleCallback,
    formDisabledCallback: LifecycleCallback,
    formResetCallback: LifecycleCallback,
    formStateRestoreCallback: LifecycleCallback
) => {
    const UpgradableConstructor = getUpgradableConstructor(tagName);

    upgradeCallbackToUse = upgradeCallback;
    connectedCallbackToUse = connectedCallback;
    disconnectedCallbackToUse = disconnectedCallback;
    formAssociatedCallbackToUse = formAssociatedCallback;
    formDisabledCallbackToUse = formDisabledCallback;
    formResetCallbackToUse = formResetCallback;
    formStateRestoreCallbackToUse = formStateRestoreCallback;

    try {
        return new UpgradableConstructor(upgradeCallback);
    } finally {
        upgradeCallbackToUse = undefined;
        connectedCallbackToUse = undefined;
        disconnectedCallbackToUse = undefined;
        formAssociatedCallbackToUse = undefined;
        formDisabledCallbackToUse = undefined;
        formResetCallbackToUse = undefined;
        formStateRestoreCallbackToUse = undefined;
    }
};
