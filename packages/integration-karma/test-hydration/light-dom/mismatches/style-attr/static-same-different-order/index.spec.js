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
            style: p.getAttribute('style'),
        };
    },
    test(target, snapshots, consoleCalls) {
        const p = target.querySelector('p');

        expect(p).toBe(snapshots.p);
        expect(p.getAttribute('style')).toBe(snapshots.style);

        expect(consoleCalls.error).toHaveSize(0);
    },
};
