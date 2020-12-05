/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined, isFunction } from '@lwc/shared';
import { Renderer } from './renderer';

type UpgradeCallback = (elm: HTMLElement) => void;

interface UpgradableCustomElementConstructor extends CustomElementConstructor {
    new (upgradeCallback?: UpgradeCallback): HTMLElement;
}

export function getUpgradableConstructor(
    tagName: string,
    renderer: Renderer
): CustomElementConstructor | UpgradableCustomElementConstructor {
    // Should never get a tag with upper case letter at this point, the compiler should
    // produce only tags with lowercase letters
    // But, for backwards compatibility, we will lower case the tagName
    tagName = tagName.toLowerCase();
    let CE = renderer.getCustomElement(tagName);
    if (!isUndefined(CE)) {
        return CE;
    }
    /**
     * LWC Upgradable Element reference to an element that was created
     * via the scoped registry mechanism, and that is ready to be upgraded.
     */
    CE = class extends renderer.HTMLElement {
        constructor(upgradeCallback?: UpgradeCallback) {
            super();
            if (isFunction(upgradeCallback)) {
                upgradeCallback(this); // nothing to do with the result for now
            }
        }
    };
    renderer.defineCustomElement(tagName, CE);
    return CE;
}
