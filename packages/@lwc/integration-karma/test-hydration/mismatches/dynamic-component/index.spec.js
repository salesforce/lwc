export default {
    props: {
        ctor: 'server',
    },
    clientProps: {
        ctor: 'client',
    },
    snapshot(target) {
        const cmp = target.shadowRoot.querySelector('x-server');
        return {
            tagName: cmp.tagName.toLowerCase(),
        };
    },
    test(target, snapshots, consoleCalls) {
        // Server side constructor
        expect(snapshots.tagName).toBe('x-server');
        // Client side constructor
        expect(target.shadowRoot.querySelector('x-client')).not.toBeNull();

        TestUtils.expectConsoleCallsDev(consoleCalls, {
            error: [
                '[LWC error]: Hydration mismatch: expecting element with tag "x-client" but found "x-server".',
                'Hydration completed with errors.',
            ],
        });
    },
};
