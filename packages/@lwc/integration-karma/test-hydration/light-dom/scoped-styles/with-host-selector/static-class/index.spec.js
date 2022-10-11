export default {
    advancedTest(target, { Component, hydrateComponent, consoleSpy }) {
        hydrateComponent(target, Component, {});
        const consoleCalls = consoleSpy.calls;
        expect(consoleCalls.error).toHaveSize(0);
    },
};
