/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { appendVM, removeVM, getAssociatedVMIfPresent, VMState } from './vm';
import { assert, isTrue, isUndefined } from '@lwc/shared';
import { startGlobalMeasure, GlobalMeasurementPhase, endGlobalMeasure } from './performance-timing';

const globalRegisteredNames: Set<string> = new Set();
const isCustomElementsRegistryAvailable = typeof customElements !== 'undefined';

function defineNewCustomElementRouter(tagName: string): boolean {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(
            isTrue(isCustomElementsRegistryAvailable),
            'Attepting to use native custom elements in an unsuppported browser'
        );
        // https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name
        // Note: This character set is not complete, for simplicity using the following character set
        const VALID_TAG_RE = /^[a-z][a-z0-9-._]*-[a-z0-9-._]*$/;
        assert.invariant(
            isTrue(VALID_TAG_RE.test(tagName)),
            `Invalid custom element name ${tagName}`
        );
    }
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
                    if (process.env.NODE_ENV !== 'production') {
                        // Either the vm was just created or the node is being moved to another subtree
                        assert.isTrue(
                            vm.state === VMState.created || vm.state === VMState.disconnected,
                            `${vm} cannot be connected.`
                        );
                    }
                    startGlobalMeasure(GlobalMeasurementPhase.HYDRATE, vm);
                    appendVM(vm);
                    endGlobalMeasure(GlobalMeasurementPhase.HYDRATE, vm);
                }
            }
            disconnectedCallback() {
                const vm = getAssociatedVMIfPresent(this);
                if (!isUndefined(vm)) {
                    if (process.env.NODE_ENV !== 'production') {
                        assert.isTrue(vm.state === VMState.connected, `${vm} should be connected.`);
                    }
                    removeVM(vm);
                }
            }
        }
    );
    globalRegisteredNames.add(tagName);
    return true;
}

export function registerTagName(tagName: string) {
    if (isTagNameRegistered(tagName)) {
        return true;
    }
    defineNewCustomElementRouter(tagName);
}

export function isTagNameRegistered(tagName: string): boolean {
    return globalRegisteredNames.has(tagName);
}
