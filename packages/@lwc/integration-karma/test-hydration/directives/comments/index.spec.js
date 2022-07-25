export default {
    props: {
        control: true,
    },
    snapshot(target) {
        const [firstComment, p] = target.shadowRoot.childNodes;
        const [secondComment, text] = p.childNodes;
        return {
            firstComment,
            p,
            secondComment,
            text,
        };
    },
    test(target, snapshots) {
        const [firstComment, p] = target.shadowRoot.childNodes;
        const [secondComment, text] = p.childNodes;

        expect(firstComment).toBe(snapshots.firstComment);
        expect(firstComment.nodeValue).toBe('first comment');
        expect(p).toBe(snapshots.p);
        expect(secondComment).toBe(snapshots.secondComment);
        expect(secondComment.nodeValue).toBe('comment inside element');
        expect(text).toBe(snapshots.text);
    },
};
