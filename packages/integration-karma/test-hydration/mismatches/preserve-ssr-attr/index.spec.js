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
            title: p.title,
            ssrOnlyAttr: p.getAttribute('data-ssr-only'),
        };
    },
    test(target, snapshots) {
        const p = target.shadowRoot.querySelector('p');
        expect(p).toBe(snapshots.p);
        expect(p.title).toBe(snapshots.title);
        expect(p.getAttribute('data-ssr-only')).toBe(snapshots.ssrOnlyAttr);
    },
};
