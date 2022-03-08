export default {
    props: {
        ssr: true,
    },
    clientProps: {
        ssr: false,
    },
    snapshot(target) {
        const p = target.shadowRoot.querySelector('p');
        return {
            p,
        };
    },
    test(target, snapshots, consoleCalls) {
        const p = target.shadowRoot.querySelector('p');
        expect(p).not.toBe(snapshots.p);
        expect(p.getAttribute('title')).toBe('client-title');
        expect(p.getAttribute('data-same')).toBe('same-value');
        expect(p.getAttribute('data-another-diff')).toBe('client-val');

        expect(consoleCalls.error).toHaveSize(3);
        expect(consoleCalls.error[0][0].message).toContain(
            'Mismatch hydrating element <p>: attribute "title" has different values, expected "client-title" but found "ssr-title"'
        );
        expect(consoleCalls.error[1][0].message).toContain(
            'Mismatch hydrating element <p>: attribute "data-another-diff" has different values, expected "client-val" but found "ssr-val"'
        );
        expect(consoleCalls.error[2][0].message).toContain('Hydration completed with errors.');
    },
};
