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

            expect(consoleCalls.error).toHaveSize(0);
        } else {
            expect(p).not.toBe(snapshots.p);
            expect(p.getAttribute('style')).toBe(
                'margin: 1px; border-color: red; background-color: red;'
            );

            TestUtils.expectConsoleCallsDev(consoleCalls, {
                error: [
                    'Mismatch hydrating element <p>: attribute "style" has different values, expected "margin: 1px; border-color: red; background-color: red;" but found "background-color: red; border-color: red; margin: 1px;"',
                    'Hydration completed with errors.',
                ],
            });
        }
    },
};
