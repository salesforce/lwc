import { expectConsoleCallsDev } from '../../../../helpers/utils.js';
export default {
    props: {},
    snapshot(target) {
        const div = target.shadowRoot.querySelector('x-child').shadowRoot.querySelector('div');

        return {
            div,
        };
    },
    test(target, snapshots, consoleCalls) {
        const snapshotAfterHydration = this.snapshot(target);
        expect(snapshotAfterHydration.div).toBe(snapshots.div);
        const child = target.shadowRoot.querySelector('x-child');
        expect(child.getAttribute('data-foo')).toBe('bar');
        expect(child.getAttribute('data-mutatis')).toBe('mutandis');

        expectConsoleCallsDev(consoleCalls, {
            warn: [],
            error: [],
        });
    },
};
