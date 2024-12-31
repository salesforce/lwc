export default {
    advancedTest(target, { Component, hydrateComponent, consoleSpy }) {
        // This simulates a condition where the server-rendered markup has
        // a classname that is incorrectly missing in the client-side
        // VDOM at the time of validation.
        //
        // Outside of this test, the tested condition should never be reached
        // unless something in SSR or hydration logic is broken.
        target.shadowRoot.querySelector('x-child').classList.add('foo');

        hydrateComponent(target, Component, {});

        const consoleCalls = consoleSpy.calls;
        TestUtils.expectConsoleCallsDev(consoleCalls, {
            error: [],
            warn: [
                'Hydration attribute mismatch on: X-CHILD - rendered on server: class="foo" - expected on client: class=""',
                'Hydration completed with errors.',
            ],
        });
    },
};
