/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isFalse } from './assert';

let trustedSignals: WeakSet<object> | undefined;

export function setTrustedSignalSet(signals: WeakSet<object>) {
    isFalse(trustedSignals, 'Trusted Signal Set is already set!');

    trustedSignals = signals;

    // Only used in LWC's Karma. Contained within the set function as there are multiple imports of
    // this module. Placing it here ensures we reference the import where the trustedSignals set is maintained
    if (process.env.NODE_ENV === 'test-karma-lwc') {
        // Used to reset the global state between test runs
        (globalThis as any).__lwcResetTrustedSignalsSetForTest = () => (trustedSignals = undefined);
    }
}

export function addTrustedSignal(signal: object) {
    // This should be a no-op when the trustedSignals set isn't set by runtime
    trustedSignals?.add(signal);
}

/**
 * The legacy validation behavior was that this check should only
 * be performed for runtimes that have provided a trustedSignals set.
 * However, this resulted in a bug as all object values were
 * being considered signals in environments where the trustedSignals
 * set had not been defined. The runtime flag has been added as a killswitch
 * in case the fix needs to be reverted.
 */
export function legacyIsTrustedSignal(target: object): boolean {
    if (!trustedSignals) {
        // The runtime didn't set a trustedSignals set
        // this check should only be performed for runtimes that care about filtering signals to track
        // our default behavior should be to track all signals
        return true;
    }
    return trustedSignals.has(target);
}

export function isTrustedSignal(target: object): boolean {
    if (!trustedSignals) {
        return false;
    }
    return trustedSignals.has(target);
}
