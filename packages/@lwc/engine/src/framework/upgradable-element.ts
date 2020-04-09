/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined, isTrue } from '@lwc/shared';
import { appendVM, removeVM, getAssociatedVMIfPresent, renderVM } from './vm';
import { startGlobalMeasure, GlobalMeasurementPhase, endGlobalMeasure } from './performance-timing';

// Using a local set object is much faster than looking up for tags in the custom element registry
const globalRegisteredNames: Set<string> = new Set();

/**
 * LWC Upgradable Element reference to an element that was created
 * via the scoped registry mechanism, and that is ready to be
 * upgrade by calling createVM operation on it.
 */
class LWCUpgradableElement extends HTMLElement {
    connectedCallback() {
        const vm = getAssociatedVMIfPresent(this);
        if (!isUndefined(vm)) {
            const { isRoot } = vm;
            if (isTrue(isRoot)) {
                startGlobalMeasure(GlobalMeasurementPhase.HYDRATE, vm);
            }
            appendVM(vm);
            renderVM(vm);
            if (isTrue(isRoot)) {
                endGlobalMeasure(GlobalMeasurementPhase.HYDRATE, vm);
            }
        }
    }
    disconnectedCallback() {
        const vm = getAssociatedVMIfPresent(this);
        if (!isUndefined(vm)) {
            removeVM(vm);
        }
    }
}

function defineUpgradableElement(tagName: string): boolean {
    // Should never get a tag with upper case letter at this point, the compiler should
    // produce only tags with lowercase letters
    // But, for backwards compatibility, we will lower case the tag
    tagName = tagName.toLowerCase();
    if (!isUndefined(customElements.get(tagName))) {
        // someone else already defined this element
        return false;
    }
    customElements.define(tagName, class extends LWCUpgradableElement {});
    globalRegisteredNames.add(tagName);
    return true;
}

export function registerTagName(tagName: string): boolean {
    if (isTagNameRegistered(tagName)) {
        return true;
    }
    return defineUpgradableElement(tagName);
}

export function isTagNameRegistered(tagName: string): boolean {
    return globalRegisteredNames.has(tagName);
}

export function isUpgradableElement(elm: HTMLElement): boolean {
    return elm instanceof LWCUpgradableElement;
}
