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
                'Hydration child node mismatch on: <ul> - rendered on server: <li>,<li>,<li> - expected on client: <li>,<li>',
                'Hydration completed with errors.',
            ],
        });
    },
};
