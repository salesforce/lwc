/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    JobFunction,
    CallbackFunction,
    ReactiveObserver,
    valueMutated,
    valueObserved,
} from '../libs/mutation-tracker';
import { VM } from './vm';

const DUMMY_REACTIVE_OBSERVER = {
    observe(job: JobFunction) {
        job();
    },
    reset() {},
    link() {},
} as unknown as ReactiveObserver;

export function componentValueMutated(vm: VM, key: PropertyKey) {
    // On the server side, we don't need mutation tracking. Skipping it improves performance.
    if (process.env.IS_BROWSER) {
        valueMutated(vm.component, key);
    }
}

export function componentValueObserved(vm: VM, key: PropertyKey, target: any = {}) {
    // On the server side, we don't need mutation tracking. Skipping it improves performance.
    if (process.env.IS_BROWSER) {
        valueObserved(vm.component, key);
    }

    // Putting this here for now, the idea is to subscribe to a signal when there is an active template reactive observer.
    // This would indicate that:
    //      1. The template is currently being rendered
    //      2. There was a call to a getter bound to the LWC class
    // With this information we can infer that it is safe to subscribe the re-render callback to the signal, which will
    // mark the VM as dirty and schedule rehydration.
    if (
        target &&
        typeof target === 'object' &&
        'value' in target &&
        'subscribe' in target &&
        typeof target.subscribe === 'function'
    ) {
        if (vm.tro.isObserving()) {
            try {
                // In a future optimization, rather than re-render the entire VM we could use fine grained reactivity here
                // to only re-render the part of the DOM that has been changed by the signal.
                // jtu-todo: this will subscribe multiple functions since the callback is always different, look for a way to deduplicate this
                const unsubscribe = target.subscribe(() => vm.tro.notify());
                vm.tro.link(unsubscribe);
            } catch (e) {
                // throw away for now
            }
        }
    }
}

export function createReactiveObserver(callback: CallbackFunction): ReactiveObserver {
    // On the server side, we don't need mutation tracking. Skipping it improves performance.
    return process.env.IS_BROWSER ? new ReactiveObserver(callback) : DUMMY_REACTIVE_OBSERVER;
}

export * from '../libs/mutation-tracker';
