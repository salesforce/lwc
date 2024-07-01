export default {
    props: {
        showBlue: true,
    },
    clientProps: {
        showBlue: false,
    },
    snapshot(target) {
        return {
            text: target.shadowRoot.firstChild.innerText,
        };
    },
    test(target, snapshots, consoleCalls) {
        const hydratedSnapshot = this.snapshot(target);

        expect(hydratedSnapshot.text).not.toBe(snapshots.text);

        TestUtils.expectConsoleCallsDev(consoleCalls, {
            error: [
                'Server rendered more nodes than the client.',
                'Hydration completed with errors.',
            ],
        });
    },
};
