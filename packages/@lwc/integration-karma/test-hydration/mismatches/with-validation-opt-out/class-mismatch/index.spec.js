export default {
    snapshot(target) {
        return {
            classes: target.shadowRoot.firstChild.firstChild.className,
        };
    },
    test(target, snapshots, consoleCalls) {
        const hydratedSnapshot = this.snapshot(target);
        expect(hydratedSnapshot.classes).toBe(snapshots.classes);
        expect(consoleCalls.error).toHaveSize(0);
    },
};
