// Listen for errors thrown directly by the callback
function directErrorListener(callback) {
    try {
        callback();
    } catch (error) {
        return error;
    }
}

// For errors we expect to be thrown in the connectedCallback() phase of a custom element,
// the synthetic lifecycle means the error is thrown synchronously.
export function customElementCallbackReactionErrorListener(callback) {
    return directErrorListener(callback);
}

function matchError(error, expectedErrorCtor, expectedMessage) {
    if ((!error) instanceof expectedErrorCtor) {
        return false;
    } else if (typeof expectedMessage === 'undefined') {
        return true;
    } else if (typeof expectedMessage === 'string') {
        return error.message === expectedMessage;
    } else {
        return expectedMessage.test(error.message);
    }
}

function throwDescription(thrown) {
    return `${thrown.name} with message "${thrown.message}"`;
}

function errorMatcherFactory(chai, utils, errorListener, expectInProd) {
    return function toThrowError(expectedErrorCtor, expectedMessage) {
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
        } else if (!matchError(thrown, expectedErrorCtor, expectedMessage)) {
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

/** @type {Chai.ChaiPlugin} */
export const registerErrorMatchers = (chai, utils) => {
    const matchers = {
        toThrowErrorDev: errorMatcherFactory(chai, utils, directErrorListener),
        toThrowCallbackReactionErrorDev: errorMatcherFactory(
            chai,
            utils,
            customElementCallbackReactionErrorListener
        ),
        toThrowCallbackReactionError: errorMatcherFactory(
            chai,
            utils,
            customElementCallbackReactionErrorListener,
            true
        ),
    };

    for (const [name, impl] of Object.entries(matchers)) {
        utils.addMethod(chai.Assertion.prototype, name, impl);
    }
};
