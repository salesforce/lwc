/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined, ArrayIndexOf } from '@lwc/shared';
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
        throw new Error(`Adapter already have a context provider.`);
    }
    adapterContextToken = guid();
    setAdapterToken(adapter, adapterContextToken);
    const providers: EventTarget[] = [];

    return (elm: EventTarget, options: ContextProviderOptions) => {
        if (ArrayIndexOf.call(providers, elm) !== -1) {
            throw new Error(`Adapter was already installed on ${elm}.`);
        }
        providers.push(elm);

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
