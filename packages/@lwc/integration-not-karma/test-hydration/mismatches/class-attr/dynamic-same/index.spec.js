export default {
    props: {
        classes: 'c1 c2 c3',
    },
    snapshot(target) {
        const p = target.shadowRoot.querySelector('p');
        return {
            p,
            classes: p.className,
        };
    },
    test(target, snapshots) {
        const p = target.shadowRoot.querySelector('p');

        expect(p).toBe(snapshots.p);
        expect(p.className).toBe(snapshots.classes);
    },
};
