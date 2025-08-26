export default {
    props: {
        classes: 'c1 c2 c3',
    },
    clientProps: {
        classes: 'c3 c2 c1',
    },
    snapshot(target) {
        const p = target.shadowRoot.querySelector('p');
        return {
            p,
            classes: p.className,
        };
    },
    test(target, snapshots, consoleCalls) {
        const p = target.shadowRoot.querySelector('p');

        expect(p).toBe(snapshots.p);
        expect(p.className).toBe(snapshots.classes);

        TestUtils.expectConsoleCallsDev(consoleCalls, {
            error: [],
            warn: [],
        });
    },
};
