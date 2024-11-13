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

        TestUtils.expectConsoleCallsDev(consoleCalls, {
            error: [],
            warn: [
                'Hydration mismatch: incorrect node type received',
                'Hydration completed with errors.',
            ],
        });
    },
};
