export default {
    advancedTest(target, { Component, hydrateComponent, consoleSpy }) {
        hydrateComponent(target, Component, {});

        const h1 = target.shadowRoot.querySelector('h1');
        const h2 = target.shadowRoot.querySelector('h2');
        const div = target.shadowRoot.querySelector('div');

        expect(getComputedStyle(h1).color).toEqual('rgb(255, 0, 0)');
        expect(getComputedStyle(h1).backgroundColor).toEqual('rgb(0, 0, 255)');

        expect(getComputedStyle(h2).color).toEqual('rgb(0, 128, 0)');

        expect(getComputedStyle(div).color).toEqual('rgb(128, 0, 128)');
        expect(getComputedStyle(div).backgroundColor).toEqual('rgb(255, 255, 0)');

        const consoleCalls = consoleSpy.calls;
        expect(consoleCalls.warn).toHaveSize(0);
    },
};
