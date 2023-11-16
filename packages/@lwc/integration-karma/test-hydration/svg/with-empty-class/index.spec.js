export default {
    test(elm, snapshots, consoleCalls) {
        // TODO [#3548]: inconsistent rendering of empty class/style
        expect(elm.shadowRoot.querySelector('svg circle').getAttribute('class')).toEqual('');
        expect(consoleCalls.warn).toHaveSize(0);
        expect(consoleCalls.error).toHaveSize(0);
    },
};
