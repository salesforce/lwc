export default {
    snapshot(target) {
        return {
            child: target.shadowRoot.querySelector('x-child'),
        };
    },
    test(target, snapshots, consoleCalls) {
        const hydratedSnapshot = this.snapshot(target);
        expect(hydratedSnapshot.child).not.toBe(snapshots.child);

        TestUtils.expectConsoleCallsDev(consoleCalls, {
            error: [],
            warn: [
                'Mismatch hydrating element <x-child>: attribute "data-mutate-during-render" has different values, expected "false" but found "true"',
                'Hydration completed with errors.',
            ],
        });
    },
};
