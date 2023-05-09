export default {
    props: {
        isServer: true,
    },
    clientProps: {
        isServer: false,
    },
    snapshot(target) {
        return {
            childMarkup: target.shadowRoot.firstChild.firstChild.shadowRoot.innerHTML,
        };
    },
    test(target, snapshots, consoleCalls) {
        const hydratedSnapshot = this.snapshot(target);
        expect(hydratedSnapshot.childMarkup).not.toBe(snapshots.childMarkup);

        expect(consoleCalls.error).toHaveSize(2);
        expect(consoleCalls.error[0][0].message).toContain(
            'Hydration mismatch: incorrect number of rendered nodes. Client produced more nodes than the server.'
        );
        expect(consoleCalls.error[1][0].message).toContain('Hydration completed with errors.');
    },
};
