export default {
    props: {
        s1: 's1',
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

        expect(p).toBe(snapshots.p);
        expect(p.className).toBe(snapshots.classes);
        // static classes are skipped by hydration validation
        expect(consoleCalls.error).toHaveSize(0);
    },
};
