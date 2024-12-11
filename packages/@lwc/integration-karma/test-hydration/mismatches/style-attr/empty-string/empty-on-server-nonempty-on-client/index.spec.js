export default {
    props: {
        styles: '',
    },
    clientProps: {
        styles: 'color: burlywood;',
    },
    snapshot(target) {
        const p = target.shadowRoot.querySelector('p');
        return {
            p,
            styles: p.className,
        };
    },
    test(target, snapshots, consoleCalls) {
        const p = target.shadowRoot.querySelector('p');
        expect(p).not.toBe(snapshots.p);
        expect(p.getAttribute('style')).toBe('color: burlywood;');

        TestUtils.expectConsoleCallsDev(consoleCalls, {
            error: [],
            warn: [
                'Mismatch hydrating element <p>: attribute "style" has different values, expected "color: burlywood;" but found ""',
                'Hydration completed with errors.',
            ],
        });
    },
};
