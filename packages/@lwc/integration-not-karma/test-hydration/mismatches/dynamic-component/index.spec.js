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
            error: [],
            warn: [
                'Hydration node mismatch on: <x-client> - rendered on server: <x-server> - expected on client: <x-client>',
                'Hydration completed with errors.',
            ],
        });
    },
};
