/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { create, isFunction, setPrototypeOf } from '@lwc/shared';
import { createScopedRegistry } from './patches/global-registry';

export type UpgradeCallback = (elm: HTMLElement) => void;
export interface UpgradableCustomElementConstructor extends CustomElementConstructor {
    new (upgradeCallback: UpgradeCallback): HTMLElement;
}

let HTMLElementConstructor;
let getUpgradableElement: (tagName: string) => CustomElementConstructor;
let getUserConstructor: (
    upgradeCallback: UpgradeCallback
) => UpgradableCustomElementConstructor | UpgradeCallback;

function isCustomElementRegistryAvailable() {
    if (typeof customElements === 'undefined') {
        return false;
    }
    try {
        // dereference HTMLElement global because babel wraps globals in compat mode with a
        // _wrapNativeSuper()
        // This is a problem because LWCUpgradableElement extends renderer.HTMLElement which does not
        // get wrapped by babel.
        const HTMLElementAlias = HTMLElement;
        // In case we use compat mode with a modern browser, the compat mode transformation
        // invokes the DOM api with an .apply() or .call() to initialize any DOM api sub-classing,
        // which are not equipped to be initialized that way.
        class clazz extends HTMLElementAlias {}
        customElements.define('lwc-test-' + Math.floor(Math.random() * 1000000), clazz);
        new clazz();
        return true;
    } catch {
        return false;
    }
}

if (isCustomElementRegistryAvailable()) {
    const defineScopedElement = createScopedRegistry();

    // It's important to cache window.HTMLElement immediately after calling createScopedRegistry().
    // Otherwise, someone else could overwrite window.HTMLElement (e.g. another copy of the engine, or another pivot
    // implementation) and we would get "Illegal constructor" errors because the HTMLElement prototypes are mixed up.
    const { HTMLElement } = window;

    HTMLElementConstructor = HTMLElement;
    const cachedConstructor: Record<string, CustomElementConstructor> = create(null);

    getUpgradableElement = (tagName: string) => {
        let Ctor = cachedConstructor[tagName];
        if (!Ctor) {
            // TODO [#2972]: this class should expose observedAttributes as necessary
            class LWCUpgradableElement extends HTMLElement {}
            Ctor = defineScopedElement(tagName, LWCUpgradableElement);
        }
        return Ctor;
    };
    getUserConstructor = (upgradeCallback: UpgradeCallback) => {
        return class UserElement extends HTMLElement {
            constructor() {
                super();
                upgradeCallback(this);
            }
        };
    };
} else {
    // no registry available here
    const reverseRegistry: WeakMap<CustomElementConstructor, string> = new WeakMap();

    HTMLElementConstructor = function HTMLElement(this: HTMLElement) {
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

    getUpgradableElement = (tagName: string): UpgradableCustomElementConstructor => {
        return function (upgradeCallback: UpgradeCallback) {
            const elm = document.createElement(tagName);
            if (isFunction(upgradeCallback)) {
                upgradeCallback(elm); // nothing to do with the result for now
            }
            return elm;
        } as unknown as UpgradableCustomElementConstructor;
    };
    getUserConstructor = (upgradeCallback: UpgradeCallback) => upgradeCallback;
}

export function createCustomElement(
    tagName: string,
    upgradeCallback: UpgradeCallback
): HTMLElement {
    const UpgradableConstructor = getUpgradableElement(tagName);
    const UserConstructor = getUserConstructor(upgradeCallback);
    return new UpgradableConstructor(UserConstructor);
}
