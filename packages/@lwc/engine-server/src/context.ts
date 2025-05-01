/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { createContextProviderWithRegister, getAssociatedVMIfPresent } from '@lwc/engine-core';
import { isUndefined, isNull } from '@lwc/shared';
import {
    HostNodeType,
    HostTypeKey,
    HostParentKey,
    HostHostKey,
    HostContextProvidersKey,
} from './types';
import type { HostElement, HostParentNode } from './types';
import type {
    LightningElement,
    WireAdapterConstructor,
    WireContextSubscriptionPayload,
    WireContextSubscriptionCallback,
} from '@lwc/engine-core';

export function createContextProvider(adapter: WireAdapterConstructor) {
    return createContextProviderWithRegister(adapter, registerContextProvider);
}

export function registerContextProvider(
    elm: HostElement | LightningElement,
    adapterContextToken: string,
    onContextSubscription: WireContextSubscriptionCallback
) {
    const vm = getAssociatedVMIfPresent(elm);
    if (!isUndefined(vm)) {
        elm = vm.elm;
    }

    const contextProviders = (elm as HostElement)[HostContextProvidersKey];
    if (isUndefined(contextProviders)) {
        throw new Error('Unable to register context provider on provided `elm`.');
    }
    contextProviders.set(adapterContextToken, onContextSubscription);
}

export function registerContextConsumer(
    elm: HostElement,
    adapterContextToken: string,
    subscriptionPayload: WireContextSubscriptionPayload
) {
    // Traverse element ancestors, looking for an element that can provide context
    // for the adapter identified by `adapterContextToken`. If found, register
    // to receive context updates from that provider.
    let currentNode: HostParentNode | null = elm;
    do {
        if (currentNode[HostTypeKey] === HostNodeType.Element) {
            const subscribeToProvider =
                currentNode[HostContextProvidersKey].get(adapterContextToken);
            if (!isUndefined(subscribeToProvider)) {
                // If context subscription is successful, top traversing to find a provider
                if (subscribeToProvider(subscriptionPayload) !== false) {
                    break;
                }
            }
        }

        currentNode =
            currentNode[HostTypeKey] === HostNodeType.Element
                ? currentNode[HostParentKey]
                : currentNode[HostHostKey];
    } while (!isNull(currentNode));
}
