export default {
    test(target, snapshots, consoleCalls) {
        const expected = target.shadowRoot.querySelector('div');
        const actual = target.getRef('foo');

        expect(expected).toBe(actual);

        expect(consoleCalls.warn).toHaveSize(0);
        expect(consoleCalls.error).toHaveSize(0);
    },
};
