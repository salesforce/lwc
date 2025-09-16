import { expectConsoleCallsDev } from '../../../../../helpers/utils.js';

export default {
    snapshot(target) {
        return {
            child: target.shadowRoot.querySelector('x-child'),
        };
    },
    test(target, snapshots, consoleCalls) {
        const hydratedSnapshot = this.snapshot(target);
        expect(hydratedSnapshot.child).not.toBe(snapshots.child);

        expectConsoleCallsDev(consoleCalls, {
            error: [],
            warn: [
                'Hydration attribute mismatch on: <x-child> - rendered on server: data-mutate-during-render="true" - expected on client: data-mutate-during-render="false"',
                'Hydration completed with errors.',
            ],
        });
    },
};
