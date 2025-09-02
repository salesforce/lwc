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
                'Hydration attribute mismatch on: <p> - rendered on server: class="" - expected on client: class="yolo"',
                'Hydration completed with errors.',
            ],
        });
    },
};
