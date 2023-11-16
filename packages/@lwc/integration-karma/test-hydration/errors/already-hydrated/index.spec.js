export default {
    advancedTest(target, { Component, hydrateComponent, consoleSpy }) {
        hydrateComponent(target, Component, {});

        hydrateComponent(target, Component, {});

        const consoleCalls = consoleSpy.calls;
        const expectedMessage = '"hydrateComponent" expects an element that is not hydrated.';
        expect(consoleCalls.warn).toHaveSize(1);
        expect(consoleCalls.warn[0][0]).toContain(expectedMessage);
    },
};
