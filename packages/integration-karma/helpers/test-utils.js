/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

window.TestUtils = (function (lwc, jasmine, beforeAll) {
    function pass() {
        return {
            pass: true,
        };
    }

    function fail(message) {
        return {
            pass: false,
            message: message,
        };
    }

    // TODO: #869 - Replace this custom spy with standard spyOn jasmine spy when logWarning doesn't use console.group
    // anymore. On IE11 console.group has a different behavior when the F12 inspector is attached to the page.
    function spyConsole() {
        var originalConsole = window.console;

        var calls = {
            log: [],
            warn: [],
            error: [],
            group: [],
            groupEnd: [],
        };

        window.console = {
            log : function(){
                calls.log.push(Array.prototype.slice.call(arguments));
            },
            warn : function(){
                calls.warn.push(Array.prototype.slice.call(arguments));
            },
            error : function(){
                calls.error.push(Array.prototype.slice.call(arguments));
            },
            group : function(){
                calls.group.push(Array.prototype.slice.call(arguments));
            },
            groupEnd: function() {
                calls.groupEnd.push(Array.prototype.slice.call(arguments));
            }
        };

        return {
            calls: calls,
            reset: function() {
                window.console = originalConsole;
            },
        };
    }

    // TODO: #869 - Improve lookup logWarning doesn't use console.group anymore.
    function consoleDevMatcherFactory(methodName, internalMethodName) {
        return function consoleDevMatcher() {
            return {
                compare: function compare(actual, expectedMessage) {
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
                        throw new Error('Expected function to throw error.');
                    } else if (typeof expectedMessage !== 'string' && !(expectedMessage instanceof RegExp)) {
                        throw new Error('Expected a string or a RegExp to compare the thrown error against.');
                    }

                    var spy = spyConsole();

                    try {
                        actual();
                    } finally {
                        spy.reset();
                    }

                    var callsArgs = spy.calls[internalMethodName || methodName];
                    var formattedCalls = callsArgs.map(function (callArgs) {
                        return '"' + formatConsoleCall(callArgs) + '"';
                    }).join(', ');

                    if (process.env.NODE_ENV === 'production') {
                        if (callsArgs.length !== 0) {
                            fail('Expected console.' + methodName + ' to never called in production mode, but it was called ' + callsArgs.length + ' with ' + formattedCalls + '.');
                        } else {
                            return pass();
                        }
                    } else {
                        if (callsArgs.length === 0) {
                            return fail('Expected console.' + methodName + ' to called once with "' + expectedMessage + '", but was never called.');
                        } else if (callsArgs.length === 1) {
                            var actualMessage = formatConsoleCall(callsArgs[0]);

                            if (!matchMessage(actualMessage)) {
                                return fail('Expected console.' + methodName + ' to be called with "' + expectedMessage + '", but was called with "' + actualMessage + '".');
                            } else {
                                return pass();
                            }
                        } else {
                            return fail('Expected console.' + methodName + ' to never called, but it was called ' + callsArgs.length + ' with ' + formattedCalls + '.');
                        }
                    }
                }
            }
        }
    }

    var customMatchers = {
        toLogWarningDev: consoleDevMatcherFactory('warn', 'group'),
        toLogErrorDev: consoleDevMatcherFactory('error'),
        toThrowErrorDev: function toThrowErrorDev() {
            return {
                compare: function(actual, expectedErrorCtor, expectedMessage) {
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
                        return thrown.name + ' with message "' + thrown.message + '"';
                    }

                    if (typeof actual !== 'function') {
                        throw new Error('Expected function to throw error.');
                    } else if (typeof actual !== 'function' || expectedErrorCtor.prototype instanceof Error) {
                        throw new Error('Expected an error constructor.');
                    } else if (typeof expectedMessage !== 'string' && !(expectedMessage instanceof RegExp)) {
                        throw new Error('Expected a string or a RegExp to compare the thrown error against.');
                    }

                    let thrown;

                    try {
                        actual();
                    } catch (error) {
                        thrown = error;
                    }

                    if (process.env.NODE_ENV === 'production') {
                        if (thrown !== undefined) {
                            return fail('Expected function not to throw an error in production mode, but it threw ' + throwDescription(thrown) + '.');
                        } else {
                            return pass();
                        }
                    } else {
                        if (thrown === undefined) {
                            return fail('Expected function to throw an ' + expectedErrorCtor.name + ' error in development mode with message "' + expectedMessage + '".');
                        } else if (!matchError(thrown)) {
                            return fail('Expected function to throw an ' + expectedErrorCtor.name + ' error in development mode with message "' + expectedMessage + '", but it threw ' + throwDescription(thrown) + '.');
                        } else {
                            return pass();
                        }
                    }
                }
            }
        },
    };

    beforeAll(function() {
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

