import { expectConsoleCallsDev } from '../../../../../helpers/utils.js';

/** @type {import('../../../../../configs/plugins/test-hydration.js').TestConfig} */
export default {
    snapshot(target) {
        return {
            child: target.shadowRoot.querySelector('x-child'),
        };
    },
    test(target, snapshots, consoleCalls) {
        const hydratedSnapshot = this.snapshot(target);
        expect(hydratedSnapshot.child).toBe(snapshots.child);

        expectConsoleCallsDev(consoleCalls, {
            warn: [
                '`validationOptOut` must be `true` or an array of attributes that should not be validated.',
            ],
            error: [],
        });
    },
};
