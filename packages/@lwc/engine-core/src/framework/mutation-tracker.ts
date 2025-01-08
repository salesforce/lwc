/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isFunction, isNull, isObject, isTrustedSignal } from '@lwc/shared';
import { ReactiveObserver, valueMutated, valueObserved } from '../libs/mutation-tracker';
import { subscribeToSignal } from '../libs/signal-tracker';
import { safeHasProp } from './utils';
import type { Signal } from '@lwc/signals';
import type { JobFunction, CallbackFunction } from '../libs/mutation-tracker';
import type { VM } from './vm';

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
    const { component, tro } = vm;
    // On the server side, we don't need mutation tracking. Skipping it improves performance.
    if (process.env.IS_BROWSER) {
        valueObserved(component, key);
    }

    // The portion of reactivity that's exposed to signals is to subscribe a callback to re-render the VM (templates).
    // We check the following to ensure re-render is subscribed at the correct time.
    //  1. The template is currently being rendered (there is a template reactive observer)
    //  2. There was a call to a getter to access the signal (happens during vnode generation)
    if (
        lwcRuntimeFlags.ENABLE_EXPERIMENTAL_SIGNALS &&
        isObject(target) &&
        !isNull(target) &&
        safeHasProp(target, 'value') &&
        safeHasProp(target, 'subscribe') &&
        isFunction(target.subscribe) &&
        isTrustedSignal(target) &&
        // Only subscribe if a template is being rendered by the engine
        tro.isObserving()
    ) {
        // Subscribe the template reactive observer's notify method, which will mark the vm as dirty and schedule hydration.
        subscribeToSignal(component, target as Signal<unknown>, tro.notify.bind(tro));
    }
}

export function createReactiveObserver(callback: CallbackFunction): ReactiveObserver {
    // On the server side, we don't need mutation tracking. Skipping it improves performance.
    return process.env.IS_BROWSER ? new ReactiveObserver(callback) : DUMMY_REACTIVE_OBSERVER;
}

export * from '../libs/mutation-tracker';
export * from '../libs/signal-tracker';
