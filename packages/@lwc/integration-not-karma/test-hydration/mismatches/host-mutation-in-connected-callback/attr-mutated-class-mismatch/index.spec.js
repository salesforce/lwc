import { expectConsoleCallsDev } from '../../../../helpers/utils.js';

/** @type {import('../../../../configs/plugins/test-hydration.js').TestConfig} */
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
        expect(child.getAttribute('data-foo')).toBe('bar');
        expect(child.getAttribute('data-mutatis')).toBe('mutandis');
        expect(child.getAttribute('class')).toBe('is-client');

        expectConsoleCallsDev(consoleCalls, {
            error: [],
            warn: [
                'Hydration attribute mismatch on: <x-child> - rendered on server: class="is-server" - expected on client: class="is-client"',
                'Hydration completed with errors.',
            ],
        });
    },
};
