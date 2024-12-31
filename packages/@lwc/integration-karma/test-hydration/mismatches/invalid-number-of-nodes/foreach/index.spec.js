export default {
    props: {
        colors: ['red', 'blue', 'green'],
    },
    clientProps: {
        colors: ['red', 'blue'],
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
            error: [],
            warn: [
                'Hydration child node mismatch on: UL - rendered on server: LI,LI,LI - expected on client: LI,LI',
                'Hydration completed with errors.',
            ],
        });
    },
};
