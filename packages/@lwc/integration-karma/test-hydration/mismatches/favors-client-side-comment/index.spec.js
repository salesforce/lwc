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

        expect(consoleCalls.warn).toHaveSize(1);
        expect(consoleCalls.warn[0][0].message).toContain(
            'Hydration mismatch: comment values do not match, will recover from the difference'
        );
    },
};
