/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { addTrustedSignal } from '@lwc/engine-dom';

export type OnUpdate = () => void;
export type Unsubscribe = () => void;

export interface Signal<T> {
    get value(): T;
    subscribe(onUpdate: OnUpdate): Unsubscribe;
}

export abstract class SignalBaseClass<T> implements Signal<T> {
    constructor() {
        // Add the signal to the set of trusted signals
        // This allows the lwc-engine to track the signal and trigger re-renders when the signal changes
        addTrustedSignal(this);
    }

    abstract get value(): T;

    private subscribers: Set<OnUpdate> = new Set();

    subscribe(onUpdate: OnUpdate) {
        this.subscribers.add(onUpdate);
        return () => {
            this.subscribers.delete(onUpdate);
        };
    }

    protected notify() {
        for (const subscriber of this.subscribers) {
            subscriber();
        }
    }
}
