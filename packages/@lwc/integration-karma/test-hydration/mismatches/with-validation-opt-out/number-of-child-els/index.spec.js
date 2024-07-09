export default {
    props: {
        isServer: true,
    },
    clientProps: {
        isServer: false,
    },
    snapshot(target) {
        return {
            childMarkup: target.shadowRoot.firstChild.firstChild.shadowRoot.innerHTML,
        };
    },
    test(target, snapshots, consoleCalls) {
        const hydratedSnapshot = this.snapshot(target);
        expect(hydratedSnapshot.childMarkup).not.toBe(snapshots.childMarkup);

        TestUtils.expectConsoleCallsDev(consoleCalls, {
            warn: [],
            error: [
                'Hydration mismatch: incorrect number of rendered nodes. Client produced more nodes than the server.',
                'Hydration completed with errors.',
            ],
        });
    },
};
