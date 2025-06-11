/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isFalse } from './assert';
import type { Signal } from '@lwc/signals';

export const ContextEventName = 'lightning:context-request';

let trustedContext: WeakSet<object>;

export type ContextKeys = {
    connectContext: symbol;
    disconnectContext: symbol;
};

export type ContextProvidedCallback = (contextSignal?: object) => void;

export type ContextVarieties = Map<unknown, Signal<unknown>>;

export interface ContextBinding<C extends object> {
    component: C;

    provideContext<V extends object>(contextVariety: V, providedContextSignal: object): void;

    consumeContext<V extends object>(
        contextVariety: V,
        contextProvidedCallback: ContextProvidedCallback
    ): void;
}

let contextKeys: ContextKeys;

export function setContextKeys(config: ContextKeys) {
    isFalse(contextKeys, '`setContextKeys` cannot be called more than once');

    contextKeys = config;
}

export function getContextKeys() {
    return contextKeys;
}

export function setTrustedContextSet(context: WeakSet<object>) {
    isFalse(trustedContext, 'Trusted Context Set is already set!');

    trustedContext = context;
}

export function addTrustedContext(contextParticipant: object) {
    // This should be a no-op when the trustedSignals set isn't set by runtime
    trustedContext?.add(contextParticipant);
}

export function isTrustedContext(target: object): boolean {
    if (!trustedContext) {
        // The runtime didn't set a trustedContext set
        // this check should only be performed for runtimes that care about filtering context participants to track
        return true;
    }
    return trustedContext.has(target);
}
