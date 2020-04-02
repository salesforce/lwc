/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { appendVM, removeVM, getAssociatedVMIfPresent } from './vm';
import { isUndefined } from '@lwc/shared';
import { startGlobalMeasure, GlobalMeasurementPhase, endGlobalMeasure } from './performance-timing';

const globalRegisteredNames: Set<string> = new Set();
const isCustomElementsRegistryAvailable = typeof customElements !== 'undefined';

function attemptToDefineNewCustomElementRouter(tagName: string): boolean {
    if (customElements.get(tagName)) {
        // someone else already defined this element
        // TO-DO: what should we do here?
        return false;
    }
    customElements.define(
        tagName,
        class extends HTMLElement {
            connectedCallback() {
                const vm = getAssociatedVMIfPresent(this);
                if (!isUndefined(vm)) {
                    startGlobalMeasure(GlobalMeasurementPhase.HYDRATE, vm);
                    appendVM(vm);
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
    );
    globalRegisteredNames.add(tagName);
    return true;
}

export function attemptToRegisterTagName(tagName: string): boolean {
    if (isTagNameRegistered(tagName)) {
        return true;
    }
    if (isCustomElementsRegistryAvailable) {
        return attemptToDefineNewCustomElementRouter(tagName);
    }
    return false;
}

export function isTagNameRegistered(tagName: string): boolean {
    return globalRegisteredNames.has(tagName);
}
