export default {
    props: {
        c1: 'c1',
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

        expect(p).toBe(snapshots.p);
        expect(p.getAttribute('style')).toBe(snapshots.style);
        // static classes are skipped by hydration validation
        expect(consoleCalls.error).toHaveSize(0);
    },
};
