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

        expect(consoleCalls.error).toHaveSize(2);
        expect(consoleCalls.error[0][0].message).toContain(
            'Hydration mismatch: incorrect node type received'
        );
        expect(consoleCalls.error[1][0].message).toContain('Hydration completed with errors.');
    },
};
