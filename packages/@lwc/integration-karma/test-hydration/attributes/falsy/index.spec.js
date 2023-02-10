export default {
    advancedTest(target, { Component, hydrateComponent, consoleSpy }) {
        hydrateComponent(target, Component, {});

        const divs = target.shadowRoot.querySelectorAll('div');

        const expectedAttrValues = ['false', null, null, 'true', '', '0', 'NaN'];

        expect(divs).toHaveSize(expectedAttrValues.length);

        for (let i = 0; i < expectedAttrValues.length; i++) {
            expect(divs[i].getAttribute('data-foo')).toEqual(expectedAttrValues[i]);
        }

        const consoleCalls = consoleSpy.calls;
        expect(consoleCalls.warn).toHaveSize(0);
        expect(consoleCalls.error).toHaveSize(0);
    },
};
