export default {
    test(_target, _snapshots, consoleCalls) {
        expect(consoleCalls.warn).toHaveSize(0);
        expect(consoleCalls.error).toHaveSize(0);
    },
};
