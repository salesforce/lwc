export default {
    props: {
        classes: 'yolo',
    },
    clientProps: {
        classes: '',
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
        expect(p.className).toBe('');

        TestUtils.expectConsoleCallsDev(consoleCalls, {
            error: [
                'Mismatch hydrating element <p>: attribute "class" has different values, expected "" but found "yolo"',
                'Hydration completed with errors.',
            ],
        });
    },
};
