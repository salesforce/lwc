import { expectConsoleCallsDev } from '../../../helpers/utils.js';
export default {
    props: {
        showAsText: true,
    },
    clientProps: {
        showAsText: false,
    },
    snapshot(target) {
        const text = target.shadowRoot.firstChild;
        return {
            text,
        };
    },
    test(target, snapshots, consoleCalls) {
        const comment = target.shadowRoot.firstChild;

        expect(comment.nodeType).toBe(Node.COMMENT_NODE);
        expect(comment.nodeValue).toBe(snapshots.text.nodeValue);

        expectConsoleCallsDev(consoleCalls, {
            error: [],
            warn: [
                'Hydration node mismatch on: #comment - rendered on server: #text - expected on client: #comment',
                'Hydration completed with errors.',
            ],
        });
    },
};
