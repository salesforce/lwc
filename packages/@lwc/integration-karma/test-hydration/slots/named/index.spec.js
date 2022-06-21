// NOTE: Disconnected callback is not triggered by Node.remove, see: https://github.com/salesforce/lwc/issues/1102
// That's why we trick it by removing a component via the diffing algo.
export default {
    props: {
        slotText: 'initial',
    },
    snapshot(target) {
        const cmpWithSlot = target.shadowRoot.querySelector('x-with-slots');
        const cmpWithSlotParagraphs = cmpWithSlot.shadowRoot.querySelectorAll('p');
        const [mainText, secondText] = cmpWithSlot.querySelectorAll('span');

        return {
            withSlot: cmpWithSlot,
            mainText,
            secondText,
            cmpWithSlotParagraphs,
        };
    },
    test(target, snapshots) {
        const snapshotAfterHydration = this.snapshot(target);

        expect(snapshotAfterHydration.withSlot).toBe(snapshots.withSlot);
        expect(snapshotAfterHydration.mainText).toBe(snapshots.mainText);
        expect(snapshotAfterHydration.secondText).toBe(snapshots.secondText);
        expect(snapshotAfterHydration.cmpWithSlotParagraphs).toEqual(
            snapshots.cmpWithSlotParagraphs
        );

        expect(snapshotAfterHydration.mainText.textContent).toBe('initial');

        // let's verify handlers
        snapshotAfterHydration.mainText.click();
        snapshotAfterHydration.cmpWithSlotParagraphs[0].click();

        expect(target.timesHandlerIsExecuted).toBe(1);
        expect(snapshotAfterHydration.withSlot.timesHandlerIsExecuted).toBe(1);

        target.slotText = 'changed';

        return Promise.resolve().then(() => {
            const lateSnapshot = this.snapshot(target);

            expect(lateSnapshot.mainText.textContent).toBe('changed');
        });
    },
};
