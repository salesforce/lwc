/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/**
 *
 * @param value
 * @param msg
 */
export function invariant(value: any, msg: string): asserts value {
    if (!value) {
        throw new Error(`Invariant Violation: ${msg}`);
    }
}

/**
 *
 * @param value
 * @param msg
 */
export function isTrue(value: any, msg: string): asserts value {
    if (!value) {
        throw new Error(`Assert Violation: ${msg}`);
    }
}

/**
 *
 * @param value
 * @param msg
 */
export function isFalse(value: any, msg: string) {
    if (value) {
        throw new Error(`Assert Violation: ${msg}`);
    }
}

/**
 *
 * @param msg
 */
export function fail(msg: string): never {
    throw new Error(msg);
}
