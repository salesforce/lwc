export default {
    props: {
        styles: 'color: burlywood;',
    },
    clientProps: {
        styles: '',
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
        expect(p.getAttribute('style')).toBe(null);

        TestUtils.expectConsoleCallsDev(consoleCalls, {
            warn: [
                'Mismatch hydrating element <p>: attribute "style" has different values, expected "" but found "color: burlywood;"',
                'Hydration completed with errors.',
            ],
        });
    },
};
