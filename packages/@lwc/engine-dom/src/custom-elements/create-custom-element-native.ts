/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined } from '@lwc/shared';
import type { LifecycleCallback } from '@lwc/engine-core';
let globalOwner: any;

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
            // jtu-todo: Pass in options object to upgradeCallback
            upgradeCallback({ elm: this, owner: globalOwner });
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
    disconnectedCallback?: LifecycleCallback,
    owner?: any
) => {
    if (!isUndefined(customElements.get(tagName))) {
        // jtu-todo: check if the custom element that's passed here is a LightningElement constructor
        // throw an error if it's not.
        // Could do this by caching the results in a
        const Ctor = createConstructor(upgradeCallback, connectedCallback, disconnectedCallback);
        customElements.define(tagName, Ctor);
    }
    try {
        globalOwner = owner;
        return new Ctor();
    } finally {
        globalOwner = undefined;
    }
};
