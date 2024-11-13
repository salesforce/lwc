export default {
    props: {
        classes: 'c1 c2 c3',
    },
    clientProps: {
        classes: 'c2 c3 c4',
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

        expect(p).not.toBe(snapshots.p);
        expect(p.className).not.toBe(snapshots.classes);

        TestUtils.expectConsoleCallsDev(consoleCalls, {
            warn: [
                'Mismatch hydrating element <p>: attribute "class" has different values, expected "c2 c3 c4" but found "c1 c2 c3"',
                'Hydration completed with errors.',
            ],
        });
    },
};
