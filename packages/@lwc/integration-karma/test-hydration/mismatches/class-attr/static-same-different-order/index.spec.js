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

        expect(p).not.toBe(snapshots.p);
        expect(p.className).toBe('c1 c2 c3');

        expect(consoleCalls.error).toHaveSize(2);
        expect(consoleCalls.error[0][0].message).toContain(
            'Mismatch hydrating element <p>: attribute "class" has different values, expected "c1 c2 c3" but found "c3 c2 c1"'
        );
        expect(consoleCalls.error[1][0].message).toContain('Hydration completed with errors.');
    },
};
