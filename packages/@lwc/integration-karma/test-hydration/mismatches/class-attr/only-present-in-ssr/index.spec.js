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
            warn: [
                '[LWC warn]: Mismatch hydrating element <x-child>: attribute "class" has different values, expected "" but found "foo"\n',
                '[LWC warn]: Hydration completed with errors.\n',
            ],
        });
    },
};
