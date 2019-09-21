/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { valueMutated } from '../libs/mutation-tracker';
import { VM } from './vm';
// import { isFalse } from "@lwc/shared";

export function componentValueMutated(vm: VM, key: PropertyKey) {
    const { component } = vm;
    // if (isFalse(vm.isDirty)) {
    valueMutated(component, key);
    // }
}

export * from '../libs/mutation-tracker';
