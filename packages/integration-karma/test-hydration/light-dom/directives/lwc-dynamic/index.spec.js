export default {
    props: {
        label: 'dynamic',
    },
    snapshot(target) {
        const cmp = target.querySelector('x-dynamic-cmp');
        const p = cmp.querySelector('p');

        return {
            cmp,
            p,
        };
    },
    test(target, snapshots) {
        const cmp = target.querySelector('x-dynamic-cmp');
        const p = cmp.querySelector('p');

        expect(cmp).toBe(snapshots.cmp);
        expect(p).toBe(snapshots.p);
        expect(p.textContent).toBe('dynamic');
    },
};
