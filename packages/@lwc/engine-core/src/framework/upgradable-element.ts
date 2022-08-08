/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import features from '@lwc/features';
import { isUndefined, isFunction } from '@lwc/shared';
import { logError } from '../shared/logger';
import { connectRootElement, disconnectRootElement, getAssociatedVMIfPresent } from './vm';
import type { RendererAPI } from './renderer';

type UpgradeCallback = (elm: HTMLElement) => void;

interface UpgradableCustomElementConstructor extends CustomElementConstructor {
    new (upgradeCallback?: UpgradeCallback): HTMLElement;
}

function checkHasVM(elm: Element) {
    const hasVM = !isUndefined(getAssociatedVMIfPresent(elm));
    if (process.env.NODE_ENV !== 'production' && !hasVM) {
        // Occurs when an element is manually created with same tag name as an existing LWC component. In that case,
        // we skip calling the LWC connectedCallback/disconnectedCallback logic and log an error.
        logError(
            `VM for tag name "${elm.tagName.toLowerCase()}" is undefined. ` +
                `This indicates that an element was created with this tag name, ` +
                `which is already reserved by an LWC component. Use lwc.createElement ` +
                `instead to create elements.`
        );
    }
    return hasVM;
}

export function getUpgradableConstructor(
    tagName: string,
    renderer: RendererAPI
): CustomElementConstructor | UpgradableCustomElementConstructor {
    const {
        getCustomElement,
        HTMLElementExported: RendererHTMLElement,
        defineCustomElement,
    } = renderer;
    // Should never get a tag with upper case letter at this point, the compiler should
    // produce only tags with lowercase letters
    // But, for backwards compatibility, we will lower case the tagName
    tagName = tagName.toLowerCase();
    let CE = getCustomElement(tagName);
    if (!isUndefined(CE)) {
        return CE;
    }
    /**
     * LWC Upgradable Element reference to an element that was created
     * via the scoped registry mechanism, and that is ready to be upgraded.
     */
    CE = class LWCUpgradableElement extends RendererHTMLElement {
        constructor(upgradeCallback?: UpgradeCallback) {
            super();
            if (isFunction(upgradeCallback)) {
                upgradeCallback(this); // nothing to do with the result for now
            }
        }
    };
    if (features.ENABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE) {
        CE.prototype.connectedCallback = function () {
            if (checkHasVM(this)) {
                connectRootElement(this);
            }
        };

        CE.prototype.disconnectedCallback = function () {
            if (checkHasVM(this)) {
                disconnectRootElement(this);
            }
        };
    }
    defineCustomElement(tagName, CE);
    return CE;
}
