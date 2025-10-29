/** @type {import('../../../../../configs/plugins/test-hydration.js').TestConfig} */
export default {
    snapshot(target) {
        return {
            child: target.shadowRoot.querySelector('c-child'),
        };
    },
    test(target, snapshots, consoleCalls) {
        const hydratedSnapshot = this.snapshot(target);
        expect(hydratedSnapshot.child).toBe(snapshots.child);
        expect(consoleCalls.warn).toHaveSize(0);
        expect(consoleCalls.error).toHaveSize(0);
    },
};
