/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/**
 * Returns true if the value is undefined
 * @param {any} o
 */
export function isUndefined(o: any): o is undefined {
    return o === undefined;
}

/**
 * Returns true if the value is a string
 * @param {any} o
 */
export function isString(o: any): o is string {
    return typeof o === 'string';
}

/**
 * Returns true if the value is a boolean
 * @param {any} o
 */
export function isBoolean(o: any): o is boolean {
    return typeof o === 'boolean';
}

/**
 * Returns true if the value is an object
 * @param {any} o
 */
export function isObject(o: any): o is object {
    return typeof o === 'object';
}
