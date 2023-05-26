/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined } from '@lwc/shared';
import type { LifecycleCallback } from '@lwc/engine-core';

const createConstructor = (
    upgradeCallback: LifecycleCallback,
    connectedCallback?: LifecycleCallback,
    disconnectedCallback?: LifecycleCallback
) => {
    const hasConnectedCallback = !isUndefined(connectedCallback);
    const hasDisconnectedCallback = !isUndefined(disconnectedCallback);

    // TODO [#2972]: this class should expose observedAttributes as necessary
    class Ctor extends HTMLElement {
        constructor() {
            super();
            upgradeCallback(this);
        }
    }

    // Do not unnecessarily add a connectedCallback/disconnectedCallback, as it introduces perf overhead
    // See: https://github.com/salesforce/lwc/pull/3162#issuecomment-1311851174
    if (hasConnectedCallback) {
        (Ctor.prototype as any).connectedCallback = function () {
            connectedCallback(this);
        };
    }

    if (hasDisconnectedCallback) {
        (Ctor.prototype as any).disconnectedCallback = function () {
            disconnectedCallback(this);
        };
    }

    return Ctor;
};

export const createCustomElementUsingNativeConstructor = (
    tagName: string,
    upgradeCallback: LifecycleCallback,
    connectedCallback?: LifecycleCallback,
    disconnectedCallback?: LifecycleCallback
) => {
    if (!isUndefined(customElements.get(tagName))) {
        throw new Error(
            `Unexpected tag name "${tagName}". This name is a registered custom element, preventing LWC to upgrade the element.`
        );
    }
    const Ctor = createConstructor(upgradeCallback, connectedCallback, disconnectedCallback);
    customElements.define(tagName, Ctor);
    return new Ctor();
};
