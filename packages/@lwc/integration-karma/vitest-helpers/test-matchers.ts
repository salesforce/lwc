import { expect } from 'vitest';

function pass() {
    return {
        pass: true,
        message: () => '',
    } as const;
}

function fail(message: string) {
    return {
        pass: false,
        message: () => message,
    } as const;
}

type ExpectedMessage = string | RegExp;

// TODO [#869]: Replace this custom spy with standard spyOn jasmine spy when logWarning doesn't use console.group
// anymore. On IE11 console.group has a different behavior when the F12 inspector is attached to the page.
function spyConsole() {
    const originalConsole = window.console;

    const calls: { [key: string]: any[][] } = {
        log: [],
        warn: [],
        error: [],
        group: [],
        groupEnd: [],
    };

    window.console = {
        ...originalConsole,
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

function formatConsoleCall(args: any[]) {
    return args.map(String).join(' ');
}

// TODO [#869]: Improve lookup logWarning doesn't use console.group anymore.
function consoleDevMatcherFactory(
    methodName: keyof Omit<Console, 'Console'>,
    expectInProd: boolean = false
) {
    return function consoleDevMatcher(received: () => void, ...expected: ExpectedMessage[]) {
        function matchMessage(message: string, expectedMessage: ExpectedMessage): boolean {
            if (typeof expectedMessage === 'string') {
                return message === expectedMessage;
            } else {
                return expectedMessage.test(message);
            }
        }

        const spy = spyConsole();
        try {
            received();
        } finally {
            spy.reset();
        }

        const callsArgs = spy.calls[methodName];
        const formattedCalls = callsArgs
            .map(function (arg) {
                return '"' + formatConsoleCall(arg) + '"';
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
                        JSON.stringify(expected) +
                        ', but was never called.'
                );
            } else {
                if (callsArgs.length !== expected.length) {
                    return fail(
                        'Expected console.' +
                            methodName +
                            ' to be called ' +
                            expected.length +
                            ' time(s), but was called ' +
                            callsArgs.length +
                            ' time(s).'
                    );
                }
                for (let i = 0; i < callsArgs.length; i++) {
                    const callsArg = callsArgs[i];
                    const expectedMessage = expected[i];
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
    };
}

type ErrorListener = (callback: () => void) => unknown | undefined;

function errorMatcherFactory(errorListener: ErrorListener, expectInProd: boolean = false) {
    return function toThrowError(
        actual: () => void,
        errorCtor?: ErrorConstructor,
        ...expected: ExpectedMessage[]
    ) {
        const expectedErrorCtor = errorCtor ?? Error;

        function matchMessage(message: string, expectedMessage: ExpectedMessage): boolean {
            if (typeof expectedMessage === 'string') {
                return message === expectedMessage;
            } else {
                return expectedMessage.test(message);
            }
        }

        function isError(error: unknown) {
            return error instanceof expectedErrorCtor;
        }

        function matchError(error: unknown): boolean {
            return isError(error) && matchMessage(error.message, expected[0]);
        }

        function throwDescription(thrown: any): string {
            return `${thrown.name} with message "${thrown.message}"`;
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
                        (expected[0] ? 'with message ' + expected[0] : '') +
                        '".'
                );
            } else if (!matchError(thrown)) {
                return fail(
                    'Expected function to throw an ' +
                        expectedErrorCtor.name +
                        ' error in development mode "' +
                        (expected[0] ? 'with message ' + expected[0] : '') +
                        '", but it threw ' +
                        throwDescription(thrown) +
                        '.'
                );
            } else {
                return pass();
            }
        }
    };

    // function toThrowError() {
    //     return {
    //         compare: function (
    //             actual: () => void,
    //             errorCtor?: ErrorConstructor,
    //             expectedMessage?: ExpectedMessage
    //         ) {
    //             const expectedErrorCtor = errorCtor ?? Error;

    //             // if (typeof expectedMessage === 'undefined') {
    //             //     if (typeof expectedErrorCtor === 'undefined') {
    //             //         // 0 arguments provided
    //             //         expectedMessage = undefined;
    //             //         expectedErrorCtor = Error;
    //             //     } else {
    //             //         // 1 argument provided
    //             //         expectedMessage = expectedErrorCtor;
    //             //         expectedErrorCtor = Error;
    //             //     }
    //             // }

    //             function matchMessage(message: string) {
    //                 if (typeof expectedMessage === 'undefined') {
    //                     return true;
    //                 } else if (typeof expectedMessage === 'string') {
    //                     return message === expectedMessage;
    //                 } else {
    //                     return expectedMessage.test(message);
    //                 }
    //             }

    //             function isError(error: unknown) {
    //                 return error instanceof expectedErrorCtor;
    //             }

    //             function matchError(error: unknown) {
    //                 return isError(error) && matchMessage(error.message);
    //             }

    //             function throwDescription(thrown: any) {
    //                 return `${thrown.name} with message "${thrown.message}"` as const;
    //             }

    //             if (typeof actual !== 'function') {
    //                 throw new Error('Expected function to throw error.');
    //             } else if (
    //                 expectedErrorCtor !== Error &&
    //                 !(expectedErrorCtor.prototype instanceof Error)
    //             ) {
    //                 throw new Error('Expected an error constructor.');
    //             } else if (
    //                 typeof expectedMessage !== 'undefined' &&
    //                 typeof expectedMessage !== 'string' &&
    //                 !(expectedMessage instanceof RegExp)
    //             ) {
    //                 throw new Error(
    //                     'Expected a string or a RegExp to compare the thrown error against.'
    //                 );
    //             }

    //             const thrown = errorListener(actual);

    //             if (!expectInProd && process.env.NODE_ENV === 'production') {
    //                 if (thrown !== undefined) {
    //                     return fail(
    //                         'Expected function not to throw an error in production mode, but it threw ' +
    //                             throwDescription(thrown) +
    //                             '.'
    //                     );
    //                 } else {
    //                     return pass();
    //                 }
    //             } else {
    //                 if (thrown === undefined) {
    //                     return fail(
    //                         'Expected function to throw an ' +
    //                             expectedErrorCtor.name +
    //                             ' error in development mode"' +
    //                             (expectedMessage ? 'with message ' + expectedMessage : '') +
    //                             '".'
    //                     );
    //                 } else if (!matchError(thrown)) {
    //                     return fail(
    //                         'Expected function to throw an ' +
    //                             expectedErrorCtor.name +
    //                             ' error in development mode "' +
    //                             (expectedMessage ? 'with message ' + expectedMessage : '') +
    //                             '", but it threw ' +
    //                             throwDescription(thrown) +
    //                             '.'
    //                     );
    //                 } else {
    //                     return pass();
    //                 }
    //             }
    //         },
    //     };
    // };
}

function directErrorListener(callback: () => void) {
    try {
        callback();
    } catch (error) {
        return error;
    }
}

// Listen for errors using window.addEventListener('error')
function windowErrorListener(callback: () => void) {
    let error: unknown;
    function onError(event: ErrorEvent) {
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
function customElementCallbackReactionErrorListener(callback: () => void) {
    return lwcRuntimeFlags.DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE
        ? directErrorListener(callback)
        : windowErrorListener(callback);
}

const customMatchers = {
    toLogErrorDev: consoleDevMatcherFactory('error'),
    toLogError: consoleDevMatcherFactory('error', true),
    toLogWarningDev: consoleDevMatcherFactory('warn'),
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
    toBeTrue(received: boolean, message = 'Expected value to be true') {
        return received ? pass() : fail(message);
    },
    toBeFalse(received: boolean, message = 'Expected value to be false') {
        return !received ? pass() : fail(message);
    },
};

expect.extend(customMatchers);

interface CustomMatchers<R = unknown> {
    // toThrowErrorWithCode: (received: any, ctor: any, message?: string) => R;
    // toThrowErrorWithType: (received: any, ctor: any, message?: string) => R;
    toLogErrorDev: (...expected: ExpectedMessage[]) => R;
    toLogError: (...expected: ExpectedMessage[]) => R;
    toLogWarningDev: (...expected: ExpectedMessage[]) => R;
    toThrowErrorDev: (errorCtor?: ErrorConstructor, ...expected: ExpectedMessage[]) => R;

    toThrowCallbackReactionErrorDev: (...expected: ExpectedMessage[]) => R;
    toThrowCallbackReactionError: (...expected: ExpectedMessage[]) => R;
}

declare module 'vitest' {
    // TypeScript interfaces get merged; this is a false positive
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Assertion<T = any> extends CustomMatchers<T> {}
    // TypeScript interfaces get merged; this is a false positive
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface AsymmetricMatchersContaining extends CustomMatchers {}
}
