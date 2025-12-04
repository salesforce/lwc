/** @type {import('../../../configs/plugins/test-hydration.js').TestConfig} */
export default {
    async test(elm) {
        let div = elm.shadowRoot.querySelector('div');
        expect(window.getComputedStyle(div).marginLeft).toBe('10px');
        expect(window.getComputedStyle(div).marginRight).toBe('0px');

        elm.toggleTemplate();
        await Promise.resolve();
        div = elm.shadowRoot.querySelector('div');
        expect(window.getComputedStyle(div).marginLeft).toBe('0px');
        expect(window.getComputedStyle(div).marginRight).toBe('10px');
    },
};
