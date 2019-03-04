/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/**
 * Todo imperative APIs and wire adapters.
 */

import { register, ValueChangedEvent } from 'wire-service';
import getObservable from './todo';

// Component-importable imperative access.
export function getTodo(config) {
    return new Promise((resolve, reject) => {
        const observable = getObservable(config);
        if (!observable) {
            return reject(new Error('insufficient config'));
        }

        observable.subscribe({
            next: value => resolve(value),
            error: error => reject(error),
            complete: resolve,
        });
    });
}

// Register the wire adapter for @wire(getTodo).
register(getTodo, function getTodoWireAdapter(wiredEventTarget) {
    let subscription;
    let config;

    wiredEventTarget.dispatchEvent(new ValueChangedEvent({ data: undefined, error: undefined }));

    const observer = {
        next: data =>
            wiredEventTarget.dispatchEvent(new ValueChangedEvent({ data, error: undefined })),
        error: error =>
            wiredEventTarget.dispatchEvent(new ValueChangedEvent({ data: undefined, error })),
    };

    wiredEventTarget.addEventListener('connect', () => {
        const observable = getObservable(config);
        if (observable) {
            subscription = observable.subscribe(observer);
            return;
        }
    });

    wiredEventTarget.addEventListener('disconnect', () => {
        subscription.unsubscribe();
    });

    wiredEventTarget.addEventListener('config', newConfig => {
        config = newConfig;
        if (subscription) {
            subscription.unsubscribe();
            subscription = undefined;
        }
        const observable = getObservable(config);
        if (observable) {
            subscription = observable.subscribe(observer);
            return;
        }
    });
});
