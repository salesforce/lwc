/**
 * Custom matchers implemented as part of the migration from Karma to Web Test
 * Runner. Should be removed and usage replaced with chai assertions.
 * @type {Chai.ChaiPlugin}
 */
export const registerJasmineMatchers = (chai, utils) => {
    const matchers = {
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

    for (const [name, impl] of Object.entries(matchers)) {
        utils.addMethod(chai.Assertion.prototype, name, impl);
    }
};
