export default {
    props: {
        control: false,
    },
    snapshot(target) {
        return {
            p: target.shadowRoot.querySelector('p'),
        };
    },
    test(target, snapshots) {
        expect(target.shadowRoot.querySelector('p')).toBe(snapshots.p);

        target.control = true;

        return Promise.resolve().then(() => {
            expect(target.shadowRoot.querySelector('p')).toBeNull();
        });
    },
};
