export default {
    props: {
        colors: ['red', 'blue', 'green'],
    },
    clientProps: {
        colors: ['red', 'blue'],
    },
    snapshot(target) {
        return {
            text: target.shadowRoot.firstChild.innerText,
        };
    },
    test(target, snapshots, consoleCalls) {
        const hydratedSnapshot = this.snapshot(target);

        expect(hydratedSnapshot.text).not.toBe(snapshots.text);

        expect(consoleCalls.error).toHaveSize(2);
        expect(consoleCalls.error[0][0].message).toContain(
            '[LWC error]: Hydration mismatch: incorrect number of rendered nodes, expected 2 but found 3.'
        );
        expect(consoleCalls.error[1][0]).toContain('Recovering from error while hydrating');
    },
};
