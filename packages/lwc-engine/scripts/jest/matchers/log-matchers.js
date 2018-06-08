const { default: assert } = require('../../../src/framework/assert');

function createMatcher(methodName) {
    return function matcher(fn, expectedMessage) {
        if (typeof fn !== 'function') {
            throw new TypeError(
                `Expected a first argument to be a function, received ${typeof fn}`,
            );
        }

        const receivedMessages = [];

        const consoleSpy = message => {
            receivedMessages.push(message);
        };

        // Swap the original logging method with the spy
        const originalMethod = assert[methodName];
        assert[methodName] = consoleSpy;

        try {
            fn();
        } finally {
            // Set back the logging method to it's original value before returning the
            // matcher result.
            assert[methodName] = originalMethod;

            if (this.isNot) {
                if (receivedMessages.length > 0) {
                    const formattedMessages = receivedMessages
                        .map(message => this.utils.printReceived(message))
                        .join('\n\n');

                    return {
                        message: () =>
                            `Expect no message but received:\n${formattedMessages}`,
                        pass: true,
                    };
                }

                return {
                    pass: false,
                };
            } else {
                if (receivedMessages.length === 0) {
                    return {
                        message: () =>
                            `Expect no message for:\n${this.utils.printExpected(
                                expectedMessage,
                            )}`,
                        pass: false,
                    };
                } else if (receivedMessages.length === 1) {
                    const [receivedMessage] = receivedMessages;

                    if (!receivedMessage.includes(expectedMessage)) {
                        return {
                            message: () =>
                                `Expect message:\n${this.utils.printExpected(
                                    expectedMessage,
                                )}\n\nBut received:\n${this.utils.printReceived(
                                    receivedMessage,
                                )}`,
                            pass: false,
                        };
                    }
                } else {
                    const formattedMessages = receivedMessages
                        .map(message => this.utils.printReceived(message))
                        .join('\n\n');

                    return {
                        message: () =>
                            `Expect a single message but received multiples:\n\n${formattedMessages}`,
                        pass: false,
                    };
                }

                return {
                    pass: true,
                };
            }
        }
    };
}

module.exports = {
    toLogError: createMatcher('logError'),
    toLogWarning: createMatcher('logWarning'),
};
