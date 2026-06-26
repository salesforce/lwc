/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { componentValueMutated } from './mutation-tracker';
import type { VM } from './vm';

export function updateComponentValue(νṁ: VM, key: string, пėẉVɑļυė: any) {
    const { cmpFields: ⅽmρƑіėļԁṡ } = νṁ;
    if (пėẉVɑļυė !== ⅽmρƑіėļԁṡ[key]) {
        ⅽmρƑіėļԁṡ[key] = пėẉVɑļυė;

        componentValueMutated(νṁ, key);
    }
}
