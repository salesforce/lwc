export default {
    snapshot(target) {
        const inputs = target.shadowRoot.querySelectorAll('input');
        return {
            inputs,
        };
    },
    test(target, snapshots, consoleCalls) {
        const inputs = target.shadowRoot.querySelectorAll('input');

        expect(inputs.length).toBe(snapshots.inputs.length);
        for (let i = 0; i < inputs.length; i++) {
            expect(inputs[i]).toBe(snapshots.inputs[i]);
        }

        expect(consoleCalls.warn).toHaveSize(0);
        expect(consoleCalls.error).toHaveSize(0);
    },
};
