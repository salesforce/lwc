/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { getAssociatedVM, appendVM, removeVM, hasAttachedVM } from './vm';

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
                if (hasAttachedVM(this)) {
                    const vm = getAssociatedVM(this);
                    appendVM(vm);
                }
            }
            disconnectedCallback() {
                if (hasAttachedVM(this)) {
                    const vm = getAssociatedVM(this);
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
