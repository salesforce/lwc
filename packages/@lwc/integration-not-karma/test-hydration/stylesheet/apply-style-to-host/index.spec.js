export default {
    test(elm) {
        // should apply style to the host element
        expect(window.getComputedStyle(elm).marginLeft).toBe('10px');

        // should apply style to the host element with the matching attributes
        elm.setAttribute('data-styled', true);
        expect(window.getComputedStyle(elm).marginLeft).toBe('20px');
    },
};
