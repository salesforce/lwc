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
            classes: p.className,
        };
    },
    test(target, snapshots, consoleCalls) {
        const p = target.shadowRoot.querySelector('p');

        expect(p).toBe(snapshots.p);
        expect(p.className).toBe(snapshots.classes);

        expect(consoleCalls.error).toHaveSize(0);
    },
};
