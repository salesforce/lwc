import { expectConsoleCallsDev } from '../../../../helpers/utils.js';

/** @type {import('../../../../configs/plugins/test-hydration.js').TestConfig} */
export default {
    props: {},
    snapshot(target) {
        const div = target.shadowRoot.querySelector('c-child').shadowRoot.querySelector('div');

        return {
            div,
        };
    },
    test(target, snapshots, consoleCalls) {
        const snapshotAfterHydration = this.snapshot(target);
        expect(snapshotAfterHydration.div).toBe(snapshots.div);
        expect(target.shadowRoot.querySelector('c-child').style.color).toBe('blue');

        expectConsoleCallsDev(consoleCalls, {
            warn: [],
            error: [],
        });
    },
};
