export default {
    test(elm) {
        const div = elm.shadowRoot.querySelector('div');
        expect(window.getComputedStyle(div).marginLeft).toBe('10px');
        expect(window.getComputedStyle(div).marginRight).toBe('0px');

        elm.toggleTemplate();
        return Promise.resolve().then(() => {
            const div = elm.shadowRoot.querySelector('div');
            expect(window.getComputedStyle(div).marginLeft).toBe('0px');
            expect(window.getComputedStyle(div).marginRight).toBe('10px');
        });
    },
};
