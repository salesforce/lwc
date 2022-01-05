export default {
    props: {
        ssr: true,
    },
    clientProps: {
        ssr: false,
    },
    snapshot(target) {
        const p = target.querySelector('p');
        return {
            p,
            classes: p.className,
        };
    },
    test(target, snapshots) {
        const p = target.querySelector('p');

        expect(p).toBe(snapshots.p);
        expect(p.className).toBe(snapshots.classes);
    },
};
