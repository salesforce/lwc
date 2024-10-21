/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import type { Signal } from '@lwc/signals';

const trustedSignals = new WeakSet<Signal<unknown>>();

export function addTrustedSignal(signal: Signal<unknown>) {
    trustedSignals.add(signal);
}

export function isTrustedSignal(signal: Signal<unknown>): boolean {
    return trustedSignals.has(signal);
}
