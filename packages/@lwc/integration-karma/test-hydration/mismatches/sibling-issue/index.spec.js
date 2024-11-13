export default {
    props: {
        showMe: false,
    },
    clientProps: {
        showMe: true,
    },
    snapshot(target) {
        return {
            div: target.shadowRoot.querySelector('div'),
        };
    },
    test(target, snapshots, consoleCalls) {
        const div = target.shadowRoot.querySelector('div');

        expect(snapshots.div).toBeNull();
        expect(div).toBeDefined();

        TestUtils.expectConsoleCallsDev(consoleCalls, {
            warn: [
                'Hydration mismatch: incorrect number of rendered nodes. Client produced more nodes than the server.',
                'Hydration completed with errors.',
            ],
        });
    },
};
