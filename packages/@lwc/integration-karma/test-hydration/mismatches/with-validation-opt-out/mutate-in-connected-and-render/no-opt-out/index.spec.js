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
                `Hydration attribute mismatch on:<x-child data-mutate-during-render="true" data-mutate-during-connected-callback="true"></x-child>
- rendered on server:data-mutate-during-render="true"
- expected on client:data-mutate-during-render="false"`,
                'Hydration completed with errors.',
            ],
        });
    },
};
