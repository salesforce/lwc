function getAllSpans(target) {
    const children = [...target.shadowRoot.querySelectorAll('x-child')];
    return children.flatMap((child) => [...child.shadowRoot.querySelectorAll('span')]);
}
export default {
    snapshot(target) {
        const spans = getAllSpans(target);
        return { spans };
    },
    test(target, snapshots, consoleCalls) {
        const spans = getAllSpans(target);
        expect(spans.length).toBe(snapshots.spans.length);
        for (let i = 0; i < spans.length; i += 1) {
            expect(spans[i]).toBe(snapshots.spans[i]);
        }
        expect(consoleCalls.warn).toHaveSize(0);
        expect(consoleCalls.error).toHaveSize(0);
    },
};
