/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isFalse } from './assert';

export const ContextEventName = 'lightning:context-request';

let trustedContext: WeakSet<object>;

export type ContextKeys = {
    connectContext: symbol;
    disconnectContext: symbol;
};

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
