/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isFalse, isFunction, isUndefined } from '@lwc/shared';
import { Signal } from '@lwc/signals';
import { logWarnOnce } from '../../shared/logger';

/**
 * This map keeps track of objects to signals. There is an assumption that the signal is strongly referenced
 * on the object which allows the SignalTracker to be garbage collected along with the object.
 */
const TargetToSignalTrackerMap = new WeakMap<object, SignalTracker>();

function getSignalTracker(target: object) {
    let signalTracker = TargetToSignalTrackerMap.get(target);
    if (isUndefined(signalTracker)) {
        signalTracker = new SignalTracker();
        TargetToSignalTrackerMap.set(target, signalTracker);
    }
    return signalTracker;
}

export function subscribeToSignal(
    target: object,
    signal: Signal<unknown>,
    update: CallbackFunction
) {
    const signalTracker = getSignalTracker(target);
    if (isFalse(signalTracker.seen(signal))) {
        signalTracker.subscribeToSignal(signal, update);
    }
}

export function unsubscribeFromSignals(target: object) {
    if (TargetToSignalTrackerMap.has(target)) {
        const signalTracker = getSignalTracker(target);
        signalTracker.unsubscribeFromSignals();
        signalTracker.reset();
    }
}

type CallbackFunction = () => void;

/**
 * This class is used to keep track of the signals associated to a given object.
 * It is used to prevent the LWC engine from subscribing duplicate callbacks multiple times
 * to the same signal. Additionally, it keeps track of all signal unsubscribe callbacks, handles invoking
 * them when necessary and discarding them.
 */
class SignalTracker {
    private signalToUnsubscribeMap: Map<Signal<unknown>, CallbackFunction> = new Map();

    seen(signal: Signal<unknown>) {
        return this.signalToUnsubscribeMap.has(signal);
    }

    subscribeToSignal(signal: Signal<unknown>, update: CallbackFunction) {
        try {
            const unsubscribe = signal.subscribe(update);
            if (isFunction(unsubscribe)) {
                // TODO [#3978]: Evaluate how we should handle the case when unsubscribe is not a function.
                // Long term we should throw an error or log a warning.
                this.signalToUnsubscribeMap.set(signal, unsubscribe);
            }
        } catch (err: any) {
            logWarnOnce(
                `Attempted to subscribe to an object that has the shape of a signal but received the following error: ${
                    err?.stack ?? err
                }`
            );
        }
    }

    unsubscribeFromSignals() {
        try {
            this.signalToUnsubscribeMap.forEach((unsubscribe) => unsubscribe());
        } catch (err: any) {
            logWarnOnce(
                `Attempted to call a signal's unsubscribe callback but received the following error: ${
                    err?.stack ?? err
                }`
            );
        }
    }

    reset() {
        this.signalToUnsubscribeMap.clear();
    }
}
