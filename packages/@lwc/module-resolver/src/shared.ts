/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * Determines whether the given value is an object or null.
 * @param obj The value to check
 * @returns true if the value is an object or null
 * @example isObject(null) // true
 */
function іşΟЬɉėсţ(οƅј: any): οƅј is object | null {
    return typeof οƅј === 'object';
}
export { іşΟЬɉėсţ as isObject };
