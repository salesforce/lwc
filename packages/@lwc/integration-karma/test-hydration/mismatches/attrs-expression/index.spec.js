export default {
    props: {
        foo: 'server',
    },
    clientProps: {
        foo: 'client',
    },
    snapshot(target) {
        const div = target.shadowRoot.querySelector('div');
        return {
            div,
        };
    },
    test(target, snapshots, consoleCalls) {
        const div = target.shadowRoot.querySelector('div');
        expect(div).not.toBe(snapshots.div);
        expect(div.getAttribute('data-foo')).toBe('client');
        expect(div.getAttribute('data-static')).toBe('same-value');

        TestUtils.expectConsoleCallsDev(consoleCalls, {
            warn: [
                'Mismatch hydrating element <div>: attribute "data-foo" has different values, expected "client" but found "server"',
                'Hydration completed with errors.',
            ],
        });
    },
};
