/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import type { ExpectationResult, MatcherState } from '@vitest/expect';

export function toThrowAggregateError(
    this: MatcherState,
    received: any,
    expectedErrorMessages?: string[]
): ExpectationResult {
    let error: Error | undefined;

    try {
        received();
    } catch (err: any) {
        error = err;
    }

    if (error === undefined) {
        return {
            message: () => 'Expected function to throw an AggregateError, but it did not throw',
            pass: false,
        };
    }

    // Check if it's an AggregateError
    if (!(error instanceof AggregateError)) {
        return {
            message: () =>
                `Expected function to throw an AggregateError, but threw ${error.constructor.name}`,
            expected: 'AggregateError',
            actual: error.constructor.name,
            pass: false,
        };
    }

    // If expectedErrorMessages is provided, validate the errors array
    if (expectedErrorMessages !== undefined) {
        const aggregateError = error as AggregateError;

        // Check if errors array exists and has the expected length
        if (!Array.isArray(aggregateError.errors)) {
            return {
                message: () => 'Expected AggregateError to have an errors array',
                pass: false,
            };
        }

        if (aggregateError.errors.length !== expectedErrorMessages.length) {
            return {
                message: () =>
                    `Expected AggregateError to have ${expectedErrorMessages.length} errors, but has ${aggregateError.errors.length}`,
                expected: expectedErrorMessages.length,
                actual: aggregateError.errors.length,
                pass: false,
            };
        }

        // Check each error message
        for (let i = 0; i < expectedErrorMessages.length; i++) {
            const expectedMessage = expectedErrorMessages[i];
            const actualError = aggregateError.errors[i];

            if (
                typeof actualError === 'object' &&
                actualError !== null &&
                'message' in actualError
            ) {
                const actualMessage = (actualError as Error).message;
                if (!actualMessage.includes(expectedMessage)) {
                    return {
                        message: () =>
                            `Expected error ${i} message to contain "${expectedMessage}", but got "${actualMessage}"`,
                        expected: expectedMessage,
                        actual: actualMessage,
                        pass: false,
                    };
                }
            } else {
                return {
                    message: () =>
                        `Expected error ${i} to be an Error object with a message property`,
                    pass: false,
                };
            }
        }
    }

    return {
        message: () => 'Expected function not to throw an AggregateError',
        pass: true,
    };
}
