import { expectConsoleCallsDev } from '../../../helpers/utils.js';

/** @type {import('../../../configs/plugins/test-hydration.js').TestConfig} */
export default {
    props: {
        ctor: 'server',
    },
    clientProps: {
        ctor: 'client',
    },
    snapshot(target) {
        const cmp = target.shadowRoot.querySelector('c-server');
        return {
            tagName: cmp.tagName.toLowerCase(),
        };
    },
    test(target, snapshots, consoleCalls) {
        // Server side constructor
        expect(snapshots.tagName).toBe('c-server');
        // Client side constructor
        expect(target.shadowRoot.querySelector('c-client')).not.toBeNull();

        expectConsoleCallsDev(consoleCalls, {
            error: [],
            warn: [
                'Hydration node mismatch on: <c-client> - rendered on server: <c-server> - expected on client: <c-client>',
                'Hydration completed with errors.',
            ],
        });
    },
};
