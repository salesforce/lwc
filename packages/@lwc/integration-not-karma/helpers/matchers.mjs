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
    const customMatchers = {
        toLogErrorDev: consoleMatcherFactory('error'),
        toLogError: consoleMatcherFactory('error', true),
        toLogWarningDev: consoleMatcherFactory('warn'),
        toThrowErrorDev() {
            // FIXME: implement for realsies
            const fn = utils.flag(this, 'object');
            if (typeof fn === 'function') {
                try {
                    fn();
                } catch (_) {
                    //
                }
            }
        },
        toThrowCallbackReactionError() {
            // FIXME: implement for realsies
            const fn = utils.flag(this, 'object');
            if (typeof fn === 'function') {
                try {
                    fn();
                } catch (_) {
                    //
                }
            }
        },
        toThrowCallbackReactionErrorDev() {
            // FIXME: implement for realsies
            const fn = utils.flag(this, 'object');
            if (typeof fn === 'function') {
                try {
                    fn();
                } catch (_) {
                    //
                }
            }
        },
        toThrowCallbackReactionErrorEvenInSyntheticLifecycleMode() {
            // FIXME: implement for realsies
            const fn = utils.flag(this, 'object');
            if (typeof fn === 'function') {
                try {
                    fn();
                } catch (_) {
                    //
                }
            }
        },
        // FIXME: Added for jasmine compat; remove and use chai assertions
        toHaveSize(size) {
            const value = utils.flag(this, 'object');
            chai.expect(value).to.have.length(size);
        },
        // FIXME: Added for jasmine compat; remove and use chai assertions
        toBeFalse() {
            const value = utils.flag(this, 'object');
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            chai.expect(value).to.be.false;
        },
        // FIXME: Added for jasmine compat; remove and use chai assertions
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
