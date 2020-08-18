/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined, isFunction } from '@lwc/shared';
import { LightningElement } from './base-lightning-element';
import { Renderer } from './renderer';

export function registerTagName(tagName: string, renderer: Renderer): CustomElementConstructor {
    // Should never get a tag with upper case letter at this point, the compiler should
    // produce only tags with lowercase letters
    // But, for backwards compatibility, we will lower case the tag
    tagName = tagName.toLowerCase();
    let CE = renderer.getCustomElement(tagName);
    if (isUndefined(CE)) {
        /**
         * LWC Upgradable Element reference to an element that was created
         * via the scoped registry mechanism, and that is ready to be upgraded.
         */
        CE = class LWCUpgradableElement extends renderer.HTMLElement {
            private static upgradeCallback: ((elm: HTMLElement) => LightningElement) | undefined;
            static set upgrade(callbackOnce: (elm: HTMLElement) => LightningElement) {
                this.upgradeCallback = callbackOnce;
            }
            constructor() {
                super();
                const constructor = this.constructor as typeof LWCUpgradableElement;
                const { upgradeCallback } = constructor;
                constructor.upgradeCallback = undefined; // resetting it
                if (!isFunction(upgradeCallback)) {
                    throw new TypeError(`Invalid constructor invocation`);
                }
                upgradeCallback(this); // nothing to do with the result for now
            }
        };
        renderer.defineCustomElement(tagName, CE);
    }
    return CE;
}
