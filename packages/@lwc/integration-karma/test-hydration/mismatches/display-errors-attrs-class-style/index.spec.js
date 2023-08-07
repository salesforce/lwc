export default {
    props: {
        classes: 'ssr-class',
        styles: 'background-color: red;',
        attrs: 'ssr-attrs',
    },
    clientProps: {
        classes: 'client-class',
        styles: 'background-color: blue;',
        attrs: 'client-attrs',
    },
    snapshot(target) {
        return {
            p: target.shadowRoot.querySelector('p'),
        };
    },
    test(target, snapshots, consoleCalls) {
        const p = target.shadowRoot.querySelector('p');

        expect(p).not.toBe(snapshots.p);

        expect(p.className).toBe('client-class');
        expect(p.getAttribute('style')).toBe('background-color: blue;');
        expect(p.getAttribute('data-attrs')).toBe('client-attrs');

        expect(consoleCalls.error).toHaveSize(4);
        expect(consoleCalls.error[0][0].message).toContain(
            'Mismatch hydrating element <p>: attribute "data-attrs" has different values, expected "client-attrs" but found "ssr-attrs"'
        );
        expect(consoleCalls.error[1][0].message).toContain(
            'Mismatch hydrating element <p>: attribute "class" has different values, expected "client-class" but found "ssr-class"'
        );
        expect(consoleCalls.error[2][0].message).toContain(
            'Mismatch hydrating element <p>: attribute "style" has different values, expected "background-color: blue;" but found "background-color: red;"'
        );
        expect(consoleCalls.error[3][0].message).toContain('Hydration completed with errors.');
    },
};
