/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { appendVM, removeVM, getAssociatedVMIfPresent, renderVM } from './vm';
import { isUndefined } from '@lwc/shared';
import { startGlobalMeasure, GlobalMeasurementPhase, endGlobalMeasure } from './performance-timing';

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
            startGlobalMeasure(GlobalMeasurementPhase.HYDRATE, vm);
            appendVM(vm);
            renderVM(vm);
            endGlobalMeasure(GlobalMeasurementPhase.HYDRATE, vm);
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
    if (!isUndefined(customElements.get(tagName))) {
        // someone else already defined this element
        return false;
    }
    customElements.define(tagName, class extends LWCUpgradableElement {});
    globalRegisteredNames.add(tagName);
    return true;
}

export function registerTagName(tagName: string) {
    if (isTagNameRegistered(tagName)) {
        return true;
    }
    defineUpgradableElement(tagName);
}

export function isTagNameRegistered(tagName: string): boolean {
    return globalRegisteredNames.has(tagName);
}

export function isUpgradableElement(elm: HTMLElement): boolean {
    return elm instanceof LWCUpgradableElement;
}
