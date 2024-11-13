export default {
    snapshot(target) {
        return {
            h1: target.shadowRoot.querySelector('h1'),
        };
    },
    test(target, snapshots, consoleCalls) {
        const h1 = target.shadowRoot.querySelector('h1');
        expect(h1).toBe(snapshots.h1);

        expect(consoleCalls.warn).toHaveSize(0);
        expect(consoleCalls.error).toHaveSize(0);
    },
};
