import { spyConsole } from './wtr-utils.mjs';

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

function formatConsoleCall(args) {
    return args.map(String).join(' ');
}

// TODO [#869]: Improve lookup logWarning doesn't use console.group anymore.
function consoleDevMatcherFactory(methodName, expectInProd) {
    return function consoleDevMatcher() {
        return {
            negativeCompare: function negativeCompare(actual) {
                const spy = spyConsole();
                try {
                    actual();
                } finally {
                    spy.reset();
                }

                const callsArgs = spy.calls[methodName];
                const formattedCalls = callsArgs
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
            compare: function compare(actual, expectedMessages) {
                function matchMessage(message, expectedMessage) {
                    if (typeof expectedMessage === 'string') {
                        return message === expectedMessage;
                    } else {
                        return expectedMessage.test(message);
                    }
                }

                if (!Array.isArray(expectedMessages)) {
                    expectedMessages = [expectedMessages];
                }

                if (typeof actual !== 'function') {
                    throw new Error('Expected function to throw error.');
                } else if (
                    expectedMessages.some(function (message) {
                        return typeof message !== 'string' && !(message instanceof RegExp);
                    })
                ) {
                    throw new Error(
                        'Expected a string or a RegExp to compare the thrown error against, or an array of such.'
                    );
                }

                const spy = spyConsole();

                try {
                    actual();
                } finally {
                    spy.reset();
                }

                const callsArgs = spy.calls[methodName];
                const formattedCalls = callsArgs
                    .map(function (callArgs) {
                        return '"' + formatConsoleCall(callArgs) + '"';
                    })
                    .join(', ');

                if (!expectInProd && process.env.NODE_ENV === 'production') {
                    if (callsArgs.length !== 0) {
                        return fail(
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
                                ' to called with ' +
                                JSON.stringify(expectedMessages) +
                                ', but was never called.'
                        );
                    } else {
                        if (callsArgs.length !== expectedMessages.length) {
                            return fail(
                                'Expected console.' +
                                    methodName +
                                    ' to be called ' +
                                    expectedMessages.length +
                                    ' time(s), but was called ' +
                                    callsArgs.length +
                                    ' time(s).'
                            );
                        }
                        for (let i = 0; i < callsArgs.length; i++) {
                            const callsArg = callsArgs[i];
                            const expectedMessage = expectedMessages[i];
                            const actualMessage = formatConsoleCall(callsArg);
                            if (!matchMessage(actualMessage, expectedMessage)) {
                                return fail(
                                    'Expected console.' +
                                        methodName +
                                        ' to be called with "' +
                                        expectedMessage +
                                        '", but was called with "' +
                                        actualMessage +
                                        '".'
                                );
                            }
                        }
                        return pass();
                    }
                }
            },
        };
    };
}

function errorMatcherFactory(errorListener, expectInProd) {
    return function toThrowError() {
        return {
            compare: function (actual, expectedErrorCtor, expectedMessage) {
                function matchMessage(message) {
                    if (typeof expectedMessage === 'undefined') {
                        return true;
                    } else if (typeof expectedMessage === 'string') {
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

                if (typeof expectedMessage === 'undefined') {
                    if (typeof expectedErrorCtor === 'undefined') {
                        // 0 arguments provided
                        expectedMessage = undefined;
                        expectedErrorCtor = Error;
                    } else {
                        // 1 argument provided
                        expectedMessage = expectedErrorCtor;
                        expectedErrorCtor = Error;
                    }
                }

                if (typeof actual !== 'function') {
                    throw new Error('Expected function to throw error.');
                } else if (
                    expectedErrorCtor !== Error &&
                    !(expectedErrorCtor.prototype instanceof Error)
                ) {
                    throw new Error('Expected an error constructor.');
                } else if (
                    typeof expectedMessage !== 'undefined' &&
                    typeof expectedMessage !== 'string' &&
                    !(expectedMessage instanceof RegExp)
                ) {
                    throw new Error(
                        'Expected a string or a RegExp to compare the thrown error against.'
                    );
                }

                const thrown = errorListener(actual);

                if (!expectInProd && process.env.NODE_ENV === 'production') {
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
                                ' error in development mode"' +
                                (expectedMessage ? 'with message ' + expectedMessage : '') +
                                '".'
                        );
                    } else if (!matchError(thrown)) {
                        return fail(
                            'Expected function to throw an ' +
                                expectedErrorCtor.name +
                                ' error in development mode "' +
                                (expectedMessage ? 'with message ' + expectedMessage : '') +
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
    };
}

// Listen for errors thrown directly by the callback
function directErrorListener(callback) {
    try {
        callback();
    } catch (error) {
        return error;
    }
}

// Listen for errors using window.addEventListener('error')
function windowErrorListener(callback) {
    let error;
    function onError(event) {
        event.preventDefault(); // don't log the error
        error = event.error;
    }

    // Prevent jasmine from handling the global error. There doesn't seem to be another
    // way to disable this behavior: https://github.com/jasmine/jasmine/pull/1860
    const originalOnError = window.onerror;
    window.onerror = null;
    window.addEventListener('error', onError);

    try {
        callback();
    } finally {
        window.onerror = originalOnError;
        window.removeEventListener('error', onError);
    }
    return error;
}

// For errors we expect to be thrown in the connectedCallback() phase
// of a custom element, there are two possibilities:
// 1) We're using non-native lifecycle callbacks, so the error is thrown synchronously
// 2) We're using native lifecycle callbacks, so the error is thrown asynchronously and can
//    only be caught with window.addEventListener('error')
//      - Note native lifecycle callbacks are all thrown asynchronously.
function customElementCallbackReactionErrorListener(callback) {
    return lwcRuntimeFlags.DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE
        ? directErrorListener(callback)
        : windowErrorListener(callback);
}

// export const toLogErrorDev = consoleDevMatcherFactory('error');
// export const toLogError = consoleDevMatcherFactory('error', true);
// export const toLogWarningDev = consoleDevMatcherFactory('warn');
// export const toThrowErrorDev = errorMatcherFactory(directErrorListener);
// export const toThrowCallbackReactionErrorDev = errorMatcherFactory(
//     customElementCallbackReactionErrorListener
// );
// export const toThrowCallbackReactionError = errorMatcherFactory(
//     customElementCallbackReactionErrorListener,
//     true
// );
// export const toThrowCallbackReactionErrorEvenInSyntheticLifecycleMode = errorMatcherFactory(
//     windowErrorListener,
//     true
// );

const customMatchers = [
    // LWC custom
    'toLogError',
    'toLogErrorDev',
    'toThrowErrorDev',
    'toLogWarningDev',
    'toThrowCallbackReactionError',
    'toThrowCallbackReactionErrorDev',
    'toThrowCallbackReactionErrorEvenInSyntheticLifecycleMode',
    // jasmine compat
    'toHaveSize',
    'toBeFalse',
    'toBeTrue',
];
export const registerCustomMatchers = (chai, util) => {
    for (const matcher of customMatchers) {
        util.addMethod(chai.Assertion.prototype, matcher, () => {
            // TODO: implement
            // throw new Error(`TODO: ${matcher} is unimplemented`);
        });
    }
};
