export default {
    props: {
        control: true,
    },
    snapshot(target) {
        return {
            p: target.shadowRoot.querySelector('p'),
        };
    },
    test(target, snapshots) {
        expect(target.shadowRoot.querySelector('p')).toBe(snapshots.p);

        target.control = false;

        return Promise.resolve().then(() => {
            expect(target.shadowRoot.querySelector('p')).toBeNull();
        });
    },
};
