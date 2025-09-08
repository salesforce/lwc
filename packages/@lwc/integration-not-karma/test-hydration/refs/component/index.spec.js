export default {
    test(target, snapshots, consoleCalls) {
        const expected = target.shadowRoot.querySelector('x-child');
        const actual = target.getRef('foo');

        expect(expected).toBe(actual);

        expect(consoleCalls.warn).toHaveSize(0);
        expect(consoleCalls.error).toHaveSize(0);
    },
};
