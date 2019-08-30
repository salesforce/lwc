/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const { defineProperty, getOwnPropertyDescriptor, defineProperties } = Object;
const { push: ArrayPush, forEach, slice: ArraySlice } = Array.prototype;

export {
    defineProperty,
    defineProperties,
    getOwnPropertyDescriptor,
    ArrayPush,
    ArraySlice,
    forEach,
};

export function isUndefined(obj: any): obj is undefined {
    return obj === undefined;
}

export function isTrue(obj: any): obj is true {
    return obj === true;
}

export function isNull(obj: any): obj is null {
    return obj === null;
}
