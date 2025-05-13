export default {
    snapshot(target) {
        return {
            childSignalValue: target.shadowRoot
                .querySelector('x-child')
                .shadowRoot.querySelector('p').textContent,
            parentSignalValue: target.shadowRoot.querySelector('p').textContent,
        };
    },
    test(target, snapshots, consoleCalls) {
        const hydratedSnapshot = this.snapshot(target);
        //expect(snapshots.childSignalValue).toBe('initial value');
        expect(hydratedSnapshot.childSignalValue).toBe(snapshots.childSignalValue);
        expect(hydratedSnapshot.parentSignalValue).toBe(snapshots.parentSignalValue);

        TestUtils.expectConsoleCallsDev(consoleCalls, {
            error: [],
            warn: [],
        });
    },
};
