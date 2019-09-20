/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined, ArrayIndexOf } from '../shared/language';
import { guid } from './utils';
import { WireAdapterConstructor, ContextValue, getAdapterToken, setAdapterToken } from './wiring';

type WireContextDisconnectCallback = () => void;
type WireContextInternalProtocolCallback = (
    newContext: ContextValue,
    disconnectCallback: WireContextDisconnectCallback
) => void;
interface ContextConsumer {
    provide(newContext: ContextValue): void;
}

interface WireContextEvent extends CustomEvent {
    detail: WireContextInternalProtocolCallback;
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
    const providers = [];
    return (elm: EventTarget, options: ContextProviderOptions) => {
        if (ArrayIndexOf.call(providers, elm) !== -1) {
            throw new Error(`Adapter was already installed on ${elm}.`);
        }
        const { consumerConnectedCallback, consumerDisconnectedCallback } = options;
        elm.addEventListener(adapterContextToken as string, (evt: WireContextEvent) => {
            const { detail } = evt;
            const consumer: ContextConsumer = {
                provide(newContext) {
                    detail(newContext, disconnectCallback);
                },
            };
            const disconnectCallback = () => {
                if (!isUndefined(consumerDisconnectedCallback)) {
                    consumerDisconnectedCallback(consumer);
                }
            };
            consumerConnectedCallback(consumer);
        });
    };
}
