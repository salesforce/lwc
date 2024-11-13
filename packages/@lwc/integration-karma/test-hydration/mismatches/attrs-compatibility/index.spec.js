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

        TestUtils.expectConsoleCallsDev(consoleCalls, {
            warn: [
                'Mismatch hydrating element <p>: attribute "title" has different values, expected "client-title" but found "ssr-title"',
                'Mismatch hydrating element <p>: attribute "data-another-diff" has different values, expected "client-val" but found "ssr-val"',
                'Hydration completed with errors.',
            ],
        });
    },
};
