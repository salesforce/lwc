export default {
    props: {
        ssr: true,
    },
    clientProps: {
        ssr: false,
    },
    snapshot(target) {
        const p = target.shadowRoot.querySelector('p');
        return {
            p,
            style: p.getAttribute('style'),
        };
    },
    test(target, snapshots, consoleCalls) {
        const p = target.shadowRoot.querySelector('p');

        // TODO [#4656]: static optimization causes mismatches for style/class only when ordering is different
        if (process.env.DISABLE_STATIC_CONTENT_OPTIMIZATION) {
            expect(p).toBe(snapshots.p);
            expect(p.getAttribute('style')).toBe(snapshots.style);

            expect(consoleCalls.warn).toHaveSize(0);
        } else {
            expect(p).not.toBe(snapshots.p);
            expect(p.getAttribute('style')).toBe(
                'margin: 1px; border-color: red; background-color: red;'
            );

            TestUtils.expectConsoleCallsDev(consoleCalls, {
                error: [],
                warn: [
                    'Hydration attribute mismatch on: <p> - rendered on server: style="background-color: red; border-color: red; margin: 1px;" - expected on client: style="margin: 1px; border-color: red; background-color: red;"',
                    'Hydration completed with errors.',
                ],
            });
        }
    },
};
