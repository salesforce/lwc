/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined } from '@lwc/shared';
import { guid } from './utils';
import {
    WireAdapterConstructor,
    ContextValue,
    getAdapterToken,
    setAdapterToken,
    WireContextRegistrationEvent,
} from './wiring';

interface ContextConsumer {
    provide(newContext: ContextValue): void;
}

interface ContextProviderOptions {
    consumerConnectedCallback: (consumer: ContextConsumer) => void;
    consumerDisconnectedCallback?: (consumer: ContextConsumer) => void;
}

// this is lwc internal implementation
export function createContextProvider(adapter: WireAdapterConstructor) {
    let adapterContextToken = getAdapterToken(adapter);
    if (!isUndefined(adapterContextToken)) {
        throw new Error(`Adapter already has a context provider.`);
    }
    adapterContextToken = guid();
    setAdapterToken(adapter, adapterContextToken);
    const providers = new WeakSet<EventTarget>();

    return (elm: EventTarget, options: ContextProviderOptions) => {
        if (providers.has(elm)) {
            throw new Error(`Adapter was already installed on ${elm}.`);
        }
        providers.add(elm);

        const { consumerConnectedCallback, consumerDisconnectedCallback } = options;
        elm.addEventListener(
            adapterContextToken as string,
            ((evt: WireContextRegistrationEvent) => {
                const { setNewContext, setDisconnectedCallback } = evt;

                const consumer: ContextConsumer = {
                    provide(newContext) {
                        setNewContext(newContext);
                    },
                };
                const disconnectCallback = () => {
                    if (!isUndefined(consumerDisconnectedCallback)) {
                        consumerDisconnectedCallback(consumer);
                    }
                };
                setDisconnectedCallback(disconnectCallback);

                consumerConnectedCallback(consumer);
                evt.stopImmediatePropagation();
            }) as EventListener
        );
    };
}
