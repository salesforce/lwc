/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

export type OnUpdate = () => void;
export type Unsubscribe = () => void;

export interface Signal<ValueShape> {
    get value(): ValueShape;
    subscribe(onUpdate: OnUpdate): Unsubscribe;
}

export abstract class SignalBaseClass<ValueShape> implements Signal<ValueShape> {
    abstract get value(): ValueShape;

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
