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
        if (process.env.DISABLE_STATIC_CONTENT_OPTIMIZATION) {
            TestUtils.expectConsoleCallsDev(consoleCalls, {
                error: [],
                warn: [
                    'Hydration mismatch: text values do not match, will recover from the difference',
                    'Server rendered more nodes than the client.',
                    'Hydration completed with errors.',
                ],
            });
        } else {
            TestUtils.expectConsoleCallsDev(consoleCalls, {
                error: [],
                warn: [
                    'Server rendered more nodes than the client.',
                    'Hydration completed with errors.',
                ],
            });
        }
    },
};
