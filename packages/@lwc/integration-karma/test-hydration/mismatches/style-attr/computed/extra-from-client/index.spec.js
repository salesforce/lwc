export default {
    props: {
        dynamicStyle: 'background-color: red; border-color: red;',
    },
    clientProps: {
        dynamicStyle: 'background-color: red; border-color: red; margin: 1px;',
    },
    snapshot(target) {
        const p = target.shadowRoot.querySelector('p');
        return {
            p,
            style: p.getAttribute('style'),
        };
    },
    test(target, snapshots, consoleCalls) {
        const p = target.shadowRoot.querySelector('p');

        expect(p).not.toBe(snapshots.p);
        expect(p.getAttribute('style')).not.toBe(snapshots.style);
        expect(p.getAttribute('style')).toBe(
            'background-color: red; border-color: red; margin: 1px;'
        );

        TestUtils.expectConsoleCallsDev(consoleCalls, {
            error: [
                'Mismatch hydrating element <p>: attribute "style" has different values, expected "background-color: red; border-color: red; margin: 1px;" but found "background-color: red; border-color: red;"',
                'Hydration completed with errors.',
            ],
        });
    },
};
