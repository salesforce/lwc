/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

window.TestUtils = (function (lwc, jasmine, beforeAll) {
    const customMatchers = {
        toThrowErrorDev() {
            return {
                compare(actual, expectedErrorCtor, expectedMessage) {
                    if (typeof actual !== 'function') {
                        throw new Error(`Expected function to throw error.`);
                    } else if (typeof actual !== 'function' || expectedErrorCtor.prototype instanceof Error) {
                        throw new Error(`Expected an error constructor.`);
                    } else if (typeof expectedMessage !== 'string' && !(expectedMessage instanceof RegExp)) {
                        throw new Error(`Expected a string or a RegExp to compare the thrown error against.`);
                    }

                    let thrown;

                    try {
                        actual();
                    } catch (error) {
                        thrown = error;
                    }

                    function matchMessage(message) {
                        if (typeof expectedMessage === 'string') {
                            return message === expectedMessage;
                        } else {
                            return expectedMessage.test(message);
                        }
                    }

                    function matchError(error) {
                        return error instanceof expectedErrorCtor && matchMessage(error.message);
                    }

                    function throwDescription(thrown) {
                        return `${thrown.name} with message "${thrown.message}"`;
                    }

                    if (process.env.NODE_ENV === 'production') {
                        if (thrown !== undefined) {
                            return {
                                pass: false,
                                message: `Expected function not to throw an error in production mode, but it threw ${throwDescription(thrown)}.`,
                            };
                        } else {
                            return {
                                pass: true,
                            };
                        }
                    } else {
                        if (thrown === undefined) {
                            return {
                                pass: false,
                                message: `Expected function to throw an ${expectedErrorCtor.name} error in development mode with message "${expectedMessage}".`,
                            }
                        } else if (!matchError(thrown)) {
                            return {
                                pass: false,
                                message: `Expected function to throw an ${expectedErrorCtor.name} error in development mode with message "${expectedMessage}", but it threw ${throwDescription(thrown)}.`,
                            };
                        } else {
                            return {
                                pass: true,
                            };
                        }
                    }
                }
            }
        }
    };

    beforeAll(() => {
        jasmine.addMatchers(customMatchers);
    });

    function createElement(name, config) {
        config = Object.assign({}, config, {
            fallback: !process.env.NATIVE_SHADOW
        });

        return lwc.createElement(name, config);
    }

    return {
        createElement: createElement,
    };
})(Engine, jasmine, beforeAll);

