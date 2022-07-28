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
    test(target, snapshots) {
        const hydratedSnapshot = this.snapshot(target);

        expect(hydratedSnapshot.text).not.toBe(snapshots.text);

        // FIXME: The error message changed with snapshots
        // expect(consoleCalls.error).toHaveSize(2);
        // expect(consoleCalls.error[0][0].message).toContain(
        //     'Server rendered more nodes than the client.'
        // );
        // expect(consoleCalls.error[1][0].message).toContain('Hydration completed with errors.');
    },
};
