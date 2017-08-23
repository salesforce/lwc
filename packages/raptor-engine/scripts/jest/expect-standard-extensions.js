const { keys, create } = Object;

expect.extend({
    toDeepEqualProxy(expected, received) {
        try {
            expect(received).toEqual(expected);
        } catch (e) {
            return {
                message: () => {
                    return this.utils.matcherHint('.not.toBe') + '\n\n' +
                        `Expected value to equal:\n` +
                        `  ${this.utils.printExpected(expected)}\n` +
                        `Received:\n` +
                        `  ${this.utils.printReceived(received)}`
                },
                pass: false
            }
        }

        return {
            message: () => {
                return this.utils.matcherHint('.toBe') + '\n\n' +
                    `Expected value to contain:\n` +
                    `  ${this.utils.printExpected(expected)}\n` +
                    `Received:\n` +
                    `  ${this.utils.printReceived(received)}`
            },
            pass: true
        }
    }
});