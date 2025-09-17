export default {
    snapshot(target) {
        const p = target.shadowRoot.querySelector('p');
        return {
            p,
            firstText: p.childNodes[0],
        };
    },
    test(target, snapshots, consoleCalls) {
        const hydratedSnapshots = this.snapshot(target);

        expect(snapshots.p).toBe(hydratedSnapshots.p);
        expect(snapshots.firstText).toBe(hydratedSnapshots.firstText);

        expect(consoleCalls.error).toHaveSize(0);
        expect(consoleCalls.warn).toHaveSize(0);
    },
};
