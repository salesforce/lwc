/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { guid } from '../utils';
import type { VM } from '../vm';
import type {
    ContextConsumer,
    ContextProvider,
    ContextProviderOptions,
    ContextValue,
    RegisterContextProviderFn,
    WireAdapterConstructor,
    WireContextSubscriptionPayload,
    WireDef,
} from './types';

const AdapterToTokenMap: Map<WireAdapterConstructor, string> = new Map();

export function createContextProviderWithRegister(
    adapter: WireAdapterConstructor,
    registerContextProvider: RegisterContextProviderFn
): ContextProvider {
    if (AdapterToTokenMap.has(adapter)) {
        throw new Error(`Adapter already has a context provider.`);
    }
    const adapterContextToken = guid();
    AdapterToTokenMap.set(adapter, adapterContextToken);
    const providers = new WeakSet<EventTarget>();

    return (elmOrComponent: EventTarget, options: ContextProviderOptions) => {
        if (providers.has(elmOrComponent)) {
            throw new Error(`Adapter was already installed on ${elmOrComponent}.`);
        }
        providers.add(elmOrComponent);

        const { consumerConnectedCallback, consumerDisconnectedCallback } = options;

        registerContextProvider(
            elmOrComponent,
            adapterContextToken,
            (subscriptionPayload: WireContextSubscriptionPayload) => {
                const { setNewContext, setDisconnectedCallback } = subscriptionPayload;
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
                setDisconnectedCallback?.(disconnectCallback);

                consumerConnectedCallback(consumer);
                // Return true as the context is always consumed here and the consumer should
                // stop bubbling.
                return true;
            }
        );
    };
}

export function createContextWatcher(
    vm: VM,
    wireDef: WireDef,
    callbackWhenContextIsReady: (newContext: ContextValue) => void
) {
    const { adapter } = wireDef;
    const adapterContextToken = AdapterToTokenMap.get(adapter);
    if (isUndefined(adapterContextToken)) {
        return; // no provider found, nothing to be done
    }
    const {
        elm,
        context: { wiredConnecting, wiredDisconnecting },
        renderer: { registerContextConsumer },
    } = vm;
    // waiting for the component to be connected to formally request the context via the token
    wiredConnecting.push(() => {
        registerContextConsumer(elm, adapterContextToken, {
            setNewContext: function (newContext) {
                callbackWhenContextIsReady(newContext);
                return true;
            },
            setDisconnectedCallback: function (disconnectCallback) {
                wiredDisconnecting.push(disconnectCallback);
            },
        });
    });
}
