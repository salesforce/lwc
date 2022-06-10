/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { create, isFunction, setPrototypeOf } from '@lwc/shared';
import { patchCustomElementRegistry } from './patches/global-registry';

let HTMLElementConstructor;

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
    HTMLElementConstructor = HTMLElement;
} else {
    const reverseRegistry: WeakMap<CustomElementConstructor, string> = new WeakMap();

    HTMLElementConstructor = function HTMLElement(this: HTMLElement) {
        if (!(this instanceof HTMLElement)) {
            throw new TypeError(`Invalid Invocation`);
        }
        const { constructor } = this;
        const name = reverseRegistry.get(constructor as CustomElementConstructor);
        if (!name) {
            throw new TypeError(`Invalid Construction`);
        }
        const elm = document.createElement(name);
        setPrototypeOf(elm, constructor.prototype);
        return elm;
    };
    HTMLElementConstructor.prototype = HTMLElement.prototype;
}

export type UpgradeCallback = (elm: HTMLElement) => void;
export interface UpgradableCustomElementConstructor extends CustomElementConstructor {
    new (upgradeCallback?: UpgradeCallback): HTMLElement;
}

export let getUpgradableElement: (name: string) => CustomElementConstructor;
export let getUserConstructor: (
    upgradeCallback: UpgradeCallback
) => UpgradableCustomElementConstructor | UpgradeCallback;

if (isCustomElementRegistryAvailable()) {
    const definePivotCustomElement = patchCustomElementRegistry();
    const cachedConstructor: Record<string, CustomElementConstructor> = create(null);
    getUpgradableElement = (name: string) => {
        let Ctor = cachedConstructor[name];
        if (!Ctor) {
            class LWCUpgradableElement extends HTMLElement {}
            Ctor = definePivotCustomElement(name, LWCUpgradableElement);
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
    getUpgradableElement = (name: string): UpgradableCustomElementConstructor => {
        return function (upgradeCallback?: UpgradeCallback) {
            const elm = document.createElement(name);
            if (isFunction(upgradeCallback)) {
                upgradeCallback(elm); // nothing to do with the result for now
            }
            return elm;
        } as unknown as UpgradableCustomElementConstructor;
    };
    getUserConstructor = (upgradeCallback: UpgradeCallback) => upgradeCallback;
}
