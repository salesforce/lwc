export default {
    props: {
        classes: '',
    },
    clientProps: {
        classes: 'yolo',
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
        expect(p.className).toBe('yolo');

        TestUtils.expectConsoleCallsDev(consoleCalls, {
            error: [],
            warn: [
                'Mismatch hydrating element <p>: attribute "class" has different values, expected "yolo" but found ""',
                'Hydration completed with errors.',
            ],
        });
    },
};
