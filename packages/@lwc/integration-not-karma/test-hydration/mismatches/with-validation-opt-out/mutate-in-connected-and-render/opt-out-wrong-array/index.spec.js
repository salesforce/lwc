import { expectConsoleCallsDev } from '../../../../../helpers/utils.js';

/** @type {import('../../../../../configs/plugins/test-hydration.js').TestConfig} */
export default {
    snapshot(target) {
        return {
            child: target.shadowRoot.querySelector('c-child'),
        };
    },
    test(target, snapshots, consoleCalls) {
        const hydratedSnapshot = this.snapshot(target);
        expect(hydratedSnapshot.child).not.toBe(snapshots.child);

        expectConsoleCallsDev(consoleCalls, {
            error: [],
            warn: [
                'Hydration attribute mismatch on: <c-child> - rendered on server: data-mutate-during-render="true" - expected on client: data-mutate-during-render="false"',
                'Hydration completed with errors.',
            ],
        });
    },
};
