import { spyOn } from '@vitest/spy';

function formatConsoleCall(args) {
    // Just calling .join suppresses null/undefined, so we stringify separately
    return args.map(String).join(' ');
}

function formatAllCalls(argsList) {
    return argsList.map((args) => `"${formatConsoleCall(args)}"`).join(', ');
}

function callAndGetLogs(fn, methodName) {
    const spy = spyOn(console, methodName).mockImplementation(() => {});
    try {
        fn();
        return spy.mock.calls;
    } finally {
        spy.mockRestore();
    }
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

/** @type {Chai.ChaiPlugin} */
export const registerCustomMatchers = (chai, utils) => {
    function consoleMatcherFactory(methodName, expectInProd) {
        return function consoleMatcher(expectedMessages) {
            const actual = utils.flag(this, 'object');

            if (utils.flag(this, 'negate')) {
                // If there's a .not in the assertion chain
                const callsArgs = callAndGetLogs(actual, methodName);
                if (callsArgs.length === 0) {
                    return;
                }
                throw new chai.AssertionError(
                    `Expect no message but received:\n${formatAllCalls(callsArgs)}`
                );
            }

            if (!Array.isArray(expectedMessages)) {
                expectedMessages = [expectedMessages];
            }

            if (typeof actual !== 'function') {
                throw new Error('Expected function to throw error.');
            } else if (
                expectedMessages.some((m) => typeof m !== 'string' && !(m instanceof RegExp))
            ) {
                throw new Error(
                    'Expected a string or a RegExp to compare the thrown error against, or an array of such.'
                );
            }

            const callsArgs = callAndGetLogs(actual, methodName);

            if (!expectInProd && process.env.NODE_ENV === 'production') {
                if (callsArgs.length !== 0) {
                    throw new chai.AssertionError(
                        `Expected console.${
                            methodName
                        } to never be called in production mode, but it was called ${
                            callsArgs.length
                        } time(s) with ${formatAllCalls(callsArgs)}.`
                    );
                }
            } else {
                if (callsArgs.length === 0) {
                    // Result: "string", /regex/
                    const formattedExpected = expectedMessages
                        .map((msg) =>
                            typeof msg === 'string' ? JSON.stringify(msg) : msg.toString()
                        )
                        .join(', ');
                    throw new chai.AssertionError(
                        `Expected console.${methodName} to be called with [${
                            formattedExpected
                        }], but was never called.`
                    );
                } else {
                    if (callsArgs.length !== expectedMessages.length) {
                        throw new chai.AssertionError(
                            `Expected console.${methodName} to be called ${
                                expectedMessages.length
                            } time(s), but was called ${callsArgs.length} time(s).`
                        );
                    }
                    for (let i = 0; i < callsArgs.length; i++) {
                        const callsArg = callsArgs[i];
                        const expectedMessage = expectedMessages[i];
                        const actualMessage = formatConsoleCall(callsArg);

                        const matches =
                            typeof expectedMessage === 'string'
                                ? actualMessage === expectedMessage
                                : expectedMessage.test(actualMessage);
                        if (!matches) {
                            throw new chai.AssertionError(
                                `Expected console.${methodName} to be called with "${
                                    expectedMessage
                                }", but was called with "${actualMessage}".`
                            );
                        }
                    }
                }
            }
        };
    }

    function errorMatcherFactory(errorListener, expectInProd) {
        return function toThrowError(expectedErrorCtor, expectedMessage) {
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

            const actual = utils.flag(this, 'object');
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
                    throw new chai.AssertionError(
                        `Expected function not to throw an error in production mode, but it threw ${throwDescription(
                            thrown
                        )}.`
                    );
                }
            } else if (thrown === undefined) {
                throw new chai.AssertionError(
                    `Expected function to throw an ${
                        expectedErrorCtor.name
                    } error in development mode "${
                        expectedMessage ? 'with message ' + expectedMessage : ''
                    }".`
                );
            } else if (!matchError(thrown)) {
                throw new chai.AssertionError(
                    `Expected function to throw an ${
                        expectedErrorCtor.name
                    } error in development mode "${
                        expectedMessage ? 'with message ' + expectedMessage : ''
                    }", but it threw ${throwDescription(thrown)}.`
                );
            }
        };
    }

    const customMatchers = {
        // FIXME: Add descriptions explaining the what/why of these custom matchers
        // Console matchers
        toLogErrorDev: consoleMatcherFactory('error'),
        toLogError: consoleMatcherFactory('error', true),
        toLogWarningDev: consoleMatcherFactory('warn'),
        // Error matchers
        toThrowErrorDev: errorMatcherFactory(directErrorListener),
        toThrowCallbackReactionErrorDev: errorMatcherFactory(
            customElementCallbackReactionErrorListener
        ),
        toThrowCallbackReactionError: errorMatcherFactory(
            customElementCallbackReactionErrorListener,
            true
        ),
        toThrowCallbackReactionErrorEvenInSyntheticLifecycleMode: errorMatcherFactory(
            windowErrorListener,
            true
        ),

        // Jasmine compat matchers
        // FIXME: Remove and just use chai
        toHaveSize(size) {
            const value = utils.flag(this, 'object');
            chai.expect(value).to.have.length(size);
        },
        toBeFalse() {
            const value = utils.flag(this, 'object');
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            chai.expect(value).to.be.false;
        },
        toBeTrue() {
            const value = utils.flag(this, 'object');
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            chai.expect(value).to.be.true;
        },
    };

    for (const [name, impl] of Object.entries(customMatchers)) {
        utils.addMethod(chai.Assertion.prototype, name, impl);
    }
};
