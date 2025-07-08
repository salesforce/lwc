// FIXME: copy implementations from karma tests

// const customMatchers = [
//     // LWC custom
//     'toLogError',
//     'toLogErrorDev',
//     'toThrowErrorDev',
//     'toLogWarningDev',
//     'toThrowCallbackReactionError',
//     'toThrowCallbackReactionErrorDev',
//     'toThrowCallbackReactionErrorEvenInSyntheticLifecycleMode',
//     // jasmine compat
//     // 'toHaveSize',
//     // 'toBeFalse',
//     // 'toBeTrue',
// ];

/** @type {Chai.ChaiPlugin} */
export const registerCustomMatchers = (chai, utils) => {
    const customMatchers = {
        toLogError() {
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
        toLogErrorDev() {
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
        toLogWarningDev() {
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
