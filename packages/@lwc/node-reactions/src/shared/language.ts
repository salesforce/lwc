/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

const {
    create,
    defineProperty,
    getOwnPropertyDescriptor,
    defineProperties,
    hasOwnProperty,
} = Object;
const { push: ArrayPush, forEach } = Array.prototype;

const { charCodeAt: StringCharCodeAt } = String.prototype;

export {
    create,
    StringCharCodeAt,
    defineProperty,
    defineProperties,
    getOwnPropertyDescriptor,
    hasOwnProperty,
    ArrayPush,
    forEach,
};

export function isUndefined(obj: any): obj is undefined {
    return obj === undefined;
}

export function isTrue(obj: any): obj is true {
    return obj === true;
}
