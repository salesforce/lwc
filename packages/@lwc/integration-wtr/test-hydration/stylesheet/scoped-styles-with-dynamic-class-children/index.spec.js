/** @type {import('../../../configs/plugins/test-hydration.js').TestConfig} */
export default {
    advancedTest(target, { Component, hydrateComponent, consoleSpy }) {
        hydrateComponent(target, Component, {});
        expect(consoleSpy.calls.error).toHaveSize(0);
    },
};
