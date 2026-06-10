/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { componentValueMutated as ⅽоṁṗоṅёпṫѴɑļυėṀυṫαtėɗ } from './mutation-tracker';
import type { VM as ѴМ } from './vm';

export function updateComponentValue(vm: ѴМ, key: string, newValue: any) {
    const { cmpFields } = vm;
    if (newValue !== cmpFields[key]) {
        cmpFields[key] = newValue;

        ⅽоṁṗоṅёпṫѴɑļυėṀυṫαtėɗ(vm, key);
    }
}
