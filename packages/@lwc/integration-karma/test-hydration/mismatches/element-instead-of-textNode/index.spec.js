export default {
    props: {
        showAsText: false,
    },
    clientProps: {
        showAsText: true,
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

        expect(text.nodeType).toBe(Node.TEXT_NODE);

        TestUtils.expectConsoleCallsDev(consoleCalls, {
            error: [],
            warn: [
                'Hydration node mismatch on: #text - rendered on server: <span> - expected on client: #text',
                'Hydration completed with errors.',
            ],
        });
    },
};
