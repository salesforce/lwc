/** @type {import('../../../configs/plugins/test-hydration.js').TestConfig} */
export default {
    props: {},
    snapshot(target) {
        const div = target.shadowRoot.querySelector('div');

        return {
            div,
        };
    },
    test(target, snapshots) {
        const snapshotAfterHydration = this.snapshot(target);
        expect(snapshotAfterHydration.div).toBe(snapshots.div);

        // verify handler
        snapshotAfterHydration.div.click();
        expect(target.timesClickedHandlerIsExecuted).toBe(1);
        snapshotAfterHydration.div.dispatchEvent(new CustomEvent('foo'));
        expect(target.timesFooHandlerIsExecuted).toBe(1);
    },
};
