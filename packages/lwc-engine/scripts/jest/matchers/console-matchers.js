function createMatcher(methodName) {
    return function matcher(fn, expectedMessage) {
        if (typeof fn !== 'function') {
            throw new TypeError(
                `Expected a first argument to be a function, received ${typeof fn}`,
            );
        } else if (typeof expectedMessage !== 'string') {
            throw new TypeError(
                `Expected a second argument to be a string, received ${typeof expectedMessage}`,
            );
        }

        const receivedMessages = [];

        const consoleSpy = message => {
            receivedMessages.push(message);
        };

        // Swap the original console method with the spy
        const originalMethod = console[methodName];
        console[methodName] = consoleSpy;

        try {
            fn();
        } finally {
            // Set back the console method to it's original value before returning the
            // matcher result.
            console[methodName] = originalMethod;

            if (receivedMessages.length === 0) {
                return {
                    message: () =>
                        `Expect console message for:\n${this.utils.printExpected(
                            expectedMessage,
                        )}`,
                    pass: false,
                };
            } else if (receivedMessages.length === 1) {
                const [receivedMessage] = receivedMessages;

                if (!receivedMessage.includes(expectedMessage)) {
                    return {
                        message: () =>
                            `Expect console message:\n${this.utils.printExpected(
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
    };
}

module.exports = {
    toLogError: createMatcher('error'),
    toLogWarning: createMatcher('warning'),
};
