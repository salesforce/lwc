export default {
    snapshot(target) {
        return {
            child: target.shadowRoot.querySelector('x-child'),
        };
    },
    test(target, snapshots, consoleCalls) {
        const hydratedSnapshot = this.snapshot(target);
        expect(hydratedSnapshot.child).toBe(snapshots.child);

        TestUtils.expectConsoleCallsDev(consoleCalls, {
            warn: [
                'Validation opt out must be `true` or an array of attributes that should not be validated.',
            ],
            error: [],
        });
    },
};
