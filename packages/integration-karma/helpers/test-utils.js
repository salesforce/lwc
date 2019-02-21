/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

window.TestUtils = (function (lwc, jasmine, beforeAll) {
    function pass() {
        return {
            pass: true
        };
    }

    function fail(message) {
        return {
            pass: false,
            message,
        };
    }

    // TODO: #869 - Improve lookup logWarning doesn't use console.group anymore.
    function consoleDevMatcher(methodName, internalMethodName) {
        return function matcher() {
            return {
                compare(actual, expectedMessage) {
                    function matchMessage(message) {
                        if (typeof expectedMessage === 'string') {
                            return message === expectedMessage;
                        } else {
                            return expectedMessage.test(message);
                        }
                    }

                    function formatConsoleCall(args) {
                        return args.map(String).join(' ');
                    }

                    if (typeof actual !== 'function') {
                        throw new Error(`Expected function to throw error.`);
                    } else if (typeof expectedMessage !== 'string' && !(expectedMessage instanceof RegExp)) {
                        throw new Error(`Expected a string or a RegExp to compare the thrown error against.`);
                    }

                    spyOnAllFunctions(console);
                    actual();

                    /* eslint-disable-next-line no-console */
                    const callsArgs = console[internalMethodName || methodName].calls.allArgs();
                    const formattedCalls = callsArgs.map(callArgs => `"${formatConsoleCall(callArgs)}"`).join(', ');

                    if (process.env.NODE_ENV === 'production') {
                        if (callsArgs.length !== 0) {
                            fail(`Expected console.${methodName} to never called in production mode, but it was called ${callsArgs.length} with ${formattedCalls}.`);
                        } else {
                            return pass();
                        }
                    } else {
                        if (callsArgs.length === 0) {
                            return fail(`Expected console.${methodName} to called once with "${expectedMessage}", but was never called.`);
                        } else if (callsArgs.length === 1) {
                            const actualMessage = formatConsoleCall(callsArgs[0]);

                            if (!matchMessage(actualMessage)) {
                                return fail(`Expected console.${methodName} to be called with "${expectedMessage}", but was called with "${actualMessage}".`);
                            } else {
                                return pass();
                            }
                        } else {
                            return fail(`Expected console.${methodName} to never called, but it was called ${callsArgs.length} with ${formattedCalls}.`);
                        }
                    }
                }
            }
        }
    }

    const customMatchers = {
        toLogWarningDev: consoleDevMatcher('warn', 'group'),
        toLogErrorDev: consoleDevMatcher('error'),
        toThrowErrorDev() {
            return {
                compare(actual, expectedErrorCtor, expectedMessage) {
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

                    if (process.env.NODE_ENV === 'production') {
                        if (thrown !== undefined) {
                            return fail(`Expected function not to throw an error in production mode, but it threw ${throwDescription(thrown)}.`);
                        } else {
                            return pass();
                        }
                    } else {
                        if (thrown === undefined) {
                            return fail(`Expected function to throw an ${expectedErrorCtor.name} error in development mode with message "${expectedMessage}".`);
                        } else if (!matchError(thrown)) {
                            return fail(`Expected function to throw an ${expectedErrorCtor.name} error in development mode with message "${expectedMessage}", but it threw ${throwDescription(thrown)}.`);
                        } else {
                            return pass();
                        }
                    }
                }
            }
        },
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

