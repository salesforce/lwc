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

        expect(consoleCalls.error).toHaveSize(2);
        expect(consoleCalls.error[0][0].message).toContain(
            'Hydration mismatch: incorrect node type received'
        );
        expect(consoleCalls.error[1][0].message).toContain('Hydration completed with errors.');
    },
};
