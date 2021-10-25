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

        expect(p).not.toBe(snapshots.p);
        expect(p.getAttribute('style')).not.toBe(snapshots.style);

        expect(consoleCalls.error).toHaveSize(3);
        expect(consoleCalls.error[0][0].message).toContain(
            'Error hydrating element: attribute "style" has different values'
        );
        expect(consoleCalls.error[1][0].message).toContain(
            'Hydration mismatch: incompatible attributes for element with tag "P"'
        );
        expect(consoleCalls.error[2][0]).toContain('Recovering from error while hydrating');
    },
};
