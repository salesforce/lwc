export default {
    test(elm) {
        const parentDiv = elm.shadowRoot.querySelector('div');
        expect(window.getComputedStyle(parentDiv).marginLeft).toBe('10px');
        const childDiv = elm.shadowRoot.querySelector('x-child').shadowRoot.querySelector('div');
        expect(window.getComputedStyle(childDiv).marginLeft).toBe('0px');
    },
};
