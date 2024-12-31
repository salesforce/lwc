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
            error: [],
            warn: [
                'Hydration attribute mismatch on: P - rendered on server: title="ssr-title" - expected on client: title="client-title"',
                'Hydration attribute mismatch on: P - rendered on server: data-another-diff="ssr-val" - expected on client: data-another-diff="client-val"',
                'Hydration completed with errors.',
            ],
        });
    },
};
