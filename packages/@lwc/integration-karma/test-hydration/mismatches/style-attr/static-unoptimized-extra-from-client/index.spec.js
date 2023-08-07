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
        expect(p.getAttribute('style')).toBe(
            'background-color: red; border-color: red; margin: 1px;'
        );

        expect(consoleCalls.error).toHaveSize(2);
        expect(consoleCalls.error[0][0].message).toContain(
            '[LWC error]: Mismatch hydrating element <p>: attribute "style" has different values, expected "background-color: red;border-color: red;margin: 1px" but found "background-color: red; border-color: red"'
        );
        expect(consoleCalls.error[1][0].message).toContain('Hydration completed with errors.');
    },
};
