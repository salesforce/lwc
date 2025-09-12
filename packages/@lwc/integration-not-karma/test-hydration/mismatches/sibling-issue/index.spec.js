import { expectConsoleCallsDev } from '../../../helpers/utils.js';

export default {
    props: {
        showMe: false,
    },
    clientProps: {
        showMe: true,
    },
    snapshot(target) {
        return {
            div: target.shadowRoot.querySelector('div'),
        };
    },
    test(target, snapshots, consoleCalls) {
        const div = target.shadowRoot.querySelector('div');

        expect(snapshots.div).toBeNull();
        expect(div).toBeDefined();

        expectConsoleCallsDev(consoleCalls, {
            error: [],
            warn: [
                'Hydration child node mismatch on: #document-fragment - rendered on server:  - expected on client: #comment',
                'Hydration completed with errors.',
            ],
        });
    },
};
