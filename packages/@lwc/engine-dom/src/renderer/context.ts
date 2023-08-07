/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import {
    createContextProviderWithRegister,
    WireAdapterConstructor,
    WireContextValue,
    WireContextSubscriptionPayload,
    WireContextSubscriptionCallback,
} from '@lwc/engine-core';
import { addEventListener, dispatchEvent } from './index';

export class WireContextSubscriptionEvent extends CustomEvent<undefined> {
    // These are initialized on the constructor via defineProperties.
    public readonly setNewContext!: (newContext: WireContextValue) => void;
    public readonly setDisconnectedCallback!: (disconnectCallback: () => void) => void;

    constructor(
        adapterToken: string,
        { setNewContext, setDisconnectedCallback }: WireContextSubscriptionPayload
    ) {
        super(adapterToken, {
            bubbles: true,
            composed: true,
        });

        this.setNewContext = setNewContext;
        this.setDisconnectedCallback = setDisconnectedCallback;
    }
}

export function createContextProvider(adapter: WireAdapterConstructor) {
    return createContextProviderWithRegister(adapter, registerContextProvider);
}

export function registerContextConsumer(
    elm: Node,
    adapterContextToken: string,
    subscriptionPayload: WireContextSubscriptionPayload
) {
    dispatchEvent(elm, new WireContextSubscriptionEvent(adapterContextToken, subscriptionPayload));
}

export function registerContextProvider(
    elm: Node,
    adapterContextToken: string,
    onContextSubscription: WireContextSubscriptionCallback
) {
    addEventListener(elm, adapterContextToken, ((evt: WireContextSubscriptionEvent) => {
        evt.stopImmediatePropagation();
        const { setNewContext, setDisconnectedCallback } = evt;
        onContextSubscription({
            setNewContext,
            setDisconnectedCallback,
        });
    }) as EventListener);
}
