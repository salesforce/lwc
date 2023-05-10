export default {
    snapshot(target) {
        return {
            foo: target.shadowRoot.firstChild.firstChild.getAttribute('foo'),
        };
    },
    test(target, snapshots, consoleCalls) {
        const hydratedSnapshot = this.snapshot(target);
        expect(hydratedSnapshot.foo).toBe(snapshots.foo);
        expect(consoleCalls.error).toHaveSize(0);
    },
};
