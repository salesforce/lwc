export default {
    props: {
        dynamicStyle: 'background-color: red; border-color: red; margin: 1px;',
    },
    clientProps: {
        dynamicStyle: 'margin: 1px; border-color: red; background-color: red;',
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
        expect(p.getAttribute('style')).toBe(
            'margin: 1px; border-color: red; background-color: red;'
        );

        expect(consoleCalls.error).toHaveSize(2);
        expect(consoleCalls.error[0][0].message).toContain(
            'Mismatch hydrating element <p>: attribute "style" has different values, expected "margin: 1px; border-color: red; background-color: red;" but found "background-color: red; border-color: red; margin: 1px;"'
        );
        expect(consoleCalls.error[1][0].message).toContain('Hydration completed with errors.');
    },
};
