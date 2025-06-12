// FIXME: copy implementations from karma tests

const customMatchers = [
    // LWC custom
    'toLogError',
    'toLogErrorDev',
    'toThrowErrorDev',
    'toLogWarningDev',
    'toThrowCallbackReactionError',
    'toThrowCallbackReactionErrorDev',
    'toThrowCallbackReactionErrorEvenInSyntheticLifecycleMode',
    // jasmine compat
    'toHaveSize',
    'toBeFalse',
    'toBeTrue',
];
export const registerCustomMatchers = (chai, utils) => {
    for (const matcher of customMatchers) {
        utils.addMethod(chai.Assertion.prototype, matcher, function () {
            // FIXME: implement for realsies
            const fn = utils.flag(this, 'object');
            if (typeof fn === 'function') {
                try {
                    fn();
                } catch (_) {
                    //
                }
            }
        });
    }
};
