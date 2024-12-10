/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import type { ExpectationResult, MatcherState } from '@vitest/expect';

export function toThrowErrorWithType(
    this: MatcherState,
    received: any,
    ctor: ErrorConstructor,
    message?: string
): ExpectationResult {
    let error: Error | undefined;

    try {
        received();
    } catch (err: any) {
        error = err;
    }

    if (error === undefined) {
        return {
            message: () => 'Received function did not throw',
            pass: false,
        };
    }

    if (error === null || typeof error !== 'object' || error.constructor !== ctor) {
        return {
            message: () => 'Expected function to throw an instance of',
            expected: ctor.name,
            actual: error.constructor.name,
            pass: false,
        };
    }

    if (error.message !== message) {
        return {
            message: () => 'Expected function to throw an error with message',
            expected: message,
            actual: error.message,
            pass: false,
        };
    }

    return {
        message: () => 'Expected function not to throw an error',
        pass: true,
    };
}
