export default {
    advancedTest(target, { Component, hydrateComponent, consoleSpy }) {
        customElements.define(target.tagName.toLowerCase(), Component.CustomElementConstructor);
        hydrateComponent(target, Component, {});

        const consoleCalls = consoleSpy.calls;
        const expectedMessage =
            '"hydrateComponent" expects an element that is not hydrated, instead received';
        expect(consoleCalls.warn).toHaveSize(1);
        expect(consoleCalls.warn[0][0]).toContain(expectedMessage);
    },
};
