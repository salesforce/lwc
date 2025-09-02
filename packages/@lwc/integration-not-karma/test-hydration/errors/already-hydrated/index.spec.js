export default {
    advancedTest(target, { Component, hydrateComponent, consoleSpy }) {
        hydrateComponent(target, Component, {});

        hydrateComponent(target, Component, {});

        const consoleCalls = consoleSpy.calls;

        TestUtils.expectConsoleCalls(consoleCalls, {
            warn: ['"hydrateComponent" expects an element that is not hydrated.'],
        });
    },
};
