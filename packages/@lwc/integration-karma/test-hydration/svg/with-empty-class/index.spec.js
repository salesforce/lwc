export default {
    test(elm, snapshots, consoleCalls) {
        expect(elm.shadowRoot.querySelector('svg circle').getAttribute('class')).toEqual(null);
        expect(consoleCalls.warn).toHaveSize(0);
        expect(consoleCalls.error).toHaveSize(0);
    },
};
