export default {
    props: {
        isServer: true,
    },
    useCustomElementRegistry: true,
    snapshot(target) {
        return {
            p: target.querySelector('p'),
            span: target.querySelector('span'),
        };
    },
    test(target, snapshots) {
        const hydratedSnapshots = this.snapshot(target);

        expect(snapshots.p.textContent).toBe('hello from the server');
        expect(snapshots.span).toBeNull();

        expect(hydratedSnapshots.p).toBeNull();
        expect(hydratedSnapshots.span.textContent).toBe('hello from the client');
    },
};
