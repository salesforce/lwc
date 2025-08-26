export default {
    props: {
        showFirstComment: true,
    },
    clientProps: {
        showFirstComment: false,
    },
    snapshot(target) {
        const comment = target.shadowRoot.firstChild;
        return {
            comment,
            commentText: comment.nodeValue,
        };
    },
    test(target, snapshots, consoleCalls) {
        const comment = target.shadowRoot.firstChild;
        expect(comment).toBe(snapshots.comment);
        expect(comment.nodeValue).not.toBe(snapshots.commentText);
        expect(comment.nodeValue).toBe('second');

        TestUtils.expectConsoleCallsDev(consoleCalls, {
            error: [],
            warn: [
                'Hydration comment mismatch on: #comment - rendered on server: first - expected on client: second',
            ],
        });
    },
};
