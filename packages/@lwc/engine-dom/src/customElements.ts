/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { setPrototypeOf } from '@lwc/shared';
import features from '@lwc/features';
import { connectRootElement, disconnectRootElement } from '@lwc/engine-core';
import { createPivotConstructor } from './patches/global-registry';
import { hasCustomElements } from './hasCustomElements';

export type UpgradeCallback = (elm: HTMLElement) => void;
export interface UpgradableCustomElementConstructor extends CustomElementConstructor {
    new (upgradeCallback: UpgradeCallback): HTMLElement;
}

export let createCustomElement: (tagName: string, upgradeCallback: UpgradeCallback) => HTMLElement;

if (hasCustomElements) {
    // It's important to cache window.HTMLElement here. Otherwise, someone else could overwrite window.HTMLElement (e.g.
    // another copy of the engine, or another pivot implementation) and we would get "Illegal constructor" errors
    // because the HTMLElement prototypes are mixed up.
    const { HTMLElement } = window;

    const createUserConstructor = (upgradeCallback: UpgradeCallback) => {
        // TODO [#2972]: this class should expose observedAttributes as necessary
        class UserElement extends HTMLElement {
            constructor() {
                super();
                upgradeCallback(this);
            }
        }
        if (features.ENABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE) {
            (UserElement.prototype as any).connectedCallback = function () {
                connectRootElement(this);
            };
            (UserElement.prototype as any).disconnectedCallback = function () {
                disconnectRootElement(this);
            };
        }
        return UserElement;
    };
    createCustomElement = (tagName: string, upgradeCallback: UpgradeCallback) => {
        const UserConstructor = createUserConstructor(upgradeCallback);
        const UpgradableConstructor = createPivotConstructor(tagName, UserConstructor);
        return new UpgradableConstructor(UserConstructor);
    };
} else {
    // no registry available here
    const reverseRegistry: WeakMap<CustomElementConstructor, string> = new WeakMap();

    const HTMLElementConstructor = function HTMLElement(this: HTMLElement) {
        if (!(this instanceof HTMLElement)) {
            throw new TypeError(`Invalid Invocation`);
        }
        const { constructor } = this;
        const tagName = reverseRegistry.get(constructor as CustomElementConstructor);
        if (!tagName) {
            throw new TypeError(`Invalid Construction`);
        }
        const elm = document.createElement(tagName);
        setPrototypeOf(elm, constructor.prototype);
        return elm;
    };
    HTMLElementConstructor.prototype = HTMLElement.prototype;

    createCustomElement = (tagName: string, upgradeCallback: UpgradeCallback) => {
        const elm = document.createElement(tagName);
        upgradeCallback(elm); // nothing to do with the result for now
        return elm;
    };
}
