/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isFalse } from './assert';

let trustedSignals: WeakSet<object>;

export function setSignalValidator(signals: WeakSet<object>) {
    isFalse(trustedSignals, 'Already added a signal validator');

    trustedSignals = signals;
}

export function addTrustedSignal(signal: object) {
    trustedSignals?.add(signal);
}

export function isTrustedSignal(target: object): boolean {
    return trustedSignals?.has(target);
}
