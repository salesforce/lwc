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
        expect(consoleCalls.error).toHaveSize(2);
        expect(consoleCalls.error[0][0].message).toContain(
            '[LWC error]: Hydration mismatch: expecting element with tag "x-client" but found "x-server".'
        );
        expect(consoleCalls.error[1][0].message).toContain('Hydration completed with errors.');
    },
};
