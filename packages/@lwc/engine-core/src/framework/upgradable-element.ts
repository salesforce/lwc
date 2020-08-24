/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined, isFunction } from '@lwc/shared';
import { Renderer } from './renderer';

type UpgradeCallback = (elm: HTMLElement) => void;

export interface UpgradableCustomElementConstructor extends CustomElementConstructor {
    upgrade: UpgradeCallback;
}

export function getUpgradableConstructor(
    tagName: string,
    renderer: Renderer
): CustomElementConstructor | UpgradableCustomElementConstructor {
    let CE = renderer.getCustomElement(tagName);
    if (!isUndefined(CE)) {
        return CE;
    }
    /**
     * LWC Upgradable Element reference to an element that was created
     * via the scoped registry mechanism, and that is ready to be upgraded.
     */
    CE = class LWCUpgradableElement extends renderer.HTMLElement {
        private static upgradeCallback: UpgradeCallback | undefined;
        static set upgrade(callbackOnce: UpgradeCallback) {
            this.upgradeCallback = callbackOnce;
        }
        constructor() {
            super();
            const constructor = this.constructor as typeof LWCUpgradableElement;
            const { upgradeCallback } = constructor;
            constructor.upgradeCallback = undefined; // resetting it
            if (isFunction(upgradeCallback)) {
                upgradeCallback(this); // nothing to do with the result for now
            }
        }
    };
    renderer.defineCustomElement(tagName, CE);
    return CE;
}
