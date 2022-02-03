export default {
    advancedTest(target, { Component, hydrateComponent, consoleSpy }) {
        hydrateComponent(target, Component, {});

        hydrateComponent(target, Component, {});
        customElements.define(target.tagName.toLowerCase(), Component.CustomElementConstructor);

        const consoleCalls = consoleSpy.calls;
        const expectedMessage =
            '"hydrateComponent" expects an element that is not hydrated, instead received';
        expect(consoleCalls.warn).toHaveSize(2);
        expect(consoleCalls.warn[0][0]).toContain(expectedMessage);
        expect(consoleCalls.warn[1][0]).toContain(expectedMessage);
    },
};
