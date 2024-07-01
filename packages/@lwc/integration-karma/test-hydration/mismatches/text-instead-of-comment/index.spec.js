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

        TestUtils.expectConsoleCallsDev(consoleCalls, {
            error: [
                'Hydration mismatch: incorrect node type received',
                'Hydration completed with errors.',
            ],
        });
    },
};
