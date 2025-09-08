export default {
    props: {},
    snapshot(target) {
        const button = target.shadowRoot.querySelector('button');

        return {
            button,
        };
    },
    test(target, snapshots) {
        const snapshotAfterHydration = this.snapshot(target);
        expect(snapshotAfterHydration.button).toBe(snapshots.button);

        // verify handler
        snapshotAfterHydration.button.click();
        expect(target.timesHandlerIsExecuted).toBe(1);
    },
};
