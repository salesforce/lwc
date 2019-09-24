/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { valueMutated, valueObserved } from '../libs/mutation-tracker';
import { VM } from './vm';

export function componentValueMutated(vm: VM, key: PropertyKey) {
    valueMutated(vm.component, key);
}

export function componentValueObserved(vm: VM, key: PropertyKey) {
    valueObserved(vm.component, key);
}

export * from '../libs/mutation-tracker';
