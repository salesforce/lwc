import type { MatchersObject, RawMatcherFn } from '@vitest/expect';

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

function expectMessage(actual: string) {
    return (expected: ExpectedMessage) =>
        typeof expected === 'string' ? actual === expected : expected.test(actual);
}

function formatConsoleCall(values: unknown[]) {
    return values
        .map((value) => {
            if (typeof value === 'string') {
                return value;
            } else {
                return String(value);
            }
        })
        .join(' ');
}

// TODO [#869]: Improve lookup logWarning doesn't use console.group anymore.
function consoleDevMatcherFactory(methodName: 'error' | 'warn', expectInProd: boolean = false) {
    return function (received: () => void, ...expected: ExpectedMessage[]) {
        const spy = vi.spyOn(console, methodName).withImplementation(() => {}, received);

        if (!expectInProd && process.env.NODE_ENV === 'production' && spy.mock.calls.length > 0) {
            return fail(
                `Expected console.${methodName}() not to be called in production mode, but it was called with the following messages:\n` +
                    spy.mock.calls.map((call) => formatConsoleCall(call)).join('\n')
            );
        }

        const pass = spy.mock.calls.some((call) => {
            const message = formatConsoleCall(call);
            return expected.flat().some(expectMessage(message));
        });

        return {
            pass,
            message: () => {
                const message = spy.mock.calls.map((call) => formatConsoleCall(call)).join('\n');

                return pass
                    ? ''
                    : `${
                          `Expected console.${methodName}() to be called with one of the following messages:\n` +
                          expected.map((message) => `  - ${message}`).join('\n')
                      }\n\nCalls:\n${message}`;
            },
        };
    };
}

type Callback = () => void;
type ErrorListener = (callback: Callback) => Error | undefined;

function errorMatcherFactory(errorListener: ErrorListener, expectInProd?: boolean): RawMatcherFn {
    return function (
        actual: Callback,
        expectedErrorCtor: ErrorConstructor,
        expectedMessage?: ExpectedMessage
    ) {
        function matchMessage(message: string) {
            if (typeof expectedMessage === 'undefined') {
                return true;
            } else if (typeof expectedMessage === 'string') {
                return message === expectedMessage;
            } else {
                return expectedMessage.test(message);
            }
        }

        function matchError(error: Error) {
            return error instanceof expectedErrorCtor && matchMessage(error.message);
        }

        function throwDescription(thrown: Error) {
            return thrown.name + ' with message "' + thrown.message + '"';
        }

        if (typeof expectedMessage === 'undefined') {
            if (typeof expectedErrorCtor === 'undefined') {
                // 0 arguments provided
                expectedMessage = undefined;
                expectedErrorCtor = Error;
            } else {
                // 1 argument provided
                // @ts-expect-error Error is always defined
                expectedMessage = expectedErrorCtor;
                expectedErrorCtor = Error;
            }
        }

        if (typeof actual !== 'function') {
            throw new Error('Expected function to throw error.');
        } else if (expectedErrorCtor !== Error && !(expectedErrorCtor.prototype instanceof Error)) {
            throw new Error('Expected an error constructor.');
        } else if (
            typeof expectedMessage !== 'undefined' &&
            typeof expectedMessage !== 'string' &&
            !(expectedMessage instanceof RegExp)
        ) {
            throw new Error('Expected a string or a RegExp to compare the thrown error against.');
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
    };
}

function directErrorListener(callback: Callback) {
    try {
        callback();
    } catch (error) {
        return error as Error;
    }
}

// Listen for errors using window.addEventListener('error')
function windowErrorListener(callback: Callback) {
    let error: Error | undefined;

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
function customElementCallbackReactionErrorListener(callback: Callback) {
    const errorListener = lwcRuntimeFlags.DISABLE_NATIVE_CUSTOM_ELEMENT_LIFECYCLE
        ? directErrorListener
        : windowErrorListener;

    return errorListener(callback);
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
        return received === true ? pass() : fail(message);
    },
    toBeFalse(received: boolean, message = 'Expected value to be false') {
        return received === false ? pass() : fail(message);
    },
    toHaveSize(received: { length: number }, size: number) {
        const { isNot } = this;
        const to = isNot ? 'not to' : 'to';
        return {
            pass: received.length === size,
            message: () =>
                `Expected array ${to} have size ${size}, but received ${received.length}`,
        };
    },
} as const satisfies MatchersObject;

expect.extend(customMatchers);

interface CustomMatchers<R = unknown> {
    toLogErrorDev: (expected: ExpectedMessage | ExpectedMessage[]) => R;
    toLogError: (expected: ExpectedMessage | ExpectedMessage[]) => R;
    toLogWarningDev: (expected: ExpectedMessage | ExpectedMessage[]) => R;
    toThrowErrorDev: (
        errorCtor: ErrorConstructor,
        expected: ExpectedMessage | ExpectedMessage[]
    ) => R;

    toThrowCallbackReactionErrorDev: (expected: ExpectedMessage | ExpectedMessage[]) => R;
    toThrowCallbackReactionError: (expected: ExpectedMessage | ExpectedMessage[]) => R;

    toHaveSize: (size: number) => R;

    toEqualWireSettings: (actual: any, expected: any) => R;
}

declare module 'vitest' {
    // TypeScript interfaces get merged; this is a false positive
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Assertion<T = any> extends CustomMatchers<T> {}
    // TypeScript interfaces get merged; this is a false positive
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface AsymmetricMatchersContaining extends CustomMatchers {}
}
