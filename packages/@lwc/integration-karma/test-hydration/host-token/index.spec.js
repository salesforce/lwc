export default {
    advancedTest(target, { Component, hydrateComponent, consoleSpy }) {
        hydrateComponent(target, Component, {});

        expect(consoleSpy.calls.warn).toHaveSize(0);
        expect(consoleSpy.calls.error).toHaveSize(0);
    },
};
