/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { LightningElement } from './lightning-element';
import type {
    WireAdapterConstructor,
    WireContextConsumer,
    WireContextProviderOptions,
} from '@lwc/engine-core';

type SsrContextProvider = (le: LightningElement, options?: WireContextProviderOptions) => void;

const contextfulRelationships = new WeakMap<LightningElement, LightningElement>();
export function establishContextfulRelationship(
    parentLe: LightningElement,
    childLe: LightningElement
): void {
    contextfulRelationships.set(childLe, parentLe);
}

export function getContextfulStack(le: LightningElement): LightningElement[] {
    const contextfulParent = contextfulRelationships.get(le);
    if (!contextfulParent) {
        return [];
    }
    return [contextfulParent, ...getContextfulStack(contextfulParent)];
}

const contextProviders = new WeakMap<
    WireAdapterConstructor,
    WeakMap<LightningElement, OnConsumerConnected>
>();
type OnConsumerConnected = (consumer: WireContextConsumer) => void;

function registerContextProvider(
    adapter: WireAdapterConstructor,
    attachedLe: LightningElement,
    consumerCallback: OnConsumerConnected
) {
    let elementMap = contextProviders.get(adapter);
    if (!elementMap) {
        elementMap = new WeakMap();
        contextProviders.set(adapter, elementMap);
    }
    elementMap.set(attachedLe, consumerCallback);
}

export function connectContext(
    adapter: WireAdapterConstructor,
    contextConsumer: LightningElement,
    onNewValue: (newValue: any) => void
): void {
    const elementMap = contextProviders.get(adapter);
    if (!elementMap) {
        return;
    }
    const contextfulStack = getContextfulStack(contextConsumer);
    for (const ancestor of contextfulStack) {
        const onConsumerConnected = elementMap.get(ancestor);
        if (onConsumerConnected) {
            onConsumerConnected({
                provide(newContextValue) {
                    onNewValue(newContextValue);
                },
            });
            return;
        }
    }
}

export function createContextProvider(adapter: WireAdapterConstructor): SsrContextProvider {
    return (le, options) => {
        if (!(le instanceof LightningElement)) {
            throw new Error('Unable to register context provider on provided `elm`.');
        }
        if (!le.isConnected || !options?.consumerConnectedCallback) {
            return;
        }
        const { consumerConnectedCallback } = options;

        registerContextProvider(adapter, le, (consumer: WireContextConsumer) =>
            consumerConnectedCallback(consumer)
        );
    };
}
