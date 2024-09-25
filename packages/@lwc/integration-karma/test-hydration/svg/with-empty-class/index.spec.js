export default {
    test(elm, snapshots, consoleCalls) {
        expect(elm.shadowRoot.querySelector('svg circle').hasAttribute('class')).toBeFalse();
        expect(consoleCalls.warn).toHaveSize(0);
        expect(consoleCalls.error).toHaveSize(0);
    },
};
