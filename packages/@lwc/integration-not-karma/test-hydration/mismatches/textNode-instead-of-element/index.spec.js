import { expectConsoleCallsDev } from '../../../helpers/utils.js';
export default {
    props: {
        showAsText: true,
    },
    clientProps: {
        showAsText: false,
    },
    snapshot(target) {
        return {
            text: target.shadowRoot.firstChild.textContent,
        };
    },
    test(target, snapshots, consoleCalls) {
        const hydratedSnapshot = this.snapshot(target);

        expect(hydratedSnapshot.text).toBe(snapshots.text);

        const text = target.shadowRoot.firstChild;

        expect(text.nodeType).toBe(Node.ELEMENT_NODE);

        expectConsoleCallsDev(consoleCalls, {
            error: [],
            warn: [
                'Hydration node mismatch on: <span> - rendered on server: #text - expected on client: <span>',
                'Hydration completed with errors.',
            ],
        });
    },
};
