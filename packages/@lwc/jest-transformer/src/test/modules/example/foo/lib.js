/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { func } from 'globalLib';

export function globalLibCall() {
    return func();
}

export function echo(p) {
    return p;
}
