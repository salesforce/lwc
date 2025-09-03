export default {
    snapshot(target) {
        const p = target.shadowRoot.querySelector('div');
        return {
            p,
            style: p.getAttribute('style'),
        };
    },
    test(target, snapshots, consoleCalls) {
        const p = target.shadowRoot.querySelector('div');

        expect(p).toBe(snapshots.p);
        expect(p.getAttribute('style')).toBe(snapshots.style);

        expect(consoleCalls.error).toHaveSize(0);
    },
};
