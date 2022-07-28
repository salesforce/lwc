/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { VM } from './vm';
import { componentValueMutated } from './mutation-tracker';

export function updateComponentValue(vm: VM, key: string, newValue: any) {
    const { cmpFields } = vm;
    if (newValue !== cmpFields[key]) {
        cmpFields[key] = newValue;

        componentValueMutated(vm, key);
    }
}
