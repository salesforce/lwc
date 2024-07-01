// SSR has `class="null"`, whereas the client has no class at all.
// This is to test if hydration is smart enough to recognize the difference between a null
// attribute and the literal string "null".
export default {
    props: {
        className: 'null',
    },
    clientProps: {
        className: undefined,
    },
    snapshot(target) {
        const p = target.shadowRoot.querySelector('p');
        return {
            p,
            className: p.className,
        };
    },
    test(target, snapshots, consoleCalls) {
        const p = target.shadowRoot.querySelector('p');

        expect(p).not.toBe(snapshots.p);
        expect(p.className).not.toBe(snapshots.className);

        TestUtils.expectConsoleCallsDev(consoleCalls, {
            warn: [],
            error: [
                'Mismatch hydrating element <p>: attribute "class" has different values, expected "" but found "null"',
                'Hydration completed with errors.',
            ],
        });
    },
};
