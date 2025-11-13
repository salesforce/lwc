import { expectConsoleCallsDev } from '../../../helpers/utils.js';

/** @type {import('../../../configs/plugins/test-hydration.js').TestConfig} */
export default {
    props: {
        showAsText: false,
    },
    clientProps: {
        showAsText: true,
    },
    snapshot(target) {
        const comment = target.shadowRoot.firstChild;
        return {
            comment,
        };
    },
    test(target, snapshots, consoleCalls) {
        const text = target.shadowRoot.firstChild;

        expect(text.nodeType).toBe(Node.TEXT_NODE);
        expect(text.nodeValue).toBe(snapshots.comment.nodeValue);

        expectConsoleCallsDev(consoleCalls, {
            error: [],
            warn: [
                'Hydration node mismatch on: #text - rendered on server: #comment - expected on client: #text',
                'Hydration completed with errors.',
            ],
        });
    },
};
