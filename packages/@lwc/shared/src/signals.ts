/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isFalse } from './assert';

let trustedSignals: WeakSet<object>;

export function setTrustedSignalSet(signals: WeakSet<object>) {
    isFalse(trustedSignals, 'Trusted Signal Set is already set!');

    trustedSignals = signals;
}

export function addTrustedSignal(signal: object) {
    // This should be a no-op when the trustedSignals set isn't set by runtime
    trustedSignals?.add(signal);
}

export function isTrustedSignal(target: object): boolean {
    if (!trustedSignals) {
        return false;
    }
    return trustedSignals.has(target);
}
