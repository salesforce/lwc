export default {
    advancedTest(target, { Component, hydrateComponent, consoleSpy }) {
        hydrateComponent(target, Component, {});
        const consoleCalls = consoleSpy.calls;
        // Validate there is no class attribute hydration mismatch
        expect(consoleCalls.error).toHaveSize(0);
    },
};
