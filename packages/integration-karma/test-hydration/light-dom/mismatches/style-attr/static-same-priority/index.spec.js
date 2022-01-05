export default {
    snapshot(target) {
        const p = target.querySelector('p');
        return {
            p,
            style: p.getAttribute('style'),
        };
    },
    test(target, snapshots) {
        const p = target.querySelector('p');

        expect(p).toBe(snapshots.p);
        expect(p.getAttribute('style')).toBe(snapshots.style);
    },
};
