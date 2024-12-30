export default {
    props: {
        ssr: true,
    },
    clientProps: {
        ssr: false,
    },
    snapshot(target) {
        const child = target.shadowRoot.querySelector('x-child');
        const div = child.shadowRoot.querySelector('div');

        return {
            child,
            div,
        };
    },
    test(target, snapshots, consoleCalls) {
        const snapshotAfterHydration = this.snapshot(target);
        expect(snapshotAfterHydration.child).not.toBe(snapshots.child);
        expect(snapshotAfterHydration.div).not.toBe(snapshots.div);

        const { child } = snapshotAfterHydration;
        expect(child.getAttribute('class')).toBe('static mutatis');
        expect(child.getAttribute('data-mismatched-attr')).toBe('is-client');

        TestUtils.expectConsoleCallsDev(consoleCalls, {
            error: [],
            warn: [
                `Hydration attribute mismatch on:<x-child class="static mutatis" data-mismatched-attr="is-client"></x-child>
- rendered on server:data-mismatched-attr="is-server"
- expected on client:data-mismatched-attr="is-client"`,
                'Hydration completed with errors.',
            ],
        });
    },
};
