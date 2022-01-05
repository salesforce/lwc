export default {
    props: {
        control: false,
    },
    snapshot(target) {
        return {
            p: target.querySelector('p'),
        };
    },
    test(target, snapshots) {
        expect(target.querySelector('p')).toBe(snapshots.p);

        target.control = true;

        return Promise.resolve().then(() => {
            expect(target.querySelector('p')).toBeNull();
        });
    },
};
