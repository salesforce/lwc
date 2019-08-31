/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { create } = Object;

export { create };

export function isTrue(value: any): value is true {
    return value === true;
}

export function isFalse(value: any): value is false {
    return value === false;
}
