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
            log: function () {
                calls.log.push(Array.prototype.slice.call(arguments));
            },
            warn: function () {
                calls.warn.push(Array.prototype.slice.call(arguments));
            },
            error: function () {
                calls.error.push(Array.prototype.slice.call(arguments));
            },
            group: function () {
                calls.group.push(Array.prototype.slice.call(arguments));
            },
            groupEnd: function () {
                calls.groupEnd.push(Array.prototype.slice.call(arguments));
            },
        };

        return {
            calls: calls,
            reset: function () {
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
                        .map(function (arg) {
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
                        message: function () {
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
                        .map(function (callArgs) {
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

    var customMatchers = {
        toLogErrorDev: consoleDevMatcherFactory('error'),
        toThrowErrorDev: function toThrowErrorDev() {
            return {
                compare: function (actual, expectedErrorCtor, expectedMessage) {
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
                    } else if (
                        typeof actual !== 'function' ||
                        expectedErrorCtor.prototype instanceof Error
                    ) {
                        throw new Error('Expected an error constructor.');
                    } else if (
                        typeof expectedMessage !== 'string' &&
                        !(expectedMessage instanceof RegExp)
                    ) {
                        throw new Error(
                            'Expected a string or a RegExp to compare the thrown error against.'
                        );
                    }

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
                        } else if (!matchError(thrown)) {
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
    };

    beforeAll(function () {
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

    // #986 - childNodes on the host element returns a fake shadow comment node on IE11 for debugging purposed. This method
    // filters this node.
    function getHostChildNodes(host) {
        return Array.prototype.slice.call(host.childNodes).filter(function (n) {
            return !(n.nodeType === Node.COMMENT_NODE && n.tagName.startsWith('#shadow-root'));
        });
    }
    return {
        registerForLoad: registerForLoad,
        clearRegister: clearRegister,
        load: load,
        extractDataIds: extractDataIds,
        extractShadowDataIds: extractShadowDataIds,
        getHostChildNodes: getHostChildNodes,
    };
})(LWC, jasmine, beforeAll);
