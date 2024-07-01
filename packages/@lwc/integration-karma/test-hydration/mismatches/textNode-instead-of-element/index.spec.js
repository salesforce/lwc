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

        TestUtils.expectConsoleCallsDev(consoleCalls, {
            error: [
                '[LWC error]: Hydration mismatch: incorrect node type received',
                'Hydration completed with errors.',
            ],
        });
    },
};
