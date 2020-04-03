/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

function spyGlobalErrors() {
    const originalHandler = window.onerror;

    const result = {
        error: undefined,
        reset() {
            window.onerror = originalHandler;
        },
    };

    window.onerror = function(message, source, lineno, colno, error) {
        result.error = error;
        return true; // jest prevents the default error handling behavior
    };

    return result;
}

function pass() {
    return {
        pass: true,
    };
}

function fail(message) {
    return {
        pass: false,
        message: () => message,
    };
}

module.exports = {
    // This handles errors that are dispatched to the global object
    // For example, errors that occur during the connectedCallback or disconnectedCallback of a
    // Web Component are not captured by expect().toThrow()
    toThrowGlobalError: function matcher(fn, expected) {
        if (typeof fn !== 'function') {
            throw new TypeError(
                `Expected a first argument to be a function, received ${typeof fn}`
            );
        }

        spyGlobalErrors();

        const spy = spyGlobalErrors();
        let thrown;

        try {
            fn();
        } catch (error) {
            thrown = error;
        } finally {
            spy.reset();
            // Verify there were no other errors thrown during fn()
            if (thrown === undefined) {
                thrown = spy.error;
            }
        }

        if (this.isNot) {
            if (thrown !== undefined) {
                return fail(`Expect no error but received:\n${this.utils.printReceived(thrown)}`);
            }

            return pass();
        } else {
            if (thrown === undefined) {
                return fail(
                    `Expect to throw error \n${this.utils.printExpected(
                        expected
                    )} \n but none thrown`
                );
            } else if (expected !== undefined) {
                if (typeof expected === 'string') {
                    return thrown.message.includes(expected)
                        ? pass()
                        : fail(
                              `Expected to throw an error with message ${expected} but received ${thrown.message}`
                          );
                } else if (typeof expected === 'function') {
                    return thrown instanceof expected
                        ? pass()
                        : fail(
                              `Expected to throw an error of type ${expected} but received ${thrown}`
                          );
                } else if (expected instanceof Error) {
                    return expected.message === thrown.message
                        ? pass()
                        : fail(
                              `Expected to throw an error with message ${expected.message} but received ${thrown.message}`
                          );
                } else if (expected.test) {
                    return expected.test(thrown.message)
                        ? pass()
                        : fail(
                              `Expected to throw an error that matches ${expected} but received ${thrown.message}`
                          );
                } else {
                    return fail(
                        `"expected" argument must either be a string or a class or a error object or a regular expression`
                    );
                }
            }
            return pass();
        }
    },
};
