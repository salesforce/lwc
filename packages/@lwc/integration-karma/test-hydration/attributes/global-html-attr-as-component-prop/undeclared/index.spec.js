function getRelevantElements(target) {
    const children = [...target.shadowRoot.querySelectorAll('x-child')];
    const spans = children.flatMap((child) => [...child.shadowRoot.querySelectorAll('span')]);
    return { children, spans };
}

export default {
    snapshot(target) {
        return getRelevantElements(target);
    },
    test(target, snapshots, consoleCalls) {
        const { children, spans } = getRelevantElements(target);

        // same attributes on the children
        expect(children.length).toBe(snapshots.children.length);
        for (let i = 0; i < children.length; i++) {
            const attrs = new Set([...children[i].attributes].map((_) => _.name));
            const snapshotAttrs = new Set([...snapshots.children[i].attributes].map((_) => _.name));
            expect(attrs).toEqual(snapshotAttrs);
        }

        // spans are equivalent
        expect(spans.length).toBe(snapshots.spans.length);
        for (let i = 0; i < spans.length; i += 1) {
            expect(spans[i]).toBe(snapshots.spans[i]);
        }

        // no hydration mismatch warnings
        expect(
            consoleCalls.warn.filter((warning) => warning.some((_) => _.includes?.('Hydration')))
        ).toHaveSize(0);
    },
};
