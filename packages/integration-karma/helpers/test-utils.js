/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

window.TestUtils = (function(lwc, jasmine, beforeAll) {
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

    // TODO [#869]: Replace this custom spy with standard spyOn jasmine spy when logWarning doesn't use console.group
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
            log: function() {
                calls.log.push(Array.prototype.slice.call(arguments));
            },
            warn: function() {
                calls.warn.push(Array.prototype.slice.call(arguments));
            },
            error: function() {
                calls.error.push(Array.prototype.slice.call(arguments));
            },
            group: function() {
                calls.group.push(Array.prototype.slice.call(arguments));
            },
            groupEnd: function() {
                calls.groupEnd.push(Array.prototype.slice.call(arguments));
            },
        };

        return {
            calls: calls,
            reset: function() {
                window.console = originalConsole;
            },
        };
    }

    function formatConsoleCall(args) {
        return args.map(String).join(' ');
    }

    // TODO [#869]: Improve lookup logWarning doesn't use console.group anymore.
    function consoleDevMatcherFactory(methodName, internalMethodName) {
        return function consoleDevMatcher() {
            return {
                negativeCompare: function negativeCompare(actual) {
                    var spy = spyConsole();
                    try {
                        actual();
                    } finally {
                        spy.reset();
                    }

                    var callsArgs = spy.calls[internalMethodName || methodName];
                    var formattedCalls = callsArgs
                        .map(function(arg) {
                            return '"' + formatConsoleCall(arg) + '"';
                        })
                        .join(', ');

                    if (callsArgs.length === 0) {
                        return {
                            pass: true,
                        };
                    }
                    return {
                        pass: false,
                        message: function() {
                            return 'Expect no message but received:\n' + formattedCalls;
                        },
                    };
                },
                compare: function compare(actual, expectedMessage) {
                    function matchMessage(message) {
                        if (typeof expectedMessage === 'string') {
                            return message === expectedMessage;
                        } else {
                            return expectedMessage.test(message);
                        }
                    }

                    if (typeof actual !== 'function') {
                        throw new Error('Expected function to throw error.');
                    } else if (
                        typeof expectedMessage !== 'string' &&
                        !(expectedMessage instanceof RegExp)
                    ) {
                        throw new Error(
                            'Expected a string or a RegExp to compare the thrown error against.'
                        );
                    }

                    var spy = spyConsole();

                    try {
                        actual();
                    } finally {
                        spy.reset();
                    }

                    var callsArgs = spy.calls[internalMethodName || methodName];
                    var formattedCalls = callsArgs
                        .map(function(callArgs) {
                            return '"' + formatConsoleCall(callArgs) + '"';
                        })
                        .join(', ');

                    if (process.env.NODE_ENV === 'production') {
                        if (callsArgs.length !== 0) {
                            fail(
                                'Expected console.' +
                                    methodName +
                                    ' to never called in production mode, but it was called ' +
                                    callsArgs.length +
                                    ' with ' +
                                    formattedCalls +
                                    '.'
                            );
                        } else {
                            return pass();
                        }
                    } else {
                        if (callsArgs.length === 0) {
                            return fail(
                                'Expected console.' +
                                    methodName +
                                    ' to called once with "' +
                                    expectedMessage +
                                    '", but was never called.'
                            );
                        } else if (callsArgs.length === 1) {
                            var actualMessage = formatConsoleCall(callsArgs[0]);

                            if (!matchMessage(actualMessage)) {
                                return fail(
                                    'Expected console.' +
                                        methodName +
                                        ' to be called with "' +
                                        expectedMessage +
                                        '", but was called with "' +
                                        actualMessage +
                                        '".'
                                );
                            } else {
                                return pass();
                            }
                        } else {
                            return fail(
                                'Expected console.' +
                                    methodName +
                                    ' to never called, but it was called ' +
                                    callsArgs.length +
                                    ' with ' +
                                    formattedCalls +
                                    '.'
                            );
                        }
                    }
                },
            };
        };
    }

    function spyGlobalErrors() {
        var originalHandler = window.onerror;

        var result = {
            error: undefined,
            reset: function() {
                window.onerror = originalHandler;
            },
        };

        window.onerror = function() {
            result.error = arguments[4];
            return true;
        };

        return result;
    }
    function matchMessage(expectedMessage, message) {
        if (typeof expectedMessage === 'string') {
            return message === expectedMessage;
        } else {
            return expectedMessage.test(message);
        }
    }

    function matchError(expectedErrorCtor, error) {
        return error instanceof expectedErrorCtor;
    }

    function throwDescription(thrown) {
        return thrown.name + ' with message "' + thrown.message + '"';
    }

    function verifyMatcherParams(actual, expectedErrorCtor, expectedMessage) {
        if (typeof actual !== 'function') {
            throw new Error('Expected a function to compare.');
        } else if (
            typeof expectedErrorCtor !== 'function' ||
            expectedErrorCtor.prototype instanceof Error
        ) {
            throw new Error('Expected an error constructor.');
        } else if (typeof expectedMessage !== 'string' && !(expectedMessage instanceof RegExp)) {
            throw new Error('Expected a string or a RegExp to compare the thrown error against.');
        }
    }
    var customMatchers = {
        toLogErrorDev: consoleDevMatcherFactory('error'),
        toThrowErrorDev: function toThrowErrorDev() {
            return {
                compare: function(actual, expectedErrorCtor, expectedMessage) {
                    verifyMatcherParams(actual, expectedErrorCtor, expectedMessage);

                    let thrown;
                    try {
                        actual();
                    } catch (error) {
                        thrown = error;
                    }

                    if (process.env.NODE_ENV === 'production') {
                        if (thrown !== undefined) {
                            return fail(
                                'Expected function not to throw an error in production mode, but it threw ' +
                                    throwDescription(thrown) +
                                    '.'
                            );
                        } else {
                            return pass();
                        }
                    } else {
                        if (thrown === undefined) {
                            return fail(
                                'Expected function to throw an ' +
                                    expectedErrorCtor.name +
                                    ' error in development mode with message "' +
                                    expectedMessage +
                                    '".'
                            );
                        } else if (
                            !matchError(expectedErrorCtor, thrown) ||
                            !matchMessage(expectedMessage, thrown.message)
                        ) {
                            return fail(
                                'Expected function to throw an ' +
                                    expectedErrorCtor.name +
                                    ' error in development mode with message "' +
                                    expectedMessage +
                                    '", but it threw ' +
                                    throwDescription(thrown) +
                                    '.'
                            );
                        } else {
                            return pass();
                        }
                    }
                },
            };
        },
        // Errors that occur during the component connection and disconnection are not handled by a try catch
        // block. This is because the error of web components is thrown in a different context
        // Reference: https://github.com/open-wc/open-wc/blob/master/docs/faq/unit-testing-init-error.md#setting-up-your-component-for-testing
        //  https://github.com/open-wc/open-wc/issues/228
        // LWC uses native web components for node-reactions. So this routine sniffs errors by attaching
        // an error handler at the window
        toThrowGlobalError: function toThrowGlobalError() {
            return {
                compare: function(actual, expectedErrorCtor, expectedMessage) {
                    verifyMatcherParams(actual, expectedErrorCtor, expectedMessage);

                    var spy = spyGlobalErrors();
                    let thrown;

                    try {
                        actual();
                    } catch (error) {
                        thrown = error;
                    } finally {
                        spy.reset();
                        // Verify there were no other errors thrown during init
                        if (thrown === undefined) {
                            thrown = spy.error;
                        }
                    }

                    if (thrown === undefined) {
                        return fail(
                            'Expected function to throw an ' +
                                expectedErrorCtor.name +
                                ' error in development mode with message "' +
                                expectedMessage +
                                '".'
                        );
                    } else if (
                        !matchError(expectedErrorCtor, thrown) ||
                        !matchMessage(expectedMessage, thrown.message)
                    ) {
                        return fail(
                            'Expected function to throw an ' +
                                expectedErrorCtor.name +
                                ' error in development mode with message "' +
                                expectedMessage +
                                '", but it threw ' +
                                throwDescription(thrown) +
                                '.'
                        );
                    } else {
                        return pass();
                    }
                },
            };
        },
    };

    beforeAll(function() {
        jasmine.addMatchers(customMatchers);
    });

    function extractDataIds(root) {
        var nodes = {};

        function processElement(elm) {
            if (elm.hasAttribute('data-id')) {
                nodes[elm.getAttribute('data-id')] = elm;
            }

            if (elm.shadowRoot) {
                Object.assign(nodes, extractShadowDataIds(elm.shadowRoot));
            }
        }

        function acceptNode() {
            return NodeFilter.FILTER_ACCEPT;
        }

        // Work around Internet Explorer wanting a function instead of an object. IE also *requires* this argument where
        // other browsers don't.
        var safeFilter = acceptNode;
        safeFilter.acceptNode = acceptNode;

        var walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, safeFilter, false);

        processElement(root);

        var elm;
        while ((elm = walker.nextNode())) {
            processElement(elm);
        }

        return nodes;
    }

    function extractShadowDataIds(shadowRoot) {
        const nodes = {};

        // We can't use a TreeWalker directly on the ShadowRoot since with synthetic shadow the ShadowRoot is not an
        // actual DOM nodes. So we need to iterate over the children manually and run the tree walker on each child.
        for (var i = 0; i < shadowRoot.childNodes.length; i++) {
            var child = shadowRoot.childNodes[i];
            Object.assign(nodes, extractDataIds(child));
        }

        return nodes;
    }

    var register = {};
    function load(id) {
        return Promise.resolve(register[id]);
    }

    function registerForLoad(name, Ctor) {
        register[name] = Ctor;
    }
    function clearRegister() {
        register = {};
    }

    return {
        registerForLoad: registerForLoad,
        clearRegister: clearRegister,
        load: load,
        extractDataIds: extractDataIds,
        extractShadowDataIds: extractShadowDataIds,
    };
})(LWC, jasmine, beforeAll);
