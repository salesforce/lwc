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
            warn: [],
            error: [
                'Mismatch hydrating element <x-child>: attribute "data-mismatched-attr" has different values, expected "is-client" but found "is-server"',
                'Hydration completed with errors.',
            ],
        });
    },
};
