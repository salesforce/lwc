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

export function componentValueObserved(vm: VM, key: PropertyKey) {
    // On the server side, we don't need mutation tracking. Skipping it improves performance.
    if (process.env.IS_BROWSER) {
        valueObserved(vm.component, key);
    }
}

export function createReactiveObserver(callback: CallbackFunction): ReactiveObserver {
    // On the server side, we don't need mutation tracking. Skipping it improves performance.
    return process.env.IS_BROWSER ? new ReactiveObserver(callback) : DUMMY_REACTIVE_OBSERVER;
}

export * from '../libs/mutation-tracker';
