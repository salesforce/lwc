// NOTE: Disconnected callback is not triggered by Node.remove, see: https://github.com/salesforce/lwc/issues/1102
// That's why we trick it by removing a component via the diffing algo.
export default {
    props: {
        slotText: 'initial',
    },
    snapshot(target) {
        const cmpWithSlot = target.querySelector('x-with-slots');
        const cmpWithSlotParagraphs = cmpWithSlot.querySelectorAll('p');

        return {
            withSlot: cmpWithSlot,
            cmpWithSlotParagraphs,
        };
    },
    test(target, snapshots) {
        const snapshotAfterHydration = this.snapshot(target);

        expect(snapshotAfterHydration.withSlot).toBe(snapshots.withSlot);
        expect(snapshotAfterHydration.cmpWithSlotParagraphs).toHaveSize(3);
        expect(snapshotAfterHydration.cmpWithSlotParagraphs).toEqual(
            snapshots.cmpWithSlotParagraphs
        );

        // let's verify handlers
        snapshotAfterHydration.cmpWithSlotParagraphs[0].click();
        snapshotAfterHydration.cmpWithSlotParagraphs[1].click();

        expect(snapshotAfterHydration.withSlot.timesHandlerIsExecuted).toBe(2);
    },
};
