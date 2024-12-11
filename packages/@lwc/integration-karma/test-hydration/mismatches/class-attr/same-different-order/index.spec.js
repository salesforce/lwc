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
            classes: p.className,
        };
    },
    test(target, snapshots, consoleCalls) {
        const p = target.shadowRoot.querySelector('p');

        // TODO [#4656]: static optimization causes mismatches for style/class only when ordering is different
        if (process.env.DISABLE_STATIC_CONTENT_OPTIMIZATION) {
            expect(p).toBe(snapshots.p);
            expect(p.className).toBe(snapshots.classes);

            expect(consoleCalls.warn).toHaveSize(0);
        } else {
            expect(p).not.toBe(snapshots.p);
            expect(p.className).toBe('c1 c2 c3');

            TestUtils.expectConsoleCallsDev(consoleCalls, {
                error: [],
                warn: [
                    'Mismatch hydrating element <p>: attribute "class" has different values, expected "c1 c2 c3" but found "c3 c2 c1"',
                    'Hydration completed with errors.',
                ],
            });
        }
    },
};
