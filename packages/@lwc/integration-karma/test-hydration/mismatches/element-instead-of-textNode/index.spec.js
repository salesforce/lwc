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
            error: [
                '[LWC error]: Hydration mismatch: incorrect node type received',
                'Hydration completed with errors.',
            ],
        });
    },
};
